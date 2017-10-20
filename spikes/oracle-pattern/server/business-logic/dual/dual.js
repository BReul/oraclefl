"use strict";
const { create, env } = require('sanctuary');
const { env: flutureEnv } = require('fluture-sanctuary-types');
const F = require('fluture');
const S = create({ checkTypes: false, env: env.concat(flutureEnv) });

const dualDA = require('../../data-access/dual/dual');
const {withConnection} = require('../../data-access/oracle-executer');
const { applySchema, formatBinding } = require('../data-helpers');

const dualAsOneSchema = {
    one: joi.number().required()
}

const getFromDualById = (oracle, id) =>
    S.pipe([
        dualDA.getFromDualById,
        withConnection(oracle).executeSingle,
        F.map(applySchema(dualAsOneSchema))
    ])(id);

module.exports = Object.freeze({
    getFromDualById
});
