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
    constructor(options = {}) {
        this._options = options;
        this._signals = new MiniSignals();
        this._parallel = new FastParallel({
            released: _onHooksCompleted,
            results: true
        });
    }

    dispatch(data) {
        // TODO: Implementation
    }

    respond(response) {
        // TODO: Implementation
    }

    _onHooksCompleted(error, results) {

    }
}

module.exports = new Dispatcher();