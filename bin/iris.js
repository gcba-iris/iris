#!/usr/bin/env node

/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Liftoff = require('liftoff');
const Vantage = require('vantage');

const loader = new Liftoff({
    name: 'iris',
    extensions: {
        '.js': null
    },
    v8flags: ['--harmony']
});
const cli = new Vantage();

const init = (env) => {
    console.dir(env);

    if (env.configPath) {
        process.chdir(env.configBase);
    } else if (!env.modulePath) {
        console.log('Local Iris not found.');
        console.log('Try running: npm install iris --save');
        process.exit(1);
    } else {
        console.log('No Irisfile found.');
        process.exit(1);
    }

    const config = require(env.configPath);
    const iris = require(env.modulePath);
}

loader.launch({}, init);

// TODO: Handle termination (destroy threadpool, cleanup, etc)