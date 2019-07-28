const { 
    formatArrayCamelCase,
    formatOneJson,
    formatArray,
    formatOneJsonCamelCase
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
    describe('#formatArrayCamelCase', () => {
        it('should format a standard oracle return as an array of json objects', () => {
            const expected = [
                { colOne: 'val1', colTwo: 'val2' },
                { colOne: 'val3', colTwo: 'val4' }
            ];
            const actual = formatArrayCamelCase(mockDBreturn);
            expect(actual).toEqual(expected);
        });
    });
    describe('#formatOneJsonCamelCase', () => {
        it('should format a standard oracle return and return the first element', () => {
            const expected = { colOne: 'val1', colTwo: 'val2' };
            const actual = formatOneJsonCamelCase(mockDBreturn);
            expect(actual).toEqual(expected);
        });
    });
    describe('#formatArray', () => {
        it('should format a standard oracle return but leave the object keys as they are', () => {
            const expected = [
                { col_one: 'val1', col_two: 'val2' },
                { col_one: 'val3', col_two: 'val4' }
            ];
            const actual = formatArray(mockDBreturn);
            expect(actual).toEqual(expected);
        });
    });
    describe('#formatOneJson', () => {
        it('should format a standard oracle return and return the first element leaving the keys as they are', () => {
            const expected = { col_one: 'val1', col_two: 'val2' };
            const actual = formatOneJson(mockDBreturn);
            expect(actual).toEqual(expected);
        });
    });
});