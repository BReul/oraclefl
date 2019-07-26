const oracledb = require('oracledb');

const BIND_OUT_NUMBER = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER, maxSize: 40 };
const BIND_IN_NUMBER = { dir: oracledb.BIND_IN, type: oracledb.NUMBER, maxSize: 40 };
const BIND_IN_STRING = { dir: oracledb.BIND_IN, type: oracledb.STRING, maxSize: 40 };

module.exports = Object.freeze({
	BIND_IN_NUMBER,
	BIND_IN_STRING,
	BIND_OUT_NUMBER
});