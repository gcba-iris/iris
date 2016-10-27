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
    /**
     * Creates a Handler instance.
     *
     * @param {any} name
     *
     * @memberOf Handler
     */
    constructor(name) {
        this._type = 'handler';
        this._name = name || 'handler';
        this._config = {};
        this._dispatcher = null;
        this._validated = false;
        this._events = Sparkles('iris-handler-' + name);
        this.logger = logger;

        this.logger.cli();
    }

    /**
     * Gets the handler's type.
     *
     * @readonly
     *
     * @memberOf Handler
     */
    get type() {
        return this._type;
    }

    /**
     * Gets the handler's name.
     *
     * @readonly
     *
     * @memberOf Handler
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the handler's config object.
     *
     *
     * @memberOf Handler
     */
    get config() {
        return this._config;
    }

    /**
     * Gets the handler's validation state.
     *
     *
     * @memberOf Handler
     */
    get validated() {
        return this._validated;
    }

    /**
     * Sets the handler's config object.
     *
     *
     * @memberOf Handler
     */
    set config(options) {
        Object.assign(this._config, options);
    }

    /**
     * Sets the handler's Dispatcher instance.
     *
     *
     * @memberOf Handler
     */
    set dispatcher(dispatcher) {
        this._dispatcher = dispatcher;
    }

    /**
     * Sets the handler's validation state.
     *
     *
     * @memberOf Handler
     */
    set validated(value) {
        this._validated = value;
    }

    /**
     * Handles the data.
     *
     * @param {any} data
     *
     * @memberOf Handler
     */
    handle(data) {
        this.logger.verbose('Received data from dispatcher');

        this._emitEvent('data', {
            target: this,
            data: data
        });
        this.process(data);
    }

    /**
     * Sends a response to the Dispatcher.
     *
     * @param {any} response
     *
     * @memberOf Handler
     */
    send(response) {
        this._dispatcher.respond(response);
    }

    /**
     * Registers an event handler.
     *
     * @param {any} event
     * @param {any} callback
     *
     * @memberOf Handler
     */
    on(event, callback) {
        this._events.on(event, callback);
    }

    /**
     * Emits an event.
     *
     * @param {any} event
     * @param {any} data
     *
     * @memberOf Handler
     */
    _emitEvent(event, data) {
        if (this.config.events) {
            this._events.emit(event, data);
            this.logger.silly('Emitted \'' + event + '\' event');
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

module.exports = Handler;