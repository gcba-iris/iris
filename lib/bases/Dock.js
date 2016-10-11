/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const MiniSignals = require('mini-signals');
const Data = require('../Data');

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
                return false;
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

                return false;
            }

            return {
                tag: tag,
                message: splitMessage
            };
        } else {
            this._logInvalidMessage(message);

            return false;
        }
    }

    parse(data, meta) {
        if (Array.isArray(data.message)) {
            const length = data.message.length;
            const result = {};

            for (let i = 0; i < length; i += 2) {
                result[data.message[i]] = data.message[i + 1].split(this._config.parser.dataSeparator);
            }

            return new Data(data.tag, meta, result);
        } else return null;
    }

    process(message, meta) {
        const metadata = meta ? meta : {};

        if (this._dispatcher) {
            const validatedMessage = this.validate(message);

            if (validatedMessage) {
                const data = this.parse(validatedMessage, metadata);

                if (data) this._dispatcher.dispatch(data);
            }
        }
    }

    encode(response) {
        // TODO: Default implementation
    }

    release() {
        // TODO: Implementation
    }

    _logInvalidMessage(message) {
        console.log(`[${this.name.toUpperCase()} Dock] Invalid message: ${message}`);
    }

    _checkConfig(config) {
        // TODO: Implementation
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