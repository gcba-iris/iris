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
        this._signals = new MiniSignals();
        this._parallel = new FastParallel({
            released: this._onHooksCompleted,
            results: true
        });
    }

    set config(options) {
        // TODO: Check options
        Object.assign(this._config, options);
    }

    dispatch(data) {
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