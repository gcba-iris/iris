/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Liftoff = require('liftoff');
const Vantage = require('vantage');

var Iris = new Liftoff({
    name: 'iris',
    extensions: {
        '.js': null
    },
    v8flags: ['--harmony']
});

Iris.prototype = {
    cli: new Vantage()
};

const start = ( env ) => {
    console.dir( env );
};

Iris.launch({

}, start);

// TODO: Handle termination (destroy threadpool, cleanup, etc)