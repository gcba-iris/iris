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

        this.config = {}; // TODO: Set defaults
    }

    config(options) {
        this.config = options;
    }

    set(key, value) {
        this.config[key] = value;
    }

    dock(name, options) {

    }

    flow(options) {

    }

    start() {

    }
}

module.exports = new Iris();