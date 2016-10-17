/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Sparkles = require('sparkles');
const logger = require('winston');

class Handler {
    constructor(name) {
        this._name = name || 'handler';
        this._config = {};
        this._dispatcher = null;
        this._validated = false;
        this._events = Sparkles('iris');
        this.logger = logger;

        this.logger.cli();
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

    handle(data) {
        this.logger.verbose('Received data from dispatcher');

        this._emitEvent.emit('data', {
            target: this,
            data: data
        });
        this.process(data);
    }

    send(response) {
        this._dispatcher.respond(response);
    }

    _emitEvent(event, data) {
        if (this.config.events) {
            this._events.emit(event, data);
            this.logger.silly('Emitted \'' + event + '\' event');
        };
    }

    /*
     * This getter must be added to the child classes
     *
        get path() {
            return __filename;
        }
     *
     */

    /*
     * This method must be implemented by the child classes
     *
        handle(data) {

        }
     *
     */
}

module.exports = Handler;