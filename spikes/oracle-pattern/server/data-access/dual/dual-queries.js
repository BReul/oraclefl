/**
 * Constants for all queries
 * @type {string}
 */

const getFromDualById = `SELECT 1 as one FROM dual WHERE 1 == :id`;
module.exports = Object.freeze({
    getFromDualById
});
