const {create, env} = require('sanctuary');
const {env: flutureEnv} = require('fluture-sanctuary-types');
const F = require('fluture');
const S = create({checkTypes: false, env: env.concat(flutureEnv)});
const R = require('ramda');
const MongoClient = require('mongodb').MongoClient;

const mongoClientConnect = R.curry(MongoClient.connect)
const connect = (host, database) => F.node(
    mongoClientConnect('mongodb://' + host + ':27017/' + database, null)
)

const rejectMongoOf = (collection, query, projection) => (e) => {
    const err = {};
    err.message = e.message;
    err.stack = e.stack;
    err.collection = collection
    err.query = query
    err.projection  =projection
    console.error(err)
    return F.reject(err);
};

const skipper = R.invoker(1, 'skip')
const limmiter = R.invoker(1, 'limit')
const toArrayer = R.invoker(1, 'toArray')

const toArray = R.curry(function (skip, limit, cursor) {
    const chain = []
    if(skip) chain.push(skipper(skip))
    if(limit) chain.push(limmiter(limit))

    return new F(function (reject, resolve) {
        const resolver = function (err, xs) {
            if (err) { reject (err); }
            else     { resolve (xs); }
        }

        chain.push(toArrayer(resolver))
        S.pipe(chain)(cursor) ;
    });
})

const executeFind = R.curry(function(collection, query, projection, options, db) {

    const findInCollection = (query, projection) => function(callback)  {
        return db.collection(collection).find(query, projection, callback)
    }

    const rejector = rejectMongoOf(collection, query, projection)

    return F.node(
        findInCollection(query, projection)
    ).chainRej(
        rejector
    ).chain(
        toArray(options.skip, options.limit)
    ) ;
})


const buildFind = function(collection, query, projection, skip, limit){
    return executeFind(collection, query, projection, {skip, limit})
}

const withConnection = function(mongo){

    const Right = (obj) => {
        return S.Right(obj)
    }
    const Left= (obj) => {
        return S.Left(obj)
    }
    const executeSingle = runStatement => {
        return runStatement(mongo).fold(Left, Right);
    };

    return Object.freeze({executeSingle});
}

module.exports = Object.freeze({
    connect,
    buildFind,
    withConnection
});