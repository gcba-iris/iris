/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const MiniSignals = require('mini-signals');
const Threads = require('threads');
const shortid = require('shortid');
const fs = require('graceful-fs')

shortid.characters('0123456789$_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

class Dispatcher {
    constructor() {
        this._config = {}; // TODO: Set defaults
        this._tags = {};
        this._signals = new MiniSignals();
        this._threadPool = undefined;
    }

    get tags() {
        return this._tags;
    }

    set config(options) {
        // TODO: Check options
        this._config = options;

        this._createThreadPool(this._config);
        this._processFlows(this._config);
        this._generateJob(this._tags);
        this._threadPool.run('./tmp/job');
    }

    dispatch(data) {
        // Send job to threadpool
        this._threadPool.send(data);
    }

    respond(response) {
        // TODO: Implementation
    }

    release() {
        this._threadPool.killAll();
    }

    _createThreadPool(options) {
        if (!this._threadPool) {
            this._threadPool = new Threads.Pool(options.threads);
        }
    }

    _generateJob(tags) {
        const folder = './tmp'; // TODO: Check that the folder exists.
        const fileName = 'job.js';
        const filePath = folder + '/' + fileName;

        const defaultImports = "'use strict';\n\n" + "const parallel = require('fastparallel')();\n";
        const beginRequire = " = require('";
        const endRequire = "');\n";

        const beginExport = "\nmodule.exports = (data, done) => {\n" +
            "    switch (data.tag) {\n";
        const endExport = "    }\n" + "};\n";

        const beginCase = "        case '";
        const continueCase_1 = "':\n" + "            parallel({}, [";
        const continueCase_2 = "], data, () => {});\n\n" +
            "            let response = ";
        const endCase = "            break;\n";

        const beginIf = ".handle(data);\n" +
            "            if (response) {\n" +
            "                parallel({}, [";
        const endIf = "], response, () => {});\n" +
            "                done(response, data.tag, data.meta);\n" +
            "            }\n";

        var job = defaultImports;
        const cases = [];
        const dependencies = {};

        for (let property in tags) {
            if (tags.hasOwnProperty(property)) {
                let paths = {};
                let handlerPath = tags[property].flow.handler.path;
                let runnablesInput = [];
                let runnablesOutput = [];

                paths[handlerPath] = '_' + shortid.generate();
                dependencies['const ' + paths[handlerPath] + beginRequire + handlerPath + endRequire] = true;

                tags[property].inputHooks.forEach(function (hookPath) {
                    if (!paths[hookPath]) {
                        paths[hookPath] = '_' + shortid.generate();
                        dependencies['const ' + paths[hookPath] + beginRequire + hookPath + endRequire] = true;
                    }

                    runnablesInput.push(paths[hookPath] + '.run');
                }, this);

                tags[property].outputHooks.forEach(function (hookPath) {
                    if (!paths[hookPath]) {
                        paths[hookPath] = '_' + shortid.generate();
                        dependencies['const ' + paths[hookPath] + beginRequire + hookPath + endRequire] = true;
                    }

                    runnablesOutput.push(paths[hookPath] + '.run');
                }, this);

                cases.push({
                    tag: property,
                    handler: paths[handlerPath],
                    runnablesInput: runnablesInput.join(', '),
                    runnablesOutput: runnablesOutput.join(', ')
                });
            }
        }

        job += Object.keys(dependencies).join('') + beginExport;

        cases.forEach(function (element) {
            job += beginCase + element.tag + continueCase_1 + element.runnablesInput + continueCase_2;
            job += element.handler + beginIf + element.runnablesOutput + endIf + endCase;
        }, this);

        job += endExport;

        fs.writeFileSync(filePath, job);
    }

    _processFlows(options) {
        options.flows.forEach(function (flow) {
            const container = {
                flow: flow,
                inputHooks: [],
                outputHooks: []
            };

            flow.inputHooks.forEach(function (hook) {
                container.inputHooks.push(hook.path);
            }, this);

            flow.outputHooks.forEach(function (hook) {
                container.outputHooks.push(hook.path);
            }, this);

            this._tags[flow.tag] = container;
        }, this);
    }
}

module.exports = new Dispatcher();