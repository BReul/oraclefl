/* eslint-disable array-callback-return */
"use strict";
const R = require('ramda');
const camelCase = require('camelcase-keys');
const { BIND_IN_NUMBER } = require('./bindings');

//const toIsoDate = (d) => d.toISOString().split('T')[0] ;
const hasDate = R.compose(
    R.not,
    R.equals(-1),
    R.indexOf("Date")
);
const transformArray = R.compose(
    R.merge(BIND_IN_NUMBER),
    R.objOf('val')
);
const toIsoDate = R.pipe(
    (dateStr) => new Date(dateStr),
    R.invoker(0, 'toISOString'),
    R.invoker(1, 'split')('T'),
    R.head
);
/**
 * @signature applyOracleBindingOptions :: Array [Objects] -> Array [Objects]
 * @description it takes the array of objects, iterates over checking for arrays as values, and if found,
 * creates a nested object with objBinding additional properties. e.g
 * productIds: [1, 2] -> productIds: { type: 2002, dir: 3001, val: [1, 2] }
 */
const applyOracleBindingOptions = function (binding) {
    return R.mapObjIndexed(function(value, key) {
        if (R.is(Array, value)) {  // array mapping
            return transformArray(value);
        } else if (hasDate(key) && !R.isNil(value)) { // date mapping
            return toIsoDate(value);
        }
        return value;
    }, binding);
};


//hasValidParameters and getStatementDecorations will be redundant when KOA2 and getAll stored-procs are implmented
const hasValidParameter = function (params, checking, type) {
    return (R.has(checking, params) && R.is(type, R.prop(checking, params)) && !R.isEmpty(R.prop(checking, params)));
};

const getStatementDecorations = function (params) {
    if (R.isNil(params) || R.isEmpty(params)) {
        return "";
    }
    const bindings = {orderBy: "", sortOrder: "", offset: "", size: ""};
    if (hasValidParameter(params, "orderBy", String)) {
        bindings.orderBy = " ORDER BY " + R.prop("orderBy", params);
        if (hasValidParameter(params, "sortOrder", String)) {
            // only DESC or ASC are white-listed as valid values
            const orderParam = (R.prop("sortOrder", params)).toUpperCase();
            bindings.sortOrder = (orderParam === "DESC" || orderParam === "ASC") ? " " + orderParam : "";
        }
    }
    if (hasValidParameter(params, "size", Number)) {
        const pageSize = R.prop("size", params);
        // page is only meaningful if a size has been determined
        if (hasValidParameter(params, "page", Number)) {
            const offsetSize = pageSize * (R.prop("page", params) - 1);
            bindings.offset = "OFFSET " + offsetSize + "  ROWS";
        }
        bindings.size = "FETCH NEXT " + pageSize + " ROWS ONLY";
    }
    let statementDecorations = ":orderBy :sortOrder :offset :size";

    R.mapObjIndexed(function (item, key) {
        statementDecorations = R.replace(":" + key, item, statementDecorations);
    }, bindings);

    return statementDecorations;
};

// isNotNil :: * -> Boolean
const isNotNil = R.compose(R.not, R.isNil);

/**
 * @signature formatJsonArray ::  [ Object ] -> [ Object ]
 * @description formats an expected array of result from the SQL response as an array of JSON objects or a single
 * object depending on the returned result
 **/
const formatJsonArray = R.pipe(
    R.prop('rows'),
    R.map(R.filter(isNotNil)),
    R.map(camelCase)
);

// formats an expected single result from the SQL response as a JSON object
const formatOneJson = R.pipe(formatJsonArray, R.head);

module.exports = Object.freeze({
    applyOracleBindingOptions,
    getStatementDecorations,
    formatJsonArray,
    formatOneJson
});
