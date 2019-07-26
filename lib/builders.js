const { executeOracle, executeManyOracle } = require('./executers');
const { formatJsonArray, formatOneJson } = require('./helpers');
const R = require('ramda');

const buildSelectOneStatement = executeOracle(formatOneJson);
const buildSelectAllStatement = executeOracle(formatJsonArray);
const buildUpdateStatement = executeOracle(R.pick(['rowsAffected']));
const buildUpdateBatchStatement = executeManyOracle(R.pick(['rowsAffected']));
const buildProcedure = executeOracle(R.prop('outBinds'));

module.exports = Object.freeze({
    buildSelectOneStatement,
    buildSelectAllStatement,
    buildUpdateStatement,
    buildUpdateBatchStatement,
    buildProcedure
});
