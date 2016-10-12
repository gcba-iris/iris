/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const dispatcher = require('./lib/Dispatcher');
const Flow = require('./lib/Flow');
const BaseDock = require('./lib/bases/Dock');
const BaseHandler = require('./lib/bases/Handler');
const BaseHook = require('./lib/bases/Hook');

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
        // TODO: Check options
        Object.assign(this._config, options);
    }

    set(key, value) {
        // TODO: Check config
        this._config[key] = value;
    }

    flow(name, options) {
        // TODO: Check options
        const flow = new Flow(name, options);

        // TODO: Prettify logs and messages
        console.log('Flow \'' + flow.name + '\' found:');
        console.log('    Tag: \'' + flow.tag + '\'');
        console.log('    Handler: \'' + flow.handler.name + '\'');

        flow.docks.forEach((dock) => {
            dock.dispatcher = dispatcher;
            dock.listen(dock.config.port);
        }, this);

        this._flows.push(flow);
    }
}

module.exports = new Iris();