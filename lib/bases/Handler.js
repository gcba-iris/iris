/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

class Handler {
    constructor(name) {
        this._name = name;
        this._options = {};
        this._dispatcher = null;
        this._validated = false;
    }

    get name() {
        return this._name;
    }

    get config() {
        return this._config;
    }

    get validated() {
        return this._validated;
    }

    set config(options) {
        Object.assign(this._config, options);
    }

    set dispatcher(dispatcher) {
        this._dispatcher = dispatcher;
    }

    set validated(value) {
        this._validated = value;
    }

    send(response) {
        this._dispatcher.respond(response);
    }

    /*
     * This getter must be added to the child classes
     *
        get path() {
            return __filename;
        }
     */

    /*
     * This method must be implemented by the child classes
     *
        handle(data) {

        }
     */
}

module.exports = Handler;