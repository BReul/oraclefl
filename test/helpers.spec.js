const { 
    applyOracleBindingOptions,
    getStatementDecorations,
    formatJsonArray,
    formatOneJson
} = require('../lib/helpers');

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

describe('helpers', () => {
    describe('#formatJsonArray', () => {
        it('should format a standard oracle return as an array of json objects', () => {
            const expected = [
                { colOne: 'val1', colTwo: 'val2' },
                { colOne: 'val3', colTwo: 'val4' }
            ];
            const actual = formatJsonArray(mockDBreturn);
            expect(actual).toEqual(expected);
        });
    });
    describe('#formatOneJson', () => {
        it('should format a standard oracle return and return the first element', () => {
            const expected = { colOne: 'val1', colTwo: 'val2' };
            const actual = formatOneJson(mockDBreturn);
            expect(actual).toEqual(expected);
        });
    });
});