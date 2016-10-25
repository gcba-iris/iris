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
const logger = require('winston');
const ora = require('ora');
const utils = require('./lib/utils/utils');

const consoleLog = utils.log;

class Iris {
    constructor() {
        this._name = 'main';
        this._config = {};
        this._flows = [];
        this._modules = {};
        this._logger = logger;

        this._logger.cli();
    }

    get config() {
        return this._config;
    }

    get logger() {
        return this._logger;
    }

    get modules() {
        return this._modules;
    }

    get flows() {
        return this._flows;
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
        const spinner = ora('Checking config').start();

        this._checkConfig(config, spinner);
        this._logger.level = config.logLevel || 'info';

        if (config.events) {
            config.events.dispatcher = config.events.dispatcher ? true : false;
            config.events.docks = config.events.docks ? true : false;
            config.events.handlers = config.events.handlers ? true : false;
            config.events.hooks = config.events.hooks ? true : false;
        } else {
            logger.verbose('\rNo events config found, disabling all by default');
        }

        spinner.succeed();
        Object.assign(this._config, options);
    }

    flow(name, options) {
        const config = options;
        const spinner = ora(`Validating '${name}'`).start();

        this._checkFlowOptions(config, spinner);
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
            logLevel: validator.isString
        };

        if (config.events) schema.events = {
            dispatcher: validator.isBoolean,
            docks: validator.isBoolean,
            handlers: validator.isBoolean,
            hooks: validator.isBoolean
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

        if (this.config.logLevel == 'silly') {
            this._logger.silly('\rChecked flow options');
        }
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
            stop: [validator.isRequired, validator.isFunction],
            port: [validator.isRequired, validator.isNumber],
            send: [validator.isFunction]
        };

        flow.docks.forEach((dock) => {
            if (!dock.id) {
                validator.validate(dock, dockSchema, this._handleErrors(spinner));
                this._logger.silly('Validated dock \'' + dock.name + '\'');

                if (this.config.events && this.config.events.docks) {
                    dock.config = Object.assign(dock.config, {
                        events: this.config.events.docks
                    });
                }

                dock.id = shortid.generate();
                dock.dispatcher = dispatcher;
                this.modules[dock.path] = dock;
            }
        }, this);
    }

    _validateHooks(flow, spinner) {
        const hookSchema = {
            name: [validator.isRequired, validator.isString],
            path: [validator.isRequired, validator.isString],
            run: [validator.isRequired, validator.isFunction],
            process: [validator.isRequired, validator.isFunction]
        };

        flow.inputHooks.forEach(function (hook) {
            if (!hook.validated) {
                validator.validate(hook, hookSchema, this._handleErrors(spinner));
                this._logger.silly('Validated input hook \'' + hook.name + '\'');

                if (this.config.events && this.config.events.hooks) {
                    hook.config = Object.assign(hook.config, {
                        events: this.config.events.hooks
                    });
                }

                hook.validated = true;
                this.modules[hook.path] = hook;
            } else logger.silly('Hook \'' + hook.name + '\' already validated');
        }, this);

        flow.outputHooks.forEach(function (hook) {
            if (!hook.validated) {
                validator.validate(hook, hookSchema, this._handleErrors(spinner));
                this._logger.silly('Validated output hook \'' + hook.name + '\'');

                hook.validated = true;
                this.modules[hook.path] = hook;
            } else logger.silly('Hook \'' + hook.name + '\' already validated');
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
            this._logger.silly('Validated handler \'' + flow.handler.name + '\'');

            if (this.config.events && this.config.events.handlers) {
                flow.handler.config = Object.assign(flow.handler.config, {
                    events: this.config.events.handlers
                });
            }

            flow.handler.validated = true;
            this.modules[flow.handler.path] = flow.handler;
        }
    }

    _handleErrors(spinner) {
        return (errors) => {
            spinner.fail();

            errors.forEach(function (error) {
                consoleLog.error(error);
            }, this);

            process.exit(1);
        }
    }
}

module.exports = new Iris();