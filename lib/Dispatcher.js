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
        this._logger = logger;
        this._events = Sparkles('iris');

        this._logger.cli();
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
     * @param {Object} options
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
     * @param {Object} pool
     *
     * @memberOf Dispatcher
     */
    set threadPool(pool) {
        this._threadPool = pool;

        this._logger.silly('Set threadpool instance in dispatcher');
    }

    /**
     * Dispatches the data.
     *
     * @param {Object} data
     * @param {function} callback
     *
     * @memberOf Dispatcher
     */
    dispatch(data, callback) {
        this._logger.verbose('Received data from dock');
        data.meta.flow = this.tags[data.tag].flow.name;

        this._threadPool.send(data).on('done', function (response) {
            this._logger.verbose('Received response from handler');
            this.respond(response);

            if (callback) callback(response.message);
        }
        .bind(this));

        this._emitEvent('dispatch', {data: data});

        this._logger.verbose('Dispatched data to threadpool');
    }

    /**
     * Sends response to the original dock.
     *
     * @param {Object} response
     *
     * @memberOf Dispatcher
     */
    respond(response) {
        if (response) {
            this._docks[response.meta.dock].reply(response);
            this._emitEvent('respond', {data: response});

            this._logger.verbose('Sent response to original dock');
        }
    }

    /**
     * Registers an event handler.
     *
     * @param {string} event
     * @param {function} callback
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
            }
            else {
                const newPool = this._loadJob(event.pool);

                this._logger.verbose('Reloaded compiled flows');

                this._threadPool.on('finished', function () {
                    this._threadPool.killAll();
                    this._threadPool = newPool;

                    this._logger.verbose('Shut down old threadpool');
                }.bind(this));
            }
        }.bind(this));
    }

    /**
     * Emits an event.
     *
     * @param {string} event
     * @param {Object} data
     *
     * @memberOf Dispatcher
     */
    _emitEvent(event, data) {
        if (this._config.events) {
            this._events.emit(event, data);
            this._logger.silly(`Emitted event '${event}'`);
        }
    }

    /**
     * Processes the configuration object.
     *
     * @param {Object} config
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
     * @param {Object} options
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

            if (this.tags[flow.tag]) this._logger.warn('A flow with tag \'' + flow.tag + '\' already exists. Overriding...');

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

            this._logger.silly('\rProcessed flow \'' + flow.tag + '\'');
        }, this);
    }

    /**
     * Writes '.iris' file to disk.
     *
     * @param {string} job
     * @param {string} fileName
     *
     * @memberOf Dispatcher
     */
    _writeJob(job, fileName) {
        try {
            fs.writeFileSync(fileName, job);
        }
        catch (error) {
            process.stdout.write('\n');
            this._logger.error('Error writing compiled flows file');
            this._logger.error(error);
            process.stdout.write('\n');

            this._events.emit('compilationError', {});
        }
    }

    /**
     * Generates '.iris' file.
     *
     * @param {Object} tags
     * @param {string} fileName
     *
     * @memberOf Dispatcher
     */
    _generateJob(tags, fileName) {
        const notice = "// This file is automatically generated. Any changes will be overwritten.\n\n";
        const defaultImports = "'use strict';\n\nconst parallel = require('fastparallel')();\n";
        const requireParts = [" = require('", "');\n"];
        const moduleParts = [
            "\nmodule.exports = (data, done) => {\n    let response;\n\n    switch (data.tag)" +
                    " {\n",
            "    }\n};\n"
        ];
        const caseParts = ["        case '", "':\n            parallel({}, [", "], data, () => {});\n\n            response = ", "            break;\n"];
        const ifParts = [
            ".handle(data);\n\n            if (response) {\n                parallel({}, [", "], response, () => {});\n\n                let message = {message: response, tag" +
                    ": data.tag, meta: data.meta};\n                done(message);\n            }\n  " +
                    "          else done(false);\n\n"
        ];

        const cases = [];
        const dependencies = {};
        const paths = {};
        let job = notice + defaultImports;

        for (const property in tags) {
            if (tags.hasOwnProperty(property)) {
                let handlerPath = tags[property].flow.handler.path;
                let runnablesInput = [];
                let runnablesOutput = [];
                let handlerRequire,
                    inputHookRequire,
                    outputHookRequire;

                paths[handlerPath] = '_' + shortid.generate();
                handlerRequire = 'const ' + paths[handlerPath] + requireParts[0] + handlerPath + requireParts[1];
                dependencies[handlerRequire] = true;

                tags[property].inputHooks.forEach(function (item) {
                    if (!paths[item]) {
                        paths[item] = '_' + shortid.generate();
                        inputHookRequire = 'const ' + paths[item] + requireParts[0] + item + requireParts[1];
                        dependencies[inputHookRequire] = true;
                    }

                    runnablesInput.push(paths[item] + '.run.bind(' + paths[item] + ')');
                }, this);

                tags[property].outputHooks.forEach(function (item) {
                    if (!paths[item]) {
                        paths[item] = '_' + shortid.generate();
                        outputHookRequire = 'const ' + paths[item] + requireParts[0] + item + requireParts[1];
                        dependencies[outputHookRequire] = true;
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

        this._writeJob(job, fileName);
        this._logger.silly('Generated compiled flows file');
    }

    /**
     * Loads the '.iris' file into the threadpool.
     *
     * @param {Object} pool
     * @return {Object} The loaded thread pool
     *
     * @memberOf Dispatcher
     */
    _loadJob(pool) {
        pool
            .run('.iris')
            .on('error', function (flow, error) {
                this._logger.error('[' + flow + ']', error);
            }.bind(this));

        process.stdout.write('\r\x1b[K');
        this._logger.verbose('Loaded compiled flows into threadpool');

        return pool;
    }

    /**
     * Starts a single dock.
     *
     * @param {Dock} dock
     *
     * @memberOf Dispatcher
     */
    _startDock(dock) {
        dock.listen();
        this._logger.verbose('Started dock \'' + dock.name + '\' on port ' + dock.config.port);
    }

    /**
     * Starts every registered dock.
     *
     *
     * @memberOf Dispatcher
     */
    _startAllDocks() {
        for (const dockId in this._docks) {
            if (this._docks.hasOwnProperty(dockId)) this._startDock(this._docks[dockId]);
        }
    }
}

module.exports = new Dispatcher();