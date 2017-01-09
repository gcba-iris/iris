#!/usr/bin/env node

'use strict';

/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

const LiftOff = require('liftoff');
const Threads = require('threads');
const Sparkles = require('sparkles');
const dispatcher = require('../lib/Dispatcher');
const chokidar = require('chokidar');
const decache = require('decache');
const ora = require('ora');
const logger = require('winston');
const minimist = require('minimist');
const cliCursor = require('cli-cursor');
const cliCommands = require('../lib/utils/cli');
const utils = require('../lib/utils/utils');

const events = Sparkles('iris');
const args = minimist(process.argv.slice(2));
const consoleLog = utils.log;

const loader = new LiftOff({
    name: 'iris',
    extensions: {
        '.js': null
    },
    v8flags: [
        process.env.STACK_SIZE || '--stack_size=8192',
        process.env.MAX_OLD_SPACE_SIZE || '--max_old_space_size=8192',
        process.env.MAX_NEW_SPACE_SIZE || '--max_new_space_size=2048'
    ]
});

/**
 * Displays an error message and then exits Iris with an error code.
 *
 * @param {string} message
 */
const fail = (message) => {
    process.stdout.write('\n');
    consoleLog.error(message);
    process.stdout.write('\n');

    process.exit(1);
};

/**
 * Runs cli commands.
 *
 * @param {Object} args
 * @return {boolean} Whether to finish execution or not
 */
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
            case 'help':
                cliCommands.help();
                break;
            case 'new':
                cliCommands.new(false);
                break;
            default:
                cliCommands.error(args._[0]);
                break;
        }

        return true;
    }
    else if (keys.length === 1 && args._.length === 2) {
        switch (args._[0]) {
            case 'new':
                cliCommands.new(args._[1]);
                break;
            default:
                cliCommands.error(args._[0]);
                break;
        }

        return true;
    }
    else if (keys.length === 2 && args._.length === 0) {
        switch (keys[1]) {
            case 'version':
                cliCommands.version();
                break;
            default:
                cliCommands.help();
                break;
        }
    }
    else if (keys.length > 1 || args._.length > 0) cliCommands.help();

    return false;
};

/**
 * Loads Irisfile and Iris instance.
 *
 * @param {Object} env
 */
const load = (env) => {
    let spinner = ora('Loading local package');
    let iris;

    consoleLog.info(utils.banner + '\n');
    spinner.start();

    if (!env.modulePath) {
        spinner.fail();
        fail('Local Iris not found.\nTry running: npm install gcba-iris/iris --save');
    }
    spinner.succeed();

    iris = require(env.modulePath);
    spinner = ora('Loading Irisfile').start();

    if (!env.configPath) {
        spinner.fail();
        fail('No Irisfile found.');
    }

    process.chdir(env.configBase);
    spinner.succeed();

    require(env.configPath);

    return iris;
};

/**
 * Creates a new thread pool.
 *
 * @param {Object} config
 * @return {Object} A new thread pool
 */
const newThreadPool = (config) => {
    logger.verbose('Creating new threadpool');

    return config.threads ? new Threads.Pool(config.threads) : new Threads.Pool();
};

/**
 * Sets up the file watcher.
 *
 * @param {Object} config
 * @return {Object} The Chokidar instance
 */
const newWatcher = (iris) => {
    return chokidar
        .watch(Object.keys(iris.modules), {
            ignored: /[\/\\]\./,
            persistent: true
        })
        .on('change', (path) => {
            logger.verbose('File change detected');

            const config = Object.assign({}, iris.modules[path].config);

            if (iris.modules[path].type === 'dock') {
                const id = iris.modules[path].id;
                const dispatcher = iris.modules[path].dispatcher;

                iris.modules[path].stop();
                decache(path);

                iris.modules[path] = require(path);
                iris.modules[path].id = id;
                iris.modules[path].dispatcher = dispatcher;
            }

            events.emit('reload', {
                pool: newThreadPool(iris.config),
                module: iris.modules[path],
                path,
                config
            });
        })
        .on('error', (error) => consoleLog.error(`Watcher error: ${error}`));
};

/**
 * Configures the Dispatcher instance.
 *
 * @param {Object[]} flows
 * @param {Object} config
 * @param {Object} threadPool
 */
const configureDispatcher = (flows, config, threadPool) => {
    dispatcher.threadPool = threadPool;
    dispatcher.config = {
        events: config.events,
        flows
    };
};

/**
 * Sets error event handlers.
 *
 * @param {Object} env
 */
const setErrorHandlers = () => {
    events
        .on('validationError', () => {
            process.exit(1);
        })
        .on('compilationError', () => {
            process.exit(1);
        });
};

/**
 * Starts Iris.
 *
 * @param {Object} env
 */
const start = (env) => {
    let iris,
        config,
        threadPool,
        watcher;

    iris = load(env);
    threadPool = newThreadPool(iris.config);
    watcher = newWatcher(iris);

    if (iris.flows.length > 0) configureDispatcher(iris.flows, iris.config, threadPool);
    else fail('No flows found in Irisfile.');

    cliCursor.hide();
};

/**
 * Initializes the app in the right mode.
 *
 * @param {Object} env
 */
const init = (env) => {
    logger.cli();

    if (!cli(args)) {
        setErrorHandlers();
        start(env);
    }
};

loader.launch({}, init);