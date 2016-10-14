/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Flow = require('./lib/Flow');
const BaseDock = require('./lib/bases/Dock');
const BaseHandler = require('./lib/bases/Handler');
const BaseHook = require('./lib/bases/Hook');
const dispatcher = require('./lib/Dispatcher');
const validator = require('propchecker');
const shortid = require('shortid');
const ora = require('ora');

class Iris {
    constructor() {
        this._config = {};
        this._flows = [];
    }

    get Dock() {
        return BaseDock;
    }

    get Handler() {
        return BaseHandler;
    }

    get Hook() {
        return BaseHook;
    }

    get flows() {
        return this._flows;
    }

    get config() {
        return this._config;
    }

    set config(options) {
        const config = options;

        this._checkConfig(config);
        config.logLevel = config.logLevel || 'info';

        if (config.vantage) {
            config.vantage.enabled = config.vantage.enabled || false;
        }

        Object.assign(this._config, options);
    }

    set(key, value) {
        this._config[key] = value;
    }

    flow(name, options) {
        const config = options;

        this._checkFlowOptions(config);
        config.inputHooks = config.inputHooks || [];
        config.outputHooks = config.outputHooks || [];

        const flow = new Flow(name, config);

        flow.docks.forEach((dock) => {
            dock.dispatcher = dispatcher;

            if (!dock.id) {
                let id = shortid.generate();

                dock.id = id;
                dock.listen(dock.config.port);
            }
        }, this);

        this._flows.push(flow);
    }

    _checkConfig(config) {
        const schema = {
            threads: [validator.isRequired, validator.isNumber],
            logLevel: validator.isString,
            vantage: {
                enabled: validator.isBoolean,
                port: validator.isNumber
            }
        };

        validator.validate(config, schema, (errors) => {
            console.error(errors);

            process.exit(1);
        });
    }

    _checkFlowOptions(options) {
        const schema = {
            tag: [validator.isRequired, validator.isString],
            docks: [validator.isRequired, validator.isArray],
            handler: validator.isRequired,
            inputHooks: validator.isArray,
            outputHooks: validator.isArray
        };

        validator.validate(options, schema, (errors) => {
            console.error(errors);

            process.exit(1);
        });
    }
}

module.exports = new Iris();