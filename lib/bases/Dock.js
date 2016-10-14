/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const validator = require('propchecker');
const shortid = require('shortid');
const chalk = require('chalk');

class Dock {
    constructor(name, protocol) {
        this._id = null;
        this._name = name;
        this._protocol = protocol;
        this._config = {};
        this._dispatcher = null;
    }

    get id() {
        return this._id;
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

    set id(value) {
        this._id = value;
    }

    set config(options) {
        const config = options;

        this._checkConfig(config);
        config.maxMessageLength = config.maxMessageLength || 300;

        if (config.parser) {
            config.parser.subtagSeparator = config.parser.subtagSeparator || '|';
            config.parser.dataSeparator = config.parser.dataSeparator || ',';
        }

        Object.assign(this._config, config);
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
                this._invalidMessage(message);
                return false;
            }
        }

        // 2. Check tag
        if (this._dispatcher.tags[tag]) {
            // 3. Check format
            for (let i = 1; i < splitMessageLength; i += 2) {
                if (splitMessage[i].indexOf(this._config.parser.dataSeparator) === -1) validFormat = false;
            }
            if (!validFormat) {
                this._invalidMessage(message);

                return false;
            }

            return {
                tag: tag,
                message: splitMessage
            };
        } else {
            this._invalidMessage(message);

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

            return {
                tag: data.tag,
                meta: meta,
                data: result
            };
        } else return null;
    }

    process(message, meta, callback) {
        const metadata = meta ? meta : {};

        metadata.dock = this._id;
        metadata.timestamp = new Date().toISOString();

        if (this._dispatcher) {
            const validatedMessage = this.validate(message);

            if (validatedMessage) {
                const data = this.parse(validatedMessage, metadata);

                if (data) {
                    data.id = shortid.generate();
                    this._dispatcher.dispatch(data, callback);
                };
            }
        }
    }

    reply(response) {
        if (response.meta.dock === this._id) {
            const message = this.encode(response);

            if (message && this.send) this.send(message);
        }
    }

    encode(response) {
        // TODO: Default format?
        return response.message;
    }

    _invalidMessage(message) {
        console.warn(chalk.yellow(`[${this.name.toUpperCase()} Dock] Invalid message: ${message}`));
    }

    _checkConfig(config) {
        const schema = {
            port: [validator.isRequired, validator.isNumber],
            parser: {
                subtagSeparator: [validator.isString],
                dataSeparator: [validator.isString]
            },
            maxMessageLength: validator.isNumber
        };

        validator.validate(config, schema, (errors) => {
            console.error(chalk.red(errors));

            process.exit(1);
        });
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
        listen(port) {

        }
     */

    /*
     * This method must be implemented by the child classes
     *
        send(response) {

        }
     */
}

module.exports = Dock;