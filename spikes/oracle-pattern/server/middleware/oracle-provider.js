"use strict";

const oracledb = require('oracledb');

const oracleProviderMiddleware = (oracleConfig) => {
    oracledb.outFormat = oracledb.OBJECT;
    if (oracleConfig) oracleConfig._enableStats = true;

    oracledb.createPool(oracleConfig)
        .then(() => Winston.info('Pool created'))
        .catch(err => Winston.error('Error creating pool: ', err.message));

    return async function (ctx, next) {
        try {
            Winston.debug('Attempting to get an oracledb connection');
            ctx.oracle = await oracledb.getConnection();
            Winston.debug('Retrieved oracle connection');
            await next();
        } catch (err) {
            throw err;
        } finally {
            if (ctx.oracle) {
                // oracledb.getPool()._logStats();
                ctx.oracle.close();
                Winston.debug('Closed oracle connection');
            }
        }
    };
};
module.exports.oracleProviderMiddleware = oracleProviderMiddleware;

