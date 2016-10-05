/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const MiniSignal = require('mini-signals');

class Dispatcher {
    constructor(options) {
        this.options = options;
        this.signal = new MiniSignal();
    }

    dispatch(data) {
        // TODO: Implementation
    }

    respond(response) {
        // TODO: Implementation
    }
}

module.exports = Dispatcher;