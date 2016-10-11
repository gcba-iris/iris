#!/usr/bin/env node

/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const LiftOff = require('liftoff');
const Vantage = require('vantage');
const dispatcher = require('../lib/Dispatcher');

const loader = new LiftOff({
    name: 'iris',
    extensions: {
        '.js': null
    },
    v8flags: ['--harmony']
});
const cli = new Vantage();

var iris, config;

const init = (env) => {
    // console.dir(env);

    if (env.configPath) {
        process.chdir(env.configBase);
    } else if (!env.modulePath) {
        // TODO: Prettify logs and messages
        console.log('Local Iris not found.');
        console.log('Try running: npm install iris --save');

        process.exit(1);
    } else {
        // TODO: Prettify logs and messages
        console.log('No Irisfile found.');

        process.exit(1);
    }

    require(env.configPath);

    iris = require(env.modulePath);

    if (iris.flows.length > 0) {
        dispatcher.config = {
            flows: iris.flows,
            threads: iris.config.threads
        };
    } else {
        // TODO: Prettify logs and messages
        console.log('No flows found in Irisfile.');
    }
}

loader.launch({}, init);

// TODO: Handle termination (destroy threadpool, cleanup, etc)