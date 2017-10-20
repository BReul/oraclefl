"use strict";
const Router = require('koa-router') ;
const { getObjects } = require('../route-handlers/anonymous/rest/object-browser') ;

const index = async function(ctx) {
    ctx.status = 200;
    await ctx.render('index.html');
};

module.exports.anonymousRouteMiddleware = function() {
    const rest = new Router() ;

    rest.get('/', index) ;
    rest.get('/index', index) ;

    rest.get('/rest/collection-density/:mongo/:database/:collection', getObjects) ;

    return rest.middleware() ;
};