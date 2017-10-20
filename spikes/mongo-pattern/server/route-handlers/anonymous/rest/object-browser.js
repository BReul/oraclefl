const {handleResult} = require('../../result-handler')
const {browseObjectsBl} = require('../../../business-logic/object-browser/object-browser')

const getObjects = async function(ctx){
    const host = ctx.params.mongo
    const database = ctx.params.database
    const collection = ctx.params.collection
    const skip = parseInt(ctx.query.skip)
    const limit = parseInt(ctx.query.limit) || 100

    await browseObjectsBl(host, database, collection, skip, limit)
        .promise()
        .then(handleResult(ctx))
}

module.exports = Object.freeze({
    getObjects
})