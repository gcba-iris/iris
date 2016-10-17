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
const Sparkles = require('sparkles');
const dispatcher = require('../lib/Dispatcher');
const minimist = require('minimist');
const chokidar = require('chokidar');
const ora = require('ora');
const chalk = require('chalk');
const utils = require('../lib/utils/utils');
const args = minimist(process.argv.slice(2));
const consoleLog = utils.log;

const loader = new LiftOff({
    name: 'iris',
    extensions: {
        '.js': null
    },
    v8flags: ['--harmony']
});

const banner =
    `
          _          _            _         _        \r\n         \/\\ \\       \/\\ \\         \/\\ \\      \/ \/\\      \r\n         \\ \\ \\     \/  \\ \\        \\ \\ \\    \/ \/  \\     \r\n         \/\\ \\_\\   \/ \/\\ \\ \\       \/\\ \\_\\  \/ \/ \/\\ \\__  \r\n        \/ \/\\\/_\/  \/ \/ \/\\ \\_\\     \/ \/\\\/_\/ \/ \/ \/\\ \\___\\ \r\n       \/ \/ \/    \/ \/ \/_\/ \/ \/    \/ \/ \/    \\ \\ \\ \\\/___\/ \r\n      \/ \/ \/    \/ \/ \/__\\\/ \/    \/ \/ \/      \\ \\ \\       \r\n     \/ \/ \/    \/ \/ \/_____\/    \/ \/ \/   _    \\ \\ \\      \r\n ___\/ \/ \/__  \/ \/ \/\\ \\ \\  ___\/ \/ \/__ \/_\/\\__\/ \/ \/      \r\n\/\\__\\\/_\/___\\\/ \/ \/  \\ \\ \\\/\\__\\\/_\/___\\\\ \\\/___\/ \/       \r\n\\\/_________\/\\\/_\/    \\_\\\/\\\/_________\/ \\_____\\\/\n\n
    `;

const load = (env) => {
    var spinner = ora('Loading local package');

    process.stdout.write(chalk.dim(banner));
    spinner.start();

    if (!env.modulePath) {
        spinner.fail();
        consoleLog.error('Local Iris not found.');
        consoleLog.error('Try running: npm install iris --save');

        process.exit(1);
    }

    spinner.succeed();
    spinner = ora('Loading Irisfile').start();

    if (env.configPath) {
        process.chdir(env.configBase);
        spinner.succeed();
    } else {
        spinner.fail();
        consoleLog.error('No Irisfile found.');

        process.exit(1);
    }
}

const newThreadPool = (config) => {
    return config.threads ? new Threads.Pool(config.threads) : new Threads.Pool();
}

const configureDispatcher = (flows, config, threadPool) => {
    dispatcher.threadPool = threadPool;
    dispatcher.config = {
        flows: flows,
        events: config.events
    };
}

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
    const logger = require('winston');

    require("nodejs-dashboard");
    cliCursor.hide();
}

const init = (env) => {
    var iris, config, threadPool, events, watcher;

    load(env);
    require(env.configPath);
    iris = require(env.modulePath);

    threadPool = newThreadPool(iris.config);
    events = Sparkles('iris');
    watcher = chokidar.watch(iris.modules, {
            ignored: /[\/\\]\./,
            persistent: true
        })
        .on('change', (path) => {
            events.emit('reload', {
                pool: newThreadPool(iris.config)
            });
        })
        .on('error', (error) => consoleLog.error(`Watcher error: ${error}`));

    if (iris.flows.length > 0) {
        configureDispatcher(iris.flows, iris.config, threadPool);
        vantage(iris.config);
        cli();
    } else {
        consoleLog.error('No flows found in Irisfile.');
    }
}

loader.launch({}, init);