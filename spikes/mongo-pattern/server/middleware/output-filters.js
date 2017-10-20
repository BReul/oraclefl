/*eslint complexity: ["error", 4] */
"use strict";

const
    isJSON = require('koa-is-json'),
    Stringify = require('streaming-json-stringify');

/**
 * jsonFormatter
 * Simplistic middleware layer that pretty prints a json response
 *
 * @author Evan King
 */
module.exports.jsonFormatter = async function (ctx, next) {
    await next();

    if (isJSON(ctx.body)) {
        ctx.body = JSON.stringify(ctx.body, null, 2);
    }
};

/**
 * jsonStreamer
 * Better output handler, dealing with streams and JSON.
 * This is based on koa-json, but correctly handles streams
 * from koa-mongo.  koa-json incorrectly rejects mongo streams
 * as not a stream due to overly-stringent stream test conditions.
 *
 * @author Evan King
 */
module.exports.jsonStreamer = function(options) {
    options = options || {};
    const pretty = options.pretty || false;
    const spaces = options.spaces || 2;

    return async function filter(ctx, next) {
        await next();
        const body = ctx.body;
        const isNotRest = ctx.path.indexOf('rest') < 1 ;

        if(isNotRest) return ctx

        // Pipe stream output through Stringify
        if (body && typeof body.pipe === 'function') {
            ctx.response.type = 'json';
            const stringify = Stringify();

            if (pretty) {
                stringify.space = spaces;
            }
            return ctx.body = body.pipe(stringify);
        }

        // Override JSON output with pretty-printing
        if (pretty && isJSON(body)) {
            return ctx.body = JSON.stringify(body, null, spaces);
        }
    };
};

/**
 * jsonAcceptNullBody
 * Prevent KOA from overriding the status, output, and content-type
 * of valid JSON requests resolving to an empty (null) response.
 * Responses to invalid paths will still return raw text.
 *
 * @author Evan King
 */
module.exports.jsonAcceptNullBody = async function (ctx, next) {
    await next();

    if (ctx.body === null) {
        // Only preserve original status if it's not 204 (no content)
        const originalStatus = (ctx.status == 204) ? 404 : ctx.status;
        ctx.body = 'null';
        ctx.response.type = 'json';
        ctx.status = originalStatus || 404;
    }
};

/**
 * routeNotFound
 * Catch-all middleware based on
 * https://github.com/koajs/examples/blob/master/404/app.js
 *
 * Appears no longer necessary - KOA is now setting appropriate
 * response body and status itself when no route is matched.
 */
module.exports.routeNotFound = async function (ctx, next) {
    await next();

    if (ctx.status != 404) {
        return;
    }


    // we need to explicitly set 404 here
    // so that koa doesn't assign 200|204 on body set
    ctx.body = ctx.path + " not found" ;
    ctx.status = 404;
};

module.exports.responseTimer = async function (ctx, next) {
    const start = Date.now();
    await next();
    const delta = Math.ceil(Date.now() - start);

    console.log(
        ctx.path + '\t' + delta + 'ms;');

    ctx.set('X-Response-Time', delta + 'ms');
};
