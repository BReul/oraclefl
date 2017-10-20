"use strict";
const {
    buildSelectStatement, buildSelectAllStatement, buildProcedure, BIND_OUT_NUMBER
} = require('./../oracle-executer');
const queries = require('./settlement-queries');
const {getStatementDecorations} = require('./../oracle-helpers');

const getFromDualById = function (id) {
    return buildSelectStatement(queries.getFromDualById, {id: 1});
};
module.exports = Object.freeze({
    getFromDualById
});
