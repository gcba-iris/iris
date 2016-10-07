/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const lodash = require('lodash');
const MiniSignals = require('mini-signals');

class Dock {
    constructor(name, protocol) {
        // TODO: Check params
        this._name = name;
        this._protocol = protocol;
        this._config = {}; // TODO: Set defaults
        this._dispatcher = undefined;
        this._signals = new MiniSignals();
    }

    get name() {
        return this._name;
    }

    get protocol() {
        return this._protocol;
    }

    get port() {
        return this._config.port;
    }

    get config() {
        return this._config;
    }

    set config(options) {
        this._checkConfig(options);
        Object.assign(this._config, options);
    }

    set dispatcher(dispatcher) {
        this._dispatcher = dispatcher;
    }

    parse(message) {
        // TODO: Default implementation
        this.send(message);
    }

    send(data) {
        // TODO: Check dispatcher
        this._dispatcher.dispatch(data);
    }

    encode(response) {
        // TODO: Default implementation
    }

    release() {
        // TODO: Implementation
    }

    validate(message) {
        var validSize = false;
        var validTag = false;
        var validFormat = true;

        const criteria = [];
        const splitMessage = message.split(this._config.parser.subtagSeparator);
        const tag = splitMessage.shift();
        const splitMessageLength = splitMessage.length;

        // 1. Check message length
        if (this._config.maxMessageLength) {
            validSize = message.length <= this._config.maxMessageLength;
            if (!validSize) {
                this._logInvalidMessage(message);
                return;
            }
        }

        // 2. Check tags
        if (this._dispatcher.tags[tag]) {
            // 3. Check format
            for (let i = 1; i < splitMessageLength; i += 2) {
                if (splitMessage[i].indexOf(this._config.parser.dataSeparator) === -1) validFormat = false;
            }
            if (!validFormat) {
                this._logInvalidMessage(message);
                return;
            }

            this.parse(message);
        } else {
            this._logInvalidMessage(message);
            return;
        }
    }

    _logInvalidMessage(message) {
        console.log(`[${this.name.toUpperCase()} Dock] Invalid message: ${message}`);
    }

    _checkConfig(config) {

    }

    /*
     * This method must be implemented by the child classes
     *
        listen(port) {

        }
     */

    /*
     * This method must be implemented by the child classes
     *
        reply(message) {

        }
     */
}

module.exports = Dock;