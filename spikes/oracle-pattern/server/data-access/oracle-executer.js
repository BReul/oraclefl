"use strict";

const {create, env} = require('sanctuary');
const {env: flutureEnv} = require('fluture-sanctuary-types');
const F = require('fluture');
const S = create({checkTypes: false, env: env.concat(flutureEnv)});
const R = require('ramda');
const oracledb = require('oracledb');
const {applyOracleBindingOptions, formatJsonArray, formatOneJson} = require('./oracle-helpers');

const BIND_OUT_NUMBER = {dir: oracledb.BIND_OUT, type: oracledb.NUMBER, maxSize: 40};

// rejectOracleOf :: (String, Object) -> Object -> Either { Left }
const rejectOracleOf = (query, bindings) => (e) => {
    const err = {};
    err.message = e.message;
    err.stack = e.stack;
    err.query = query;
    err.bindings = bindings;
    return F.reject(err);
};

// :: query -> binding -> oracledb -> Future Result
const executeOracle = R.curry((formatter, query, binding, conn) =>
    F.tryP(() => conn.execute(
        query,
        applyOracleBindingOptions(binding),
        {outFormat: oracledb.OBJECT, maxRows: 10000})
    ).map(formatter) // apply a formatter to the successful response
    .chainRej(rejectOracleOf(query, binding)) // wrap the exception from Oracle in a loggable format
);

const buildSelectStatement = executeOracle(formatOneJson);
const buildSelectAllStatement = executeOracle(formatJsonArray);
const buildScalarStatement = executeOracle(R.pick(['rowsAffected']));
const buildProcedure = executeOracle(R.prop('outBinds'));

// execute :: oracleInstance -> {singleQuery, inSeries}
const withConnection = function (oracle) {
    // *************** handling db transaction ***************
    const rollbackAndReject = function (rejValue) {
        return F.tryP(() => oracle.rollback())
            .chain(() => F.reject(rejValue));
    };
    const commitAndSucceed = function (result) {
        return F.tryP(() => oracle.commit()).chain(() => F.of(result));
    };

    const executeSingle = runStatement => {
        oracledb.autoCommit = true;
        return runStatement(oracle).fold(S.Left, S.Right);
    };

    // :: [(oracle->Future{Either err resultSet})] -> Future {Either error [resultSet]}
    const executeInSeries = S.pipe([
        R.tap(() => {
            oracledb.autoCommit = false;
        }), //set autocommit to false
        S.map(S.T(oracle)), //> array of futures [Future{ResultSet}] by applying oracledb to the functions in the array
        F.parallel(1), // executes in series
        F.chainRej(rollbackAndReject), // rollback on future rejection
        F.chain(commitAndSucceed), // commit on future resolve
        F.fold(S.Left, S.Right) // wrap rejected future result in Left. on Succes, transform future result from [Either error resultSet] to Either error [resultSet]
    ]);

    return Object.freeze({executeSingle, executeInSeries});
};


module.exports = Object.freeze({
    buildSelectStatement,
    buildSelectAllStatement,
    buildScalarStatement,
    buildProcedure,
    withConnection,
    BIND_OUT_NUMBER
});
