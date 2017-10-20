/**
 * Created by tbrown on 10/4/17.
 */

const { request } = require('http')
const { stringify : strignifyQuery } = require('querystring')

const Future = require('fluture')
const {env: flutureEnv} = require('fluture-sanctuary-types');

const {create, env} = require('sanctuary');
const {curry3}  = create({
    checkTypes: process.env.NODE_ENV !== 'production',
    env: env.concat(flutureEnv)
});

const splitUrlIntoHostAndPath = url => {
    const urlParts = url.split('/')
    const hostAndPort = urlParts.shift()
    const hostParts = hostAndPort.split(':')
    const host = hostParts.shift()
    const path = '/' + urlParts.join('/')
    const port = hostParts.shift() || 80
    return {
        host,
        path,
        port
    }
}

const postTo = curry3((url, headers, requestBodyRaw) =>
    Future(function httpPost(reject, resolve) {
        const {host, path, port} = splitUrlIntoHostAndPath(url)
        const requestBody = requestBodyRaw  ;
        headers['Content-Length'] = Buffer.byteLength(requestBody)

        const options = {
            hostname: host,
            path: path,
            port: port,
            method: 'POST',
            headers: headers
        };

        const req = request(options, (res) => {
            let responseBody = ''
            res.setEncoding('utf8');
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => resolve(responseBody));
        });

        req.on('error', reject);

        req.write(requestBody);
        req.end();
    })
)

const postUrlEncodedTo = curry3((url, headers, requestBodyRaw) => {
    headers = headers || {};
    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    return postTo(url, headers, strignifyQuery(requestBodyRaw))
})

module.exports = {
    postTo,
    postUrlEncodedTo
}