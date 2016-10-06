/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const lodash = require('lodash');

class Iris {
    constructor() {
        console.log('Hi from Iris!');

        this._config = {}; // TODO: Set defaults
        this._dispatcher = undefined;
        this._docks = [];
        this._flows = [];
        this._tags = [];
        this._hooks = [];
        this._handlers = [];
    }

    set config(options) {
        // TODO: Check options
        Object.assign(this._config, options);
    }

    set dispatcher(dispatcher) {
        this._dispatcher = dispatcher;
    }

    set(key, value) {
        // TODO: Check config
        this._config[key] = value;
    }

    flow(options) {
        // TODO: Check options
        this._flows.push(options);
    }

    start() {

    }
}

module.exports = new Iris();