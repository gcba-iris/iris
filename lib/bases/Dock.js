/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const lodash = require('lodash');
const MiniSignals = require('mini-signals');

class Dock {
    constructor(name) {
        // TODO: Check params
        this._name = name;
        this._config = {}; // TODO: Set defaults
        this._dispatcher = undefined;
        this._signals = new MiniSignals();
    }

    get name() {
        return this._name;
    }

    get ports() {
        return this._config.ports;
    }

    get config() {
        return this._config;
    }

    set config(options) {
        // TODO: Check options
        Object.assign(this._config, options);
    }

    set dispatcher(dispatcher) {
        this._dispatcher = dispatcher;
    }

    parse(message) {
        // TODO: Default implementation
    }

    send(data) {
        // TODO: Check dispatcher
        this._dispatcher.dispatch(data);
    }

    encode(response) {
        // TODO: Default implementation
    }

    release() {
        // TODO: Implementation
    }

    _filter(message) {
        // TODO: Implementation
    }

    /*
     * This method must be implemented by the child classes
     *
        listen(ports) {

        }
     */

    /*
     * This method must be implemented by the child classes
     *
        reply(message) {

        }
     */
}

module.exports = Dock;