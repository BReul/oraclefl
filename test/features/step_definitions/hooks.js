// features/step_definitions/hooks.js
const { defineSupportCode } = require('cucumber');
const webServerTag = {tags: "@webServer"} ;

defineSupportCode(function({ Before, After }) {
    let koaServer = null ;

    Before(webServerTag, function setupWebServer(scenario, callback){
        const Koa = require('koa')
            , Router = require('koa-router')
            , bodyParser = require('koa-bodyparser')
            , app = new Koa()
            , router = new Router() ;

        router.post('/path/resource', ctx => {
            ctx.body = ctx.request.body
        });

        const bodyOptions = {enableTypes: ['json', 'form', 'text']}
        app.use(bodyParser(bodyOptions)) ;
        app.use(router.routes()) ;

        koaServer = app.listen(3000, callback)
    });

    After(webServerTag, function stopWebServer() {
        if(koaServer){
            koaServer.close()
        }
    });
});