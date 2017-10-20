/* eslint-disable array-callback-return */
"use strict";
const R = require('ramda');
const Joi = require('joi');
const {create, env} = require('sanctuary');
const {env: flutureEnv} = require('fluture-sanctuary-types');
const S = create({checkTypes: false, env: env.concat(flutureEnv)});

// notNil :: * -> Boolean
const notNil = R.compose(R.not, R.isNil);

// validateSchema :: curry values into the Joi validate method
const validateSchema = R.curry((schema, binding) =>
    Joi.validate(binding, schema, {stripUnknown: true}));

// apply the Joi schema to a request binding so defaulting is applied
const formatBinding = (joiSchema) => R.compose(
    R.prop('value'),
    validateSchema(joiSchema)
);

// apply the Joi schema to an Oracle response to strip nulls in preparation as a response
const applySchema = R.curry(function (schema, results) {
    const formattedResults = [];
    let stripArray = false;

    if (!R.is(Array, results.value)) {
        results = [results];
        stripArray = true;
    }
    S.map(R.map(function (item) {
        item = Joi.validate(item, schema, {stripUnknown: true});
        if (item.error === null) {
            formattedResults.push(item.value);
        }
    }), results);
    if (stripArray) {
        return S.Right(R.head(formattedResults));
    }
    return S.Right(formattedResults);
});

// parseFields ::  parse array (pick list passed to the fn) fields to JSON
// parseFields ::  [String] -> Object -> Object
const parseFields = listOfFields => R.converge(
    R.merge,
    [
        R.compose(
            R.map(JSON.parse),
            R.pick(listOfFields)
        ),
        R.omit(listOfFields)
    ]
);

// parseFieldsToJson :: [String] -> Object -> Boolean
const parseFieldsToJson = list => R.when(
    notNil,
    parseFields(list)
);

module.exports = Object.freeze({
    parseFieldsToJson,
    applySchema,
    formatBinding
});
