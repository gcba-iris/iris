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
    /**
     * Creates a Hook instance.
     *
     * @param {string} name
     *
     * @memberOf Hook
     */
    constructor(name) {
        this._type = 'hook';
        this._name = name || 'hook';
        this._config = {};
        this._validated = false;
        this._events = Sparkles('iris');
        this.logger = logger;

        this.logger.cli();
    }

    /**
     * Gets the hooks's type.
     *
     * @readonly
     *
     * @memberOf Hook
     */
    get type() {
        return this._type;
    }

    /**
     * Gets the hooks's name.
     *
     * @readonly
     *
     * @memberOf Hook
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the hooks's config object.
     *
     *
     * @memberOf Hook
     */
    get config() {
        return this._config;
    }

    /**
     * Gets the hooks's validation state.
     *
     *
     * @memberOf Hook
     */
    get validated() {
        return this._validated;
    }

    /**
     * Sets the hooks's config object.
     *
     *
     * @memberOf Hook
     */
    set config(options) {
        Object.assign(this._config, options);
    }

    /**
     * Sets the hooks's validation state.
     *
     *
     * @memberOf Hook
     */
    set validated(value) {
        this._validated = value;
    }

    /**
     * Runs the hook.
     *
     * @param {Object} data
     *
     * @memberOf Hook
     */
    run(data) {
        this.logger.verbose('Received data from dispatcher');

        this._emitEvent(`data-${this.name}`, {
            target: this,
            data: data
        });
        this.process(data);
    }

    /**
     * Registers an event handler.
     *
     * @param {string} event
     * @param {function} callback
     *
     * @memberOf Hook
     */
    on(event, callback) {
        this._events.on(event, callback);
    }

    /**
     * Emits an event.
     *
     * @param {string} event
     * @param {Object} data
     *
     * @memberOf Hook
     */
    _emitEvent(event, data) {
        if (this.config.events) {
            this._events.emit(event, data);
            this.logger.silly(`Emitted event '${event}'`);
        }
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