const {curry, isEmpty, isNil} = require('ramda');
const path = require('path');
const S = require('sanctuary');


const hasNoResult = function (item) {
    return (isNil(item) || isEmpty(item));
};

//  :: (ctx, Either Error _) -> throw Error
const handleFailure = curry(function (ctx, leftValue) {
    console.error(path.basename(__filename),
        "route-handler",
        (!isNil(leftValue.message)) ? leftValue.message : "",
        {
            "url": ctx.url,
            "error": leftValue
        }
    );
    ctx.throw(500, "An internal error has occurred.");
});

// :: (ctx, Either _ Success) -> {body:result}
const handleSuccess = curry(function (ctx, rightValue) {
    if (hasNoResult(rightValue)) {
        ctx.status = 204;
        ctx.body = {};
    } else {
        ctx.status = 200;
        ctx.body = rightValue;
    }
});

//  ctx -> Either failure success -> {body:result} | THROW some error
const handleResult = (ctx) => (res) => S.either(handleFailure(ctx), handleSuccess(ctx), res);

module.exports = Object.freeze({
    handleResult
})