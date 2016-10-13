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
const Threads = require('threads');
const dispatcher = require('../lib/Dispatcher');

const cli = new Vantage();
const loader = new LiftOff({
    name: 'iris',
    extensions: {
        '.js': null
    },
    v8flags: ['--harmony']
});

var iris, config, threadPool;

const init = (env) => {
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
    threadPool = new Threads.Pool(iris.config.threads);

    if (iris.flows.length > 0) {
        dispatcher.threadPool = threadPool;
        dispatcher.config = {
            flows: iris.flows
        };
    } else {
        // TODO: Prettify logs and messages
        console.log('No flows found in Irisfile.');
    }
}

loader.launch({}, init);