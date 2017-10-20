/*eslint complexity: ["error", 4] */
"use strict";

const
    isJSON = require('koa-is-json'),
    Stringify = require('streaming-json-stringify');

module.exports.jsonFormatter = async function (ctx, next) {
    await next();

    if (isJSON(ctx.body)) {
        ctx.body = JSON.stringify(ctx.body, null, 2);
    }
};

module.exports.jsonStreamer = function(options) {
    options = options || {};
    const pretty = options.pretty || false;
    const spaces = options.spaces || 2;

    return async function filter(ctx, next) {
        await next();
        const body = ctx.body;

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

module.exports.routeNotFound = async function (ctx, next) {
    await next();

    if (ctx.status != 404) {
        return;
    }

    // we need to explicitly set 404 here
    // so that koa doesn't assign 200|204 on body set
    ctx.body = "Not found";
    ctx.status = 404;
};

let responseCount = 0;
let avgResponse = 0;
module.exports.responseTimer = async function (ctx, next) {
    const start = Date.now();
    await next();
    const delta = Math.ceil(Date.now() - start);

    avgResponse = (avgResponse * responseCount++ + delta) / responseCount;
    Winston.debug(
        "response: " + delta + 'ms;' +
        " avg: " + Math.round(avgResponse) + "ms"
    );

    ctx.set('X-Response-Time', delta + 'ms');
};

let memCount = 0;
let avgMem = 0;
let peakMem = 0;

module.exports.memoryUsage = async function (ctx, next) {
    await next();
    const mem = process.memoryUsage().rss / (1024 * 1024);

    avgMem = (avgMem * memCount++ + mem) / memCount;
    peakMem = Math.max(peakMem, mem);
    Winston.debug(
        "mem: " + Math.round(mem) + 'MB;' +
        " avg: " + Math.round(avgMem) + "MB;" +
        " peak: " + Math.round(peakMem) + "MB;"
    );
};
