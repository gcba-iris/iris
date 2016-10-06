/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

class Iris {
    constructor() {
        console.log('Hi from Iris!');

        this._config = {}; // TODO: Set defaults
    }

    set config(options) {
        this._config = options;
    }

    set(key, value) {
        this._config[key] = value;
    }

    dock(name, options) {

    }

    flow(options) {

    }

    start() {

    }
}

module.exports = new Iris();