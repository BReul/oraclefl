const {
    executeOracle,
    executeManyOracle,
    withConnection
} = require('../lib/executers');
const { formatOneJson } = require('../lib/helpers');
const { BIND_IN_STRING } = require('../lib/bindings');
const { buildSelectOneStatement } = require('../lib/builders');
const R = require('ramda');
const mockDBreturn = {
    metaData: [
        { name: 'col_one' },
        { name: 'col_two' }
    ],
    rows: [
        {
            col_one: 'val1',
            col_two: 'val2'
        },
        {
            col_one: 'val3',
            col_two: 'val4'
        }
    ]
};
const query = 'Select test from test';
const dbErr = Error('Mock Error');
const updateFormatter = R.pick(['rowsAffected']);

describe('executers', () => {
    describe('#executeOracle', () => {
        it('should wrap the oracle execute function and format the result', (done) => {
            const binding = {};
            const execute = jest.fn(query => Promise.resolve(mockDBreturn));
            const oracle = { execute };
            const expected = { colOne: 'val1', colTwo: 'val2' };
            executeOracle(formatOneJson, query, binding, oracle)
                .done((err, data) => {
                    expect(data).toEqual(expected);
                    done();
                });
        });
        it('should return a formatted error', (done) => {
            const bindings = { bind: 1 };
            const execute = jest.fn(query => Promise.reject(dbErr));
            const oracle = { execute };
            const expected = {
                message: dbErr.message,
                query,
                bindings,
                stack: dbErr.stack
            };
            executeOracle(formatOneJson, query, bindings, oracle)
                .done((err, data) => {
                    expect(err).toEqual(expected);
                    done();
                });
        });
    });
    describe('#executeManyOracle', () => {
        it('should wrap the oracle executeMany function and format the result', (done) => {
            const bindings = [{}];
            const bindDefs = {};
            const executeMany = jest.fn(query => Promise.resolve({ rowsAffected: 2}));
            const oracle = { executeMany };
            const expected = { rowsAffected: 2 };
			
            executeManyOracle(updateFormatter, query, bindings, bindDefs, oracle)
                .done((err, data) => {
                    expect(data).toEqual(expected);
                    done();
                });
        });
        it('should return a formatted error', (done) => {
            const bindings = [
                { id1: 'val1', id2: 'val2' },
                { id1: 'val3', id2: 'val2' }
            ];
            const bindDefs = {
                id1: BIND_IN_STRING,
                id2: BIND_IN_STRING
            };
            const executeMany = jest.fn(query => Promise.reject(dbErr));
            const oracle = { executeMany };
            const expected = {
                message: dbErr.message,
                query,
                bindings,
                stack: dbErr.stack
            };
			
            executeManyOracle(updateFormatter, query, bindings, bindDefs, oracle)
                .done((err, data) => {
                    expect(err).toEqual(expected);
                    done();
                });
        });
    });
    describe('#withConnection', () => {
        describe('#executeSingle', () => {
            const query = 'Select test from test';
            const bindings = {};
            const partiallyApplied = buildSelectOneStatement(query, bindings);
            it('should apply a connection to a query and map the result to the either type', (done) => {
                const execute = jest.fn(query => Promise.resolve(mockDBreturn));
                const expected = { colOne: 'val1', colTwo: 'val2' };
                withConnection({ execute })
                    .executeSingle(partiallyApplied)
                    .done((err, data) => {
                        expect(data.value).toEqual(expected);
                        done();
                    });
            });
            it('should map an error into the either type', (done) => {
                const execute = jest.fn(query => Promise.reject(dbErr));
                const expected = {
                    message: dbErr.message,
                    query,
                    bindings,
                    stack: dbErr.stack
                };
                withConnection({ execute })
                    .executeSingle(partiallyApplied)
                    .done((err, data) => {
                        expect(err.value).toEqual(expected);
                        done();
                    });
            });
        });
        describe('#executeInSeries', () => {
            const query = 'Select test from test';
            const bindings = {};
            const partiallyApplied = buildSelectOneStatement(query, bindings);
            const commit = jest.fn(() => Promise.resolve());
            const rollback = jest.fn(() => Promise.resolve());
            it('should apply a connection to a series of queries and map the result to the either type', (done) => {
                const execute = jest.fn(query => Promise.resolve(mockDBreturn));
                const expected = [
                    { colOne: 'val1', colTwo: 'val2' },
                    { colOne: 'val1', colTwo: 'val2' }
                ];
                withConnection({ execute, commit })
                    .executeInSeries([partiallyApplied, partiallyApplied])
                    .done((err, data) => {
                        expect(data.value).toEqual(expected);
                        done();
                    });
            });
            it('should map an error into the either type', (done) => {
                const execute = jest.fn(query => Promise.reject(dbErr));
                const expected = {
                    message: dbErr.message,
                    query,
                    bindings,
                    stack: dbErr.stack
                };
                withConnection({ execute, rollback })
                    .executeInSeries([partiallyApplied, partiallyApplied])
                    .done((err, data) => {
                        expect(err.value).toEqual(expected);
                        done();
                    });
            });
        });
		
    });
});