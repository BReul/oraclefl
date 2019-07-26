const { executeOracle } = require('./executers');
const { formatJsonArray, formatOneJson } = require('./helpers');
const R = require('ramda');

const buildSelectOneStatement = executeOracle(formatOneJson);
const buildSelectAllStatement = executeOracle(formatJsonArray);
const buildScalarStatement = executeOracle(R.pick(['rowsAffected']));
const buildProcedure = executeOracle(R.prop('outBinds'));

module.exports = Object.freeze({
	buildSelectOneStatement,
	buildSelectAllStatement,
	buildScalarStatement,
	buildProcedure
});
