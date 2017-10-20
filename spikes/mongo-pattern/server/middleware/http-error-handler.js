/*eslint complexity: ["error", 10]*/
"use strict";

const R = require('ramda');
const path = require('path');
const HttpError = require('standard-http-error');

function generateLogMsg(method, methodPath, params, ex) {
    return method + ' ' + methodPath + ' ' + JSON.stringify(params) + ' Error: ' + ex.valueOf();
}

const getStatusCode = function(message, statusCode) {
    if (statusCode) {
        return statusCode;
    }
    if (R.equals(R.indexOf("BadRequestError", message), -1)) {
        return 400;
    }
    return 500;
};
/**
 * handleError
 * End the request with an error response based on thrown exception.
 *
 * @author Evan King
 *
 * @param ex Thrown error or exception
 * @param statusCode Http error code, defaults to 500, overrides HttpError code if set
 * @param debug Whether to expose internal errors
 */

module.exports.handleError = function (ctx, ex, statusCode, debug) {
    if (ex instanceof HttpError) {
        statusCode = statusCode || ex.code;
    } else if (ex && ex.stack) {
        // HttpErrors are not system failure, so don't log their stacks
        // console logging only for cleaner output for DEVs to read
        // eslint-disable-next-line no-console
        console.log(ex.stack);
    }

    // We really want a concise string representation, but sometimes objects
    // will force us to choose between [Object object] and JSON (valueOf()).
    const message = typeof ex == "string" ? ex : ex.message;

    // Set the status
    ctx.status = getStatusCode(message, statusCode);

    // End with an error document as body
    ctx.response.type = 'json';
    ctx.body = {
        errorCode: ctx.status,
        errorMessage: message
    };

    // Add any constructor-supplied details from HttpError instances
    if (ex instanceof HttpError) {
        const details = R.omit(['name', 'message', 'code'], ex);
        // Presence of a toString method breaks normal means of determining emptiness
        if (Object.keys(details).length > 1) ctx.body.errorDetails = details;
    } else if (ctx.status == 500) {
        ctx.body.errorMessage = "Internal server error";
        if (debug) {
            ctx.body.errorDetails = ex.valueOf();
        }
    }

    // Log the error
    ctx.logger.error(path.basename(__filename), generateLogMsg(ctx.method, ctx.path, JSON.stringify(ctx.params), ex), '', R.clone(ctx.body.errorDetails));
};

/**
 * middleware
 * Make standard error handling automatic by including this before routing.
 *
 * @author Evan King
 */
module.exports.middleware = function(options) {
    options = options || {};
    return async function (ctx, next) {
        try {
            await next();
        } catch (ex) {
            module.exports.handleError(ctx, ex, null, options.debug);
            if (options.pretty) {
                ctx.body = JSON.stringify(ctx.body, null, 2);
            }
        }
    };
};

/**
 * handleEmpty
 * Set http response code based on presence of content.
 *
 * @author Evan King
 *
 * @param statusCode Http error code, defaults to 404
 */
module.exports.handleEmpty = function(ctx, statusCode) {
    if (!ctx.body || ctx.body == []) {
        ctx.status = statusCode || 404;
    }
};
