/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Sparkles = require('sparkles');

class Handler {
    constructor(name) {
        this._name = name;
        this._options = {};
        this._dispatcher = null;
        this._validated = false;
        this._events = Sparkles('iris');
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
        this._emitEvent.emit('onResponse', {
            target: this,
            data: response
        });
        this._dispatcher.respond(response);
    }

    handle(data) {
        this._emitEvent.emit('onData', {
            target: this,
            data: data
        });
        this.process(data);
    }

    _emitEvent(event, data) {
        if (this._config.events) this._events.emit(event, data);
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
        process(data) {

        }
     */
}

module.exports = Handler;