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
const Validator = require('propchecker');
const dispatcher = require('./lib/Dispatcher');
const shortid = require('shortid');

class Iris {
    constructor() {
        this._config = {}; // TODO: Set defaults
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
            config.vantage.enabled = !config.vantage.enabled ? false : true;
        }

        Object.assign(this._config, options);
    }

    set(key, value) {
        // TODO: Check config
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
            threads: [Validator.isRequired, Validator.isNumber],
            logLevel: Validator.isString,
            vantage: {
                enabled: Validator.isBoolean,
                port: Validator.isNumber
            }
        };

        Validator.validate(config, schema, (errors) => {
            console.error(errors);

            process.exit(1);
        });
    }

    _checkFlowOptions(options) {
        const schema = {
            tag: [Validator.isRequired, Validator.isString],
            docks: [Validator.isRequired, Validator.isArray],
            handler: Validator.isRequired,
            inputHooks: Validator.isArray,
            outputHooks: Validator.isArray
        };

        Validator.validate(options, schema, (errors) => {
            console.error(errors);

            process.exit(1);
        });
    }
}

module.exports = new Iris();