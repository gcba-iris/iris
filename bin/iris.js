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
const minimist = require('minimist');
const ora = require('ora');
const chalk = require('chalk');

const args = minimist(process.argv.slice(2));

const loader = new LiftOff({
    name: 'iris',
    extensions: {
        '.js': null
    },
    v8flags: ['--harmony']
});

const banner =
    `
          _          _            _         _        \r\n         \/\\ \\       \/\\ \\         \/\\ \\      \/ \/\\      \r\n         \\ \\ \\     \/  \\ \\        \\ \\ \\    \/ \/  \\     \r\n         \/\\ \\_\\   \/ \/\\ \\ \\       \/\\ \\_\\  \/ \/ \/\\ \\__  \r\n        \/ \/\\\/_\/  \/ \/ \/\\ \\_\\     \/ \/\\\/_\/ \/ \/ \/\\ \\___\\ \r\n       \/ \/ \/    \/ \/ \/_\/ \/ \/    \/ \/ \/    \\ \\ \\ \\\/___\/ \r\n      \/ \/ \/    \/ \/ \/__\\\/ \/    \/ \/ \/      \\ \\ \\       \r\n     \/ \/ \/    \/ \/ \/_____\/    \/ \/ \/   _    \\ \\ \\      \r\n ___\/ \/ \/__  \/ \/ \/\\ \\ \\  ___\/ \/ \/__ \/_\/\\__\/ \/ \/      \r\n\/\\__\\\/_\/___\\\/ \/ \/  \\ \\ \\\/\\__\\\/_\/___\\\\ \\\/___\/ \/       \r\n\\\/_________\/\\\/_\/    \\_\\\/\\\/_________\/ \\_____\\\/\n
    `;

const vantage = (config) => {
    if (config.vantage.enabled) {
        const remoteCli = new Vantage();

        remoteCli
            .delimiter('iris~$')
            .banner(banner)
            .listen(config.vantage.port);
    }
}

const cli = () => {
    const cliCursor = require('cli-cursor');
    require("nodejs-dashboard");

    cliCursor.hide();
}

const init = (env) => {
    var iris, config, threadPool;
    var spinner = ora('Loading local package');

    console.log(banner);
    spinner.start();

    if (!env.modulePath) {
        // TODO: Prettify logs and messages
        spinner.fail();
        console.log('Local Iris not found.');
        console.log('Try running: npm install iris --save');

        process.exit(1);
    }

    spinner.succeed();
    spinner = ora('Loading Irisfile').start();

    if (env.configPath) {
        process.chdir(env.configBase);
        spinner.succeed();
    } else {
        // TODO: Prettify logs and messages
        spinner.fail();
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

        cli();
        vantage(iris.config);
    } else {
        // TODO: Prettify logs and messages
        console.log('No flows found in Irisfile.');
    }
}

loader.launch({}, init);