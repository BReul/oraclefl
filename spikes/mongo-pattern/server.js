/*eslint-disable no-console*/
/*eslint complexity: ["error", 4]*/


"use strict";

// Enable requiring modules relative to server directory
require('app-module-path').addPath(__dirname + '/server');
require('app-module-path').addPath(__dirname);

const
    cluster = require('cluster'),
    koa = require('koa'),
    bodyParser = require('koa-bodyparser'),
    koaStatic = require('koa-static'),
    output = require('./server/middleware/output-filters'),
    path = require('path'),
    views = require('koa-views');

const bootstrapServer = async function (config) {
    const
        routes = require('routes/routes'),
        app = new koa();

    app.use(output.responseTimer);


    // Parse request bodies as JSON
    app.use(bodyParser());

    // Force all valid requests to respond appropriately
    //app.use(output.jsonAcceptNullBody);

    // Print JSON output with optional pretty-printing, and pipe streams into response output
    app.use(output.jsonStreamer({pretty: config.debug}));

    app.use(views('./server/server-side-views', {
        map: { html: 'swig' },
        cache: false
    }));

    app.use(koaStatic(__dirname + '/client', {defer: false}));


    // Add routing to request handlers
    app.use(routes.anonymousRouteMiddleware());



    // Begin
    app.listen(config.port);
};

/**
 * startServer
 * Bootstrap the application.
 *
 * @param config
 * @return Promise
 */
module.exports.startServer = async function (config) {
    await bootstrapServer(config).catch(ex => console.error(ex.stack || ex));
};
