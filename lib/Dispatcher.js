/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Sparkles = require('sparkles');
const shortid = require('shortid');
const fs = require('graceful-fs');
const ora = require('ora');
const logger = require('winston');
const utils = require('../lib/utils/utils');

const consoleLog = utils.log;

shortid.characters('0123456789$_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

class Dispatcher {
    /**
     * Creates a Dispatcher instance.
     *
     *
     * @memberOf Dispatcher
     */
    constructor() {
        this._name = 'dispatcher';
        this._config = {};
        this._tags = {};
        this._docks = {};
        this._threadPool = null;
        this._events = Sparkles('iris');
    }

    /**
     * Gets the flows sorted by tag.
     *
     * @readonly
     *
     * @memberOf Dispatcher
     */
    get tags() {
        return this._tags;
    }

    /**
     * Sets the dispatcher's config object.
     *
     *
     * @memberOf Dispatcher
     */
    set config(options) {
        this._config = options;
        this._processConfig(this._config);
    }

    /**
     * Sets the dispatcher's threadpool instance.
     *
     *
     * @memberOf Dispatcher
     */
    set threadPool(pool) {
        this._threadPool = pool;

        logger.silly('Set threadpool instance in dispatcher');
    }

    /**
     * Dispatchs the data.
     *
     * @param {any} data
     * @param {any} callback
     *
     * @memberOf Dispatcher
     */
    dispatch(data, callback) {
        logger.verbose('Received data from dock');
        data.meta.flow = this.tags[data.tag].flow.name;

        this._threadPool
            .send(data)
            .on('done', function (response) {
                logger.verbose('Received response from handler');
                this.respond(response);

                if (callback) {
                    callback(response.message);
                }
            }.bind(this));

        this._emitEvent('dispatch', {
            data: data
        });

        logger.verbose('Dispatched data to threadpool');
    }

    /**
     * Sends response to the original dock;
     *
     * @param {any} response
     *
     * @memberOf Dispatcher
     */
    respond(response) {
        if (response) {
            this._docks[response.meta.dock].reply(response);

            this._emitEvent('respond', {
                data: response
            });

            logger.verbose('Sent response to original dock');
        }
    }

    /**
     * Registers an event handler.
     *
     * @param {any} event
     * @param {any} callback
     *
     * @memberOf Dispatcher
     */
    on(event, callback) {
        this._events.on(event, callback);
    }

    /**
     * Registers internal event handlers.
     *
     *
     * @memberOf Dispatcher
     */
    _registerEventHandlers() {
        this.on('reload', function (event) {
            if (event.module.type === 'dock') {
                event.module._config = event.config;
                this._startDock(event.module);
            } else {
                const newPool = this._loadJob(event.pool);

                logger.verbose('Reloaded compiled flows');

                this._threadPool.on('finished', function () {
                    this._threadPool.killAll();
                    this._threadPool = newPool;

                    logger.verbose('Shut down old threadpool');
                }.bind(this));
            }
        }.bind(this));
    }

    /**
     * Emits an event.
     *
     * @param {any} event
     * @param {any} data
     *
     * @memberOf Dispatcher
     */
    _emitEvent(event, data) {
        if (this._config.events) {
            this._events.emit(event, data);
            logger.silly('Emitted \'' + event + '\' event');
        }
    }

    /**
     * Processes the configuration object.
     *
     * @param {any} config
     *
     * @memberOf Dispatcher
     */
    _processConfig(config) {
        this._spinner = ora('Compiling flows').start();

        this._processFlows(config);
        this._generateJob(this.tags, '.iris');
        this._loadJob.bind(this)(this._threadPool);
        this._registerEventHandlers();

        this._spinner.succeed();
        process.stdout.write('\n');

        this._startAllDocks();
    }

    /**
     * Processes each flow.
     *
     * @param {any} options
     *
     * @memberOf Dispatcher
     */
    _processFlows(options) {
        options.flows.forEach(function (flow) {
            const container = {
                flow: flow,
                inputHooks: [],
                outputHooks: []
            };

            if (this.tags[flow.tag]) logger.warn('Tag \'' + flow.tag + '\' already exists. Overriding...');

            if (flow.inputHooks.length > 0) {
                flow.inputHooks.forEach(function (hook) {
                    container.inputHooks.push(hook.path);
                }, this);
            }

            if (flow.outputHooks.length > 0) {
                flow.outputHooks.forEach(function (hook) {
                    container.outputHooks.push(hook.path);
                }, this);
            }

            flow.docks.forEach(function (dock) {
                this._docks[dock.id] = dock;
            }, this);

            this.tags[flow.tag] = container;

            logger.silly('\rProcessed flow \'' + flow.tag + '\'');
        }, this);
    }

    /**
     * Generates '.iris'' file.
     *
     * @param {any} tags
     * @param {any} fileName
     *
     * @memberOf Dispatcher
     */
    _generateJob(tags, fileName) {
        const notice = "// This file is automatically generated. Any changes will be overwritten.\n\n";
        const defaultImports = "'use strict';\n\nconst parallel = require('fastparallel')();\n";
        const requireParts = [
            " = require('",
            "');\n"
        ];
        const moduleParts = [
            "\nmodule.exports = (data, done) => {\n    var response;\n\n    switch (data.tag) {\n",
            "    }\n};\n"
        ];
        const caseParts = [
            "        case '",
            "':\n            parallel({}, [",
            "], data, () => {});\n\n            response = ",
            "            break;\n"
        ];
        const ifParts = [
            ".handle(data);\n            if (response) {\n                parallel({}, [",
            "], response, () => {});\n\n" +
            "                let message = {message: response, tag: data.tag, meta: data.meta};\n" +
            "                done(message);\n            }\n            else done(false);\n"
        ];

        var job = notice + defaultImports;
        const cases = [];
        const dependencies = {};
        const paths = {};

        for (let property in tags) {
            if (tags.hasOwnProperty(property)) {
                let handlerPath = tags[property].flow.handler.path;
                let runnablesInput = [];
                let runnablesOutput = [];

                paths[handlerPath] = '_' + shortid.generate();
                dependencies['const ' + paths[handlerPath] + requireParts[0] + handlerPath + requireParts[1]] = true;

                tags[property].inputHooks.forEach(function (item) {
                    if (!paths[item]) {
                        paths[item] = '_' + shortid.generate();
                        dependencies['const ' + paths[item] + requireParts[0] + item + requireParts[1]] = true;
                    }

                    runnablesInput.push(paths[item] + '.run.bind(' + paths[item] + ')');
                }, this);

                tags[property].outputHooks.forEach(function (item) {
                    if (!paths[item]) {
                        paths[item] = '_' + shortid.generate();
                        dependencies['const ' + paths[item] + requireParts[0] + item + requireParts[1]] = true;
                    }

                    runnablesOutput.push(paths[item] + '.run.bind(' + paths[item] + ')');
                }, this);

                cases.push({
                    tag: property,
                    handler: paths[handlerPath],
                    runnablesInput: runnablesInput.join(', '),
                    runnablesOutput: runnablesOutput.join(', ')
                });
            }
        }

        job += Object.keys(dependencies).join('') + moduleParts[0];

        cases.forEach(function (item) {
            job += caseParts[0] + item.tag + caseParts[1] + item.runnablesInput + caseParts[2];
            job += item.handler + ifParts[0] + item.runnablesOutput + ifParts[1] + caseParts[3];
        }, this);

        job += moduleParts[1];

        try {
            fs.writeFileSync(fileName, job);
        } catch (error) {
            logger.error('Couldn\'t generate compiled flows file');
            logger.error(error);

            process.exit(1);
        }

        logger.silly('Generated compiled flows file');
    }

    /**
     * Loads the '.iris' file into the threadpool.
     *
     * @param {any} pool
     * @returns
     *
     * @memberOf Dispatcher
     */
    _loadJob(pool) {
        pool.run('.iris')
            .on('error', function (flow, error) {
                logger.error('[' + flow + ']', error);
            }.bind(this));

        logger.verbose('Loaded compiled flows into threadpool');

        return pool;
    }

    /**
     *
     *
     * @param {any} dock
     *
     * @memberOf Dispatcher
     */
    _startDock(dock) {
        dock.listen();
        logger.verbose('Started dock \'' + dock.name + '\' on port ' + dock.config.port);
    }

    /**
     * Starts every registered dock.
     *
     *
     * @memberOf Dispatcher
     */
    _startAllDocks() {
        for (let dockId in this._docks) {
            if (this._docks.hasOwnProperty(dockId)) {
                this._startDock(this._docks[dockId]);
            }
        }
    }
}

module.exports = new Dispatcher();