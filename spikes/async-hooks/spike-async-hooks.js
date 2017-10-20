const async_hooks = require('async_hooks');
const fs = require('fs')

let indent = 0;
// async_hooks.createHook({
//     init(asyncId, type, triggerId, obj) {
//         const cId = async_hooks.currentId();
//         fs.writeSync(1, ' '.repeat(indent) +
//             `${type}(${asyncId}): trigger: ${triggerId} scope: ${cId}\n`);
//     },
//     before(asyncId) {
//         fs.writeSync(1, ' '.repeat(indent) + `before:  ${asyncId}\n`);
//         indent += 2;
//     },
//     after(asyncId) {
//         indent -= 2;
//         fs.writeSync(1, ' '.repeat(indent) + `after:   ${asyncId}\n`);
//     },
//     destroy(asyncId) {
//         fs.writeSync(1, ' '.repeat(indent) + `destroy: ${asyncId}\n`);
//     },
// }).enable();


const hookInfo = {}
const getName = obj => {
    return (obj.callback.name.length) ?
        obj.callback.name :
        obj.callback.toString()
}

async_hooks.createHook({
    init(asyncId, type, triggerId, obj) {
        hookInfo[asyncId] = type

        const name = (type != 'TickObject') ? '' : getName(obj)

        if(type == 'TCPCONNECTWRAP' || type == 'TCPWRAP' || type == 'HTTPPARSER') {
            const t = 10 ;
        }

        fs.writeSync(1, `INIT id: ${asyncId} trigger: ${triggerId} scope: ${async_hooks.currentId()} ${type} ${name}\n`);
    },
    before(asyncId) {
        fs.writeSync(1, `BEFR id: ${asyncId} (${hookInfo[asyncId]})\n`);
    },
    after(asyncId) {
        fs.writeSync(1, `AFTR id: ${asyncId} (${hookInfo[asyncId]})\n`);
    },
    destroy(asyncId) {
        fs.writeSync(1, `DEST id: ${asyncId} (${hookInfo[asyncId]})\n`);
    },
}).enable();

// const tryThis = function(a) {
//     console.log(a)
//     return a
// }
//
// console.log( tryThis(10) )
//
// process.exit(0)

new Promise(function (resolve) {
    setTimeout(function () {
        fs.writeSync(1, 'A) ' + ' '.repeat(indent) + `current id at resolve: ${async_hooks.currentId()}\n`);
        fs.writeSync(1, 'A) ' + ' '.repeat(indent) + `trigger id at resolve: ${async_hooks.triggerId()}\n`);
        resolve();
    });
}).then(() => {
    async_hooks.triggerId()
    fs.writeSync(1, 'B) ' + ' '.repeat(indent) + `current id in then: ${async_hooks.currentId()}\n`);
    fs.writeSync(1, 'B) ' + ' '.repeat(indent) + `trigger id in then: ${async_hooks.triggerId()}\n`);
});