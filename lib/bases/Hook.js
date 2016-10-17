/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Sparkles = require('sparkles');
const logger = require('winston');

class Hook {
    constructor(name) {
        this._name = name || 'hook';
        this._config = {};
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

    set validated(value) {
        this._validated = value;
    }

    run(data) {
        this._emitEvent('onData', {
            target: this,
            data: data
        });
        this.process(data);
    }

    _emitEvent(event, data) {
        if (this.config.events) this._events.emit(event, data);
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
        process(data) {

        }
     *
     */
}

module.exports = Hook;