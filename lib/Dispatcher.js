/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const MiniSignal = require('mini-signals');
const FastParallel = require('fastparallel');

class Dispatcher {
    constructor(options) {
        this.options = options;
        this.signal = new MiniSignal();
        this.parallel = new FastParallel({
            released: _completed,
            results: true
        });
    }

    dispatch(data) {
        // TODO: Implementation
    }

    respond(response) {
        // TODO: Implementation
    }

    _completed(error, results) {

    }
}

module.exports = Dispatcher;