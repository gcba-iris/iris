#!/usr/bin/env node

/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

require("nodejs-dashboard");

const LiftOff = require('liftoff');
const Threads = require('threads');
const Sparkles = require('sparkles');
const dispatcher = require('../lib/Dispatcher');
const chokidar = require('chokidar');
const ora = require('ora');
const chalk = require('chalk');
const logger = require('winston');
const minimist = require('minimist');
const cliCursor = require('cli-cursor');
const cliCommands = require('../lib/utils/cli');
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

const cli = (args) => {
    const keys = Object.keys(args);

    if (keys.length === 1 && args._.length === 1) {
        switch (args._[0]) {
            case 'status':
                cliCommands.status();
                break;
            case 'init':
                cliCommands.init();
                break;
            case 'config':
                cliCommands.config();
                break;
            default:
                cliCommands.help();
                break;
        }

        return true;
    } else if (keys.length === 1 && args._.length === 2) {
        switch (args._[0]) {
            case 'new':
                cliCommands.new(args._[1]);
                break;
            default:
                cliCommands.help();
                break;
        }

        return true;
    } else if (keys.length > 1 || args._.length > 0) cliCommands.help();

    return false;
};

const load = (env) => {
    var spinner = ora('Loading local package');

    consoleLog.info(utils.banner + '\n');
    spinner.start();

    if (!env.modulePath) {
        spinner.fail();
        consoleLog.error('Local Iris not found.');
        consoleLog.error('Try running: npm install gcba-iris/iris --save');

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
};

const newThreadPool = (config) => {
    logger.verbose('Creating new threadpool');

    return config.threads ? new Threads.Pool(config.threads) : new Threads.Pool();
};

const configureDispatcher = (flows, config, threadPool) => {
    dispatcher.threadPool = threadPool;
    dispatcher.config = {
        flows: flows,
        events: config.events
    };
};

const startIris = (env) => {
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
            logger.verbose('File change detected');

            events.emit('reload', {
                pool: newThreadPool(iris.config)
            });
        })
        .on('error', (error) => consoleLog.error(`Watcher error: ${error}`));

    if (iris.flows.length > 0) {
        configureDispatcher(iris.flows, iris.config, threadPool);
    } else {
        consoleLog.error('No flows found in Irisfile.');

        process.exit(1);
    }
};

const init = (env) => {
    logger.cli();
    cliCursor.hide();

    if (!cli(args)) startIris(env);
};

loader.launch({}, init);