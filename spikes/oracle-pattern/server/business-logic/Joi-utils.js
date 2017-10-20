"use strict";

const R = require('ramda');
const S = require('sanctuary');
const Joi = require('joi');

const joiValOpt = R.curryN(3, (options, schema, obj) => Joi.validate(obj, schema, options));

const getJoiValue = R.compose(S.Right, R.prop('value'));
const getJoiError = R.compose(S.Left, R.prop('error'));
const joiSuccess = R.compose(R.isNil, R.prop('error'));
const joiToEither = R.ifElse(joiSuccess, getJoiValue, getJoiError);

const eitherToBool = S.either(R.F, R.T);

// applyJoi :: JoiSchema -> objectToValidateOrFormat -> Either joiError formattedObject
const applyJoi = R.curry(R.compose(joiToEither, joiValOpt({})));
// applyJoiWithOptions :: JoiSchema -> objectToValidateOrFormat -> Either joiError formattedObject
const applyJoiWithOptions = R.curry(R.compose(joiToEither, joiValOpt));
// passesJoiValidation :: options -> JoiSchema -> objectToValidateOrFormat -> Bool
const passesJoiValidation = R.curry(R.compose(eitherToBool, applyJoiWithOptions));

module.exports = Object.freeze({applyJoi, applyJoiWithOptions, passesJoiValidation});
