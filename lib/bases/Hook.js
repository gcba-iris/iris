/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const MiniSignals = require('mini-signals');

class Hook {
    constructor(name) {
        // TODO: Check params
        this._name = name;
        this._options = {}; // TODO: Set defaults
        this._signals = new MiniSignals();
    }

    get name() {
        return this._name;
    }

    get options() {
        return this._config;
    }

    set options(options) {
        // TODO: Check options
        Object.assign(this._config, options);
    }

    release() {
        // TODO: Implementation
    }

    /*
     * This method must be implemented by the child classes
     *
        run(data) {

        }
     */
}

module.exports = Hook;