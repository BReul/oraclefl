const { executeOracle } = require('./executers');
const { formatJsonArray, formatOneJson } = require('./helpers');

const buildSelectStatement = executeOracle(formatOneJson);
const buildSelectAllStatement = executeOracle(formatJsonArray);
const buildScalarStatement = executeOracle(R.pick(['rowsAffected']));
const buildProcedure = executeOracle(R.prop('outBinds'));

module.exports = Object.freeze({
	buildSelectStatement,
	buildSelectAllStatement,
	buildScalarStatement,
	buildProcedure
});
