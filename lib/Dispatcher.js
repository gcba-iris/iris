/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const MiniSignals = require('mini-signals');
const FastParallel = require('fastparallel');
const nPool = require('npool');

class Dispatcher {
    constructor() {
        this._config = {}; // TODO: Set defaults
        this._tags = {};
        this._signals = new MiniSignals();
        this._parallel = new FastParallel({
            results: true
        });
        this._threadPool = false;
    }

    get tags() {
        return this._tags;
    }

    set config(options) {
        // TODO: Check options
        // TODO: Build dictionaries and arrays from flow data
        options.flows.forEach(function (flow) {
            const container = {
                flow: flow,
                inputHooks: [],
                outputHooks: []
            };

            container.inputHooks.forEach(function (hook) {
                container.inputHooks.push(hook.run);
            }, this);

            container.outputHooks.forEach(function (hook) {
                container.outputHooks.push(hook.run);
            }, this);

            this._tags[flow.tag] = container;
        }, this);

        // Is the threadpool created?
        if (!this._threadPool) {
            nPool.createThreadPool(options.threads);
            this._threadPool = true;
        }

        this._config = options;
    }

    dispatch(data) {
        // 1. Run input hooks
        if (this.tags[data.tag].inputHooks) {
            const hooks = this._parallel({}, this.tags[data.tag].inputHooks, data, this._onHooksCompleted.bind(this));
        }

        // 2. Handle data via threadpool

        // TODO: Implementation
    }

    respond(response) {
        // TODO: Implementation
    }

    _filter(data) {
        // TODO: Implementation
    }

    _onHooksCompleted(error, results) {
        // TODO: Implementation
    }
}

module.exports = new Dispatcher();