const Koa = require('koa')
    , Router = require('koa-router')
    , bodyParser = require('koa-bodyparser')
    , app = new Koa()
    , router = new Router() ;

router.post('/path/resource', ctx => {
    console.log('in route')
    ctx.body = ctx.request.body
});

const bodyOptions = {enableTypes: ['json', 'form', 'text']}
app.use(bodyParser(bodyOptions)) ;
app.use(router.routes()) ;

const callback = () => console.log('LISTENING')

let koaServer = app.listen(3000, callback)