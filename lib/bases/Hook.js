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
        this._path = module.filename;
    }

    get name() {
        return this._name;
    }

    get config() {
        return this._config;
    }

    set config(options) {
        // TODO: Check options
        Object.assign(this._config, options);
    }

    release() {
        // TODO: Implementation
    }

    /*
     * This getter must be implemented by the child classes
     *
        get path() {
            return __filename;
        }
     */

    /*
     * This method must be implemented by the child classes
     *
        run(data) {

        }
     */
}

module.exports = Hook;