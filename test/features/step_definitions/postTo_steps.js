const assert = require('assert') ;

const {create, env} = require('sanctuary');
const {pipe}  = create({
    checkTypes: true, env: env
});

const {defineSupportCode} = require('cucumber');

const assertEqual = a => b => assert.equal(a,b)

defineSupportCode(function({Given, When, Then}) {
    Given('I have required the postTo function',
        function () {
            const http = require('../../../spikes/http-pattern/http-future') ;
            this.postTo = http.postTo ;
        });

    Given('a webServer that supports POST path resource when posted {string} it returns that string',
        function (string) {
            this.postBody = string ;
        });

    When('I execute the function',
        function () {
            this.future = this.postTo(
                'localhost:3000/path/resource',
                {'Content-Type': 'text/plain'},
                this.postBody
            ) ;
        });

    Then('I should see it resolve to {string}',
        function(expected, callback) {

            // string -> unit
            const assertThenCallback = pipe([
                // string -> boolean
                assertEqual(expected)
                // boolean -> unit
                , callback
            ]);

            this.future.fork(
                // future failure -> callback(error)
                callback,
                // future success -> assert -> callback
                assertThenCallback
            );

        });
});