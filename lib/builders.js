const { executeOracle, executeManyOracle } = require('./executers');
const { 
    formatArrayCamelCase,
    formatOneJson,
    formatArray,
    formatOneJsonCamelCase
} = require('./helpers');
const R = require('ramda');

const buildSelectOneStatementCamelCase = executeOracle(formatOneJsonCamelCase);
const buildSelectAllStatementCamelCase = executeOracle(formatArrayCamelCase);
const buildUpdateStatement = executeOracle(R.pick(['rowsAffected']));
const buildUpdateBatchStatement = executeManyOracle(R.pick(['rowsAffected']));
const buildProcedure = executeOracle(R.prop('outBinds'));
const buildSelectOneStatement = executeOracle(formatOneJson);
const buildSelectAllStatement = executeOracle(formatArray);

module.exports = Object.freeze({
    buildSelectOneStatement,
    buildSelectOneStatementCamelCase,
    buildSelectAllStatement,
    buildSelectAllStatementCamelCase,
    buildUpdateStatement,
    buildUpdateBatchStatement,
    buildProcedure
});
