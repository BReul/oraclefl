/**
 * Created by tbrown on 7/17/17.
 */

const S = require('sanctuary')
const R = require('ramda')
const { buildFind, withConnection, connect } = require('./../../data-access/mongo-executer');

// invoke f and return o
const sideEffect = f => o => (f(), o) ;


// https://github.com/ramda/ramda/wiki/Cookbook#flatten-a-nested-object-into-dot-separated-key--value-pairs
const flattenObj = obj => {
    const go = obj_ => R.chain(([k, v]) => {
        //if (typeof v == 'object') {
        if (typeof v == 'object' && k != '_id') {
            return R.map(([k_, v_]) => [`${k}.${k_}`, v_], go(v))
        //} else {
        } else if (k != '_id') {
            //return [[k, v]]
            return [[k, 1]] // we don't want to preserve the value we want to count
        } else {
            return []
        }
    }, R.toPairs(obj_))

    return R.fromPairs(go(obj))
}

const sum = (a, b) => a + b

// :: String -> Object -> Record -> Object
const aggregateRecord = (collection) => (agg) => S.pipe([
    // add the collection property and make record sub to it
    R.objOf(collection),
    // build out pathing
    flattenObj,
    // set the count of the collection to be 1
    R.set(R.lensProp(collection), 1),
    // merge with aggregate summing counts
    R.mergeWith(sum, agg)
])

const aggregateRecordSet  = (collection) => S.map(S.reduce(
    // partially apply the collection name to the aggregateRecord reducer so it knows the name
    aggregateRecord(collection),
    // start an empty aggregate object
    {})
)

const findAndClose = (query) => (conn) =>
    withConnection(conn)
        // execute the single find query
        .executeSingle(query)
        // use the side effect function to close the connection,
        //      we need to encapsulate to preserve "this"
        .map(sideEffect(() => conn.close()))

// :: Right({k:v, k1:v1 ...kn:vn}) -> Right([[k1,v1], ...[kn,vn]])
const objectToArray = S.map(R.toPairs)

// :: Right([[k2,v], [k1,v], ...[kn,v]]) -> Right([[k1,v], [k2,v], ...[kn,v]])
const sortByFirstItem = S.map(R.sortBy(R.prop(0)))

const browseObjectsBl = (host, database, collection, skip, limit) => {
    const findStatement = buildFind(collection, {}, {}, skip, limit)

    // connect to the database
    return connect(host, database)
        // execute find and then close the connection
        .chain(findAndClose(findStatement))
        // aggregate the totals
        .map(aggregateRecordSet(collection))
        // convert to array
        .map(objectToArray)
        // Order
        .map(sortByFirstItem)
}

module.exports = Object.freeze({
    browseObjectsBl
})