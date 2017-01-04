/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Sparkles = require('sparkles');
const validator = require('propchecker');
const shortid = require('shortid');
const logger = require('winston');
const utils = require('../utils/utils');
const util = require('util');

const consoleLog = utils.log;

class Dock {
    /**
     * Creates a Dock instance.
     *
     * @param {string} name
     * @param {string} protocol
     *
     * @memberOf Dock
     */
    constructor(name, protocol) {
        this._id = null;
        this._type = 'dock';
        this._name = name || 'dock';
        this._protocol = protocol;
        this._config = {};
        this._dispatcher = null;
        this._events = Sparkles('iris');
        this.logger = logger;

        this.logger.cli();
    }

    /**
     * Gets the dock's id.
     *
     *
     * @memberOf Dock
     */
    get id() {
        return this._id;
    }

    /**
     * Gets the dock's type.
     *
     * @readonly
     *
     * @memberOf Dock
     */
    get type() {
        return this._type;
    }

    /**
     * Gets the dock's name.
     *
     * @readonly
     *
     * @memberOf Dock
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the dock's protocol.
     *
     * @readonly
     *
     * @memberOf Dock
     */
    get protocol() {
        return this._protocol;
    }

    /**
     * Gets the dock's port.
     *
     * @readonly
     *
     * @memberOf Dock
     */
    get port() {
        return this.config.port;
    }

    /**
     * Gets the dock's config object.
     *
     *
     * @memberOf Dock
     */
    get config() {
        return this._config;
    }

    /**
     * Sets the dock's id.
     *
     *
     * @memberOf Dock
     */
    set id(value) {
        this._id = value;
    }

    /**
     * Gets the dock's config object.
     *
     *
     * @memberOf Dock
     */
    set config(options) {
        const config = options;

        this._checkConfig(config);
        config.maxMessageLength = config.maxMessageLength || 300;

        if (config.parser) {
            config.parser.subtagSeparator = config.parser.subtagSeparator || '|';
            config.parser.dataSeparator = config.parser.dataSeparator || ',';
        }

        if (config.encoder) {
            config.encoder.subtagSeparator = config.encoder.subtagSeparator || '|';
            config.encoder.dataSeparator = config.encoder.dataSeparator || ',';
        }

        Object.assign(this._config, config);
    }

    /**
     * Gets the dock's Dispatcher instance.
     *
     *
     * @memberOf Dock
     */
    set dispatcher(dispatcher) {
        this._dispatcher = dispatcher;
    }

    /**
     * Validates the message.
     *
     * @param {string} message
     * @return {boolean} Whether the message is valid or not
     *
     * @memberOf Dock
     */
    validate(message) {
        const criteria = [];
        const splitMessage = message.split(this.config.parser.subtagSeparator);
        const tag = splitMessage.shift();
        const splitMessageLength = splitMessage.length;

        let validSize = false;
        let validTag = false;
        let validFormat = true;

        // 1. Check message length
        if (this.config.maxMessageLength) {
            validSize = message.length <= this.config.maxMessageLength;

            if (!validSize) {
                this.logger.verbose('Message has an invalid length: ' + message.length + ', max: ' + this.config.maxMessageLength);
                this._invalidMessage(message);

                return false;
            }
        }

        // 2. Check tag
        if (this._dispatcher.tags[tag]) {
            // 3. Check format
            for (let i = 1; i < splitMessageLength; i += 2) {
                if (!splitMessage[i].includes(this.config.parser.dataSeparator)) validFormat = false;
            }

            if (!validFormat) {
                this.logger.verbose('Message has an invalid format: data separator \'' + this.config.parser.dataSeparator + '\' not found');
                this._invalidMessage(message);

                return false;
            }

            return {
                tag: tag,
                message: splitMessage
            };
        }
        else {
            this.logger.verbose('Message has an invalid tag: ' + tag);
            this._invalidMessage(message);

            return false;
        }
    }

    /**
     * Parses the data.
     *
     * @param {string[]} data
     * @param {Object} meta
     * @return {Object|boolean} A data object or false in case of error
     *
     * @memberOf Dock
     */
    parse(data, meta) {
        if (Array.isArray(data.message)) {
            const length = data.message.length;
            const result = {};

            for (let i = 0; i < length; i += 2) {
                result[data.message[i]] = data.message[i + 1].split(this.config.parser.dataSeparator);
            }

            this.logger.verbose('Parsed message');

            return {
                tag: data.tag,
                meta: meta,
                data: result
            };
        }
        else {
            this.logger.warn('Unrecognized message body. Expected array');

            return false;
        }
    }

    /**
     * Processes the message.
     *
     * @param {any} message
     * @param {Object} meta
     * @param {function} callback
     * @return {boolean} Whether the message type is valid or not
     *
     * @memberOf Dock
     */
    process(message, meta, callback) {
        let data;

        if (typeof message === 'string' || message instanceof String) data = message;
        else if (message.toString && util.isFunction(message.toString)) data = message.toString();
        else {
            this.logger.verbose('Received an unrecognized message type\nMessage metadata:\n' + JSON.stringify(meta, undefined, 4));
            this._invalidMessage(message);

            return false;
        }

        this._emitEvent('data-' + this.name, {
            target: this.name,
            data: data
        });

        const metadata = meta ? meta : {};

        metadata.dock = this.id;
        metadata.timestamp = new Date().toISOString();

        if (this._dispatcher) {
            const validatedMessage = this.validate(data);

            if (validatedMessage) {
                const parsedData = this.parse(validatedMessage, metadata);

                if (parsedData) {
                    this.logger.verbose('Data sent to dispatcher');
                    parsedData.id = shortid.generate();
                    this._dispatcher.dispatch(parsedData, callback);
                }
                else this.logger.error('No data returned by parser');
            }
        }
        else this.logger.error('Dispatcher reference not set');

        return true;
    }

    /**
     * Encodes the response.
     *
     * @param {any} response
     * @return {string|boolean} The encoded message or false in case of error
     *
     * @memberOf Dock
     */
    encode(response) {
        let result = '';

        // Is a string? --> Return it as it is
        if (typeof response.message === 'string' || response.message instanceof String) {
            this.logger.verbose('Encoded message');

            return response.message;
        }
        // Is an array? --> Join it
        else if (Array.isArray(response.message)) {
            this.logger.verbose('Encoded message');

            return response.message.join(this.config.encoder.dataSeparator);
        }
        // Is a plain object? --> Process it into a string
        else if (typeof response.message === 'object' &&
            response.message !== null &&
            response.message.constructor === Object &&
            response.message.hasOwnProperty('isPrototypeOf') === false &&
            response.message.toString() === '[object Object]') {
            for (let property in response.message) {
                if (response.message.hasOwnProperty(property)) {
                    const value = response.message[property];

                    result += this.config.encoder.subtagSeparator;
                    result += property;
                    result += this.config.encoder.subtagSeparator;

                    // Is a string? --> Concat it
                    if (typeof value === 'string' || value instanceof String) result += value;
                    // Is an array? --> Join it and concat
                    else if (Array.isArray(value)) result += value.join(this.config.encoder.dataSeparator);
                    // Has its own toString() method? --> Call it and concat
                    else if (!util.isFunction(property) &&
                        value.toString &&
                        util.isFunction(value.toString) &&
                        value.toString() !== '[object Object]') {
                        result += value.toString();
                    }
                }
            }

            this.logger.verbose('Encoded message');

            return result;
        }
        // Has its own toString() method? --> Call it
        else if (!util.isFunction(response.message) &&
            response.message.toString &&
            util.isFunction(response.message.toString) &&
            response.message.toString() !== '[object Object]') {
            this.logger.verbose('Encoded message using message\'s own toString() method');

            return response.message.toString();
        }
        // Unknown message type
        else {
            this.logger.error('Couldn\'t encode message');

            return false;
        }
    }

    /**
     * Wrapper for send() that emits an event and adds a couple of checks.
     *
     * @param {string} response
     *
     * @memberOf Dock
     */
    reply(response) {
        this._emitEvent('response-' + this.name, {
            target: this.name,
            data: response
        });

        if (response.meta.dock === this._id) {
            if (this.send) {
                const message = this.encode(response);

                if (message) this.send(message);
                else this.logger.error('No message to send');
            }
        }
        else this.logger.error('Invalid dock reference');
    }

    /**
     * Registers an event handler.
     *
     * @param {string} event
     * @param {function} callback
     *
     * @memberOf Dock
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
     * @memberOf Dock
     */
    _emitEvent(event, data) {
        if (this.config.events) {
            this._events.emit(event, data);

            this.logger.silly('Emitted \'' + event + '\' event');
        }
    }

    /**
     * Handles an invalid message.
     *
     * @param {string} message
     *
     * @memberOf Dock
     */
    _invalidMessage(message) {
        this._emitEvent('invalidMessage-' + this.name, {
            target: this.name,
            data: message
        });

        this.logger.warn(`[${this.name.toUpperCase()} Dock] Invalid message: ${message}`);
    }

    /**
     * Validates config.
     *
     * @param {Object} config
     *
     * @memberOf Dock
     */
    _checkConfig(config) {
        const schema = {
            port: [
                validator.isRequired, validator.isNumber
            ],
            maxMessageLength: validator.isNumber
        };

        if (config.parser) {
            schema.parser = {
                subtagSeparator: [validator.isString],
                dataSeparator: [validator.isString]
            };
        }

        if (config.encoder) {
            schema.encoder = {
                subtagSeparator: [validator.isString],
                dataSeparator: [validator.isString]
            };
        }

        validator.validate(config, schema, (errors) => {
            process.stdout.write('\n');

            errors.forEach(function (error) {
                this.logger.error(error);
            }, this);

            process.stdout.write('\n');
            this._events.emit('validationError', {});
        });

        process.stdout.write('\r\x1b[K'); // Erase previous terminal line
        this.logger.verbose('Checked config of dock \'' + this.name + '\'');
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
        listen() {

        }
     *
     */

    /*
     * This method must be implemented by the child classes
     *
        stop() {

        }
     *
     */

    /*
     * This method can be implemented by the child classes (optional)
     *
        send(response) {

        }
     *
     */
}

module.exports = Dock;