/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const lodash = require('lodash');
const Flow = require('./lib/Flow');

class Iris {
    constructor() {
        console.log('Hi from Iris!');

        this._config = {}; // TODO: Set defaults
        this._flows = [];
    }

    get flows() {
        return this._flows;
    }

    get config() {
        return this._config;
    }

    set config(options) {
        // TODO: Check options
        Object.assign(this._config, options);
    }

    set(key, value) {
        // TODO: Check config
        this._config[key] = value;
    }

    flow(options) {
        // TODO: Check options
        const flow = new Flow(options);

        flow.docks.forEach((dock) => {
            dock.listen(dock.config.ports);
        }, this);

        this._flows.push(flow);
    }
}

module.exports = new Iris();