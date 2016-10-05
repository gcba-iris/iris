/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Liftoff = require('liftoff');
const Vantage = require("vantage");

var Iris = new Liftoff({
    processTitle: 'iris',
    moduleName: 'iris',
    configName: 'irisfile',
    extensions: {
        '.js': null
    }
});

Iris.cli = new Vantage();

// TODO: Handle termination (destroy threadpool, cleanup, etc)