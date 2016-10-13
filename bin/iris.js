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


const banner =
    `
          _          _            _         _        \r\n         \/\\ \\       \/\\ \\         \/\\ \\      \/ \/\\      \r\n         \\ \\ \\     \/  \\ \\        \\ \\ \\    \/ \/  \\     \r\n         \/\\ \\_\\   \/ \/\\ \\ \\       \/\\ \\_\\  \/ \/ \/\\ \\__  \r\n        \/ \/\\\/_\/  \/ \/ \/\\ \\_\\     \/ \/\\\/_\/ \/ \/ \/\\ \\___\\ \r\n       \/ \/ \/    \/ \/ \/_\/ \/ \/    \/ \/ \/    \\ \\ \\ \\\/___\/ \r\n      \/ \/ \/    \/ \/ \/__\\\/ \/    \/ \/ \/      \\ \\ \\       \r\n     \/ \/ \/    \/ \/ \/_____\/    \/ \/ \/   _    \\ \\ \\      \r\n ___\/ \/ \/__  \/ \/ \/\\ \\ \\  ___\/ \/ \/__ \/_\/\\__\/ \/ \/      \r\n\/\\__\\\/_\/___\\\/ \/ \/  \\ \\ \\\/\\__\\\/_\/___\\\\ \\\/___\/ \/       \r\n\\\/_________\/\\\/_\/    \\_\\\/\\\/_________\/ \\_____\\\/

`;

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
        console.log(banner);

        dispatcher.threadPool = threadPool;
        dispatcher.config = {
            flows: iris.flows
        };

        cli.delimiter('iris~$')
            .banner(banner)
            .listen(iris.config.remotePort)
            .show();
    } else {
        // TODO: Prettify logs and messages
        console.log('No flows found in Irisfile.');
    }
}

loader.launch({}, init);