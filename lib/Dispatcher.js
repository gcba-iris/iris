/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const shortid = require('shortid');
const fs = require('graceful-fs');

shortid.characters('0123456789$_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

class Dispatcher {
    constructor() {
        this._config = {}; // TODO: Set defaults
        this._tags = {};
        this._docks = {};
        this._threadPool = null;
    }

    get tags() {
        return this._tags;
    }

    set config(options) {
        // TODO: Check options
        this._config = options;

        this._processFlows(this._config);
        this._generateJob(this._tags);
        this._loadJob();
    }

    set threadPool(pool) {
        this._threadPool = pool;
    }

    dispatch(data, callback) {
        this._threadPool
            .send(data)
            .on('done', function (response) {
                this.respond(response);

                // TODO: Validate callback
                if (callback) {
                    callback(response.message);
                }
            }.bind(this));
    }

    respond(response) {
        if (response) this._docks[response.meta.dock].reply(response);
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

            flow.docks.forEach(function (dock) {
                this._docks[dock.id] = dock;
            }, this);

            this._tags[flow.tag] = container;
        }, this);
    }

    _generateJob(tags) {
        const fileName = '.iris';

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
                dependencies['const ' + paths[handlerPath] + requireParts[0] + handlerPath + requireParts[1]] = true;

                tags[property].inputHooks.forEach(function (item) {
                    if (!paths[item]) {
                        paths[item] = '_' + shortid.generate();
                        dependencies['const ' + paths[item] + requireParts[0] + item + requireParts[1]] = true;
                    }

                    runnablesInput.push(paths[item] + '.run');
                }, this);

                tags[property].outputHooks.forEach(function (item) {
                    if (!paths[item]) {
                        paths[item] = '_' + shortid.generate();
                        dependencies['const ' + paths[item] + requireParts[0] + item + requireParts[1]] = true;
                    }

                    runnablesOutput.push(paths[item] + '.run');
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

        fs.writeFileSync(fileName, job);
    }

    _loadJob() {
        this._threadPool.run('.iris')
            .on('error', function (job, error) {
                console.error('Job errored:', job);
            }.bind(this));
    }
}

module.exports = new Dispatcher();