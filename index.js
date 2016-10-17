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
const chalk = require('chalk');

class Iris {
    constructor() {
        this._config = {};
        this._flows = [];
        this._modules = [];
    }

    get flows() {
        return this._flows;
    }

    get config() {
        return this._config;
    }

    get modules() {
        return this._modules;
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

    set config(options) {
        const config = options;

        this._checkConfig(config);
        config.logLevel = config.logLevel || 'info';

        if (config.events) {
            config.events.dispatcher = config.events.dispatcher && true;
            config.events.docks = config.events.docks && true;
            config.events.handlers = config.events.handlers && true;
            config.events.hooks = config.events.hooks && true;
        }

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
        const spinner = ora(`Validating '${name}'`).start();

        this._checkFlowOptions(config);
        config.inputHooks = config.inputHooks || [];
        config.outputHooks = config.outputHooks || [];

        const flow = new Flow(name, config);

        this._validateDocks(flow, spinner);
        this._validateHooks(flow, spinner);
        this._validateHandler(flow, spinner);

        spinner.succeed();
        this._flows.push(flow);
    }

    _checkConfig(config, spinner) {
        const schema = {
            threads: validator.isNumber,
            logLevel: validator.isString,
            events: {
                dispatcher: validator.isBoolean,
                docks: validator.isBoolean
            },
            vantage: {
                enabled: validator.isBoolean,
                port: validator.isNumber
            }
        };

        validator.validate(config, schema, this._handleErrors(spinner));
    }

    _checkFlowOptions(options, spinner) {
        const flowSchema = {
            tag: [validator.isRequired, validator.isString],
            docks: [validator.isRequired, validator.isArray],
            handler: validator.isRequired,
            inputHooks: validator.isArray,
            outputHooks: validator.isArray
        };

        validator.validate(options, flowSchema, this._handleErrors(spinner));
    }

    _validateDocks(flow, spinner) {
        const dockSchema = {
            name: [validator.isRequired, validator.isString],
            protocol: [validator.isRequired, validator.isString],
            path: [validator.isRequired, validator.isString],
            validate: [validator.isRequired, validator.isFunction],
            parse: [validator.isRequired, validator.isFunction],
            process: [validator.isRequired, validator.isFunction],
            reply: [validator.isRequired, validator.isFunction],
            encode: [validator.isRequired, validator.isFunction],
            listen: [validator.isRequired, validator.isFunction],
            port: [validator.isRequired, validator.isNumber],
            send: [validator.isFunction]
        };

        flow.docks.forEach((dock) => {
            if (!dock.id) {
                validator.validate(dock, dockSchema, this._handleErrors(spinner));
                dock.id = shortid.generate();
                dock.config = Object.assign(dock.config, {
                    events: this.config.events.docks
                });
                this.modules.push(dock.path);
                this._startDock(dock);
            }
        }, this);
    }

    _validateHooks(flow, spinner) {
        const hookSchema = {
            name: [validator.isRequired, validator.isString],
            path: [validator.isRequired, validator.isString],
            run: [validator.isRequired, validator.isFunction]
        };

        flow.inputHooks.forEach(function (hook) {
            if (!hook.validated) {
                validator.validate(hook, hookSchema, this._handleErrors(spinner));

                hook.validated = true;
                this.modules.push(hook.path);
            }
        }, this);

        flow.outputHooks.forEach(function (hook) {
            if (!hook.validated) {
                validator.validate(hook, hookSchema, this._handleErrors(spinner));

                hook.validated = true;
                this.modules.push(hook.path);
            }
        }, this);
    }

    _validateHandler(flow, spinner) {
        const handlerSchema = {
            name: [validator.isRequired, validator.isString],
            path: [validator.isRequired, validator.isString],
            handle: [validator.isRequired, validator.isFunction]
        };

        if (!flow.handler.validated) {
            validator.validate(flow.handler, handlerSchema, this._handleErrors(spinner));

            flow.handler.validated = true;
            this.modules.push(flow.handler.path);
        }
    }

    _handleErrors(errors) {
        spinner.fail();

        errors.forEach(function (error) {
            console.error(chalk.red(error));
        }, this);

        process.exit(1);
    }

    _handleErrors(spinner) {
        return (errors) => {
            spinner.fail();

            errors.forEach(function (error) {
                console.error(chalk.red(error));
            }, this);

            process.exit(1);
        }
    }

    _startDock(dock) {
        let id = shortid.generate();

        dock.id = id;
        dock.dispatcher = dispatcher;
        dock.listen(dock.config.port);
    }
}

module.exports = new Iris();