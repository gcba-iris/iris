/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

class Flow {
    constructor(name, config) {
        this._name = name;
        this._tag = config.tag;
        this._docks = config.docks;
        this._handler = config.handler;
        this._inputHooks = config.inputHooks;
        this._outputHooks = config.outputHooks;
    }

    get name() {
        return this._name;
    }

    get tag() {
        return this._tag;
    }

    get docks() {
        return this._docks;
    }

    get handler() {
        return this._handler;
    }

    get inputHooks() {
        return this._inputHooks;
    }

    get outputHooks() {
        return this._outputHooks;
    }
}

module.exports = Flow;