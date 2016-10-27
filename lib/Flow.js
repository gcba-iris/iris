/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

class Flow {
    /**
     * Creates a new Flow.
     *
     * @param {any} name
     * @param {any} config
     *
     * @memberOf Flow
     */
    constructor(name, config) {
        this._name = name;
        this._tag = config.tag;
        this._docks = config.docks;
        this._handler = config.handler;
        this._inputHooks = config.inputHooks;
        this._outputHooks = config.outputHooks;
    }

    /**
     * Gets the flow's name.
     *
     * @readonly
     *
     * @memberOf Flow
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the flow's tag.
     *
     * @readonly
     *
     * @memberOf Flow
     */
    get tag() {
        return this._tag;
    }

    /**
     * Gets the flow's Dock instances.
     *
     * @readonly
     *
     * @memberOf Flow
     */
    get docks() {
        return this._docks;
    }

    /**
     * Gets the flow's Handler instance.
     *
     * @readonly
     *
     * @memberOf Flow
     */
    get handler() {
        return this._handler;
    }

    /**
     * Gets the flow's input Hook instances.
     *
     * @readonly
     *
     * @memberOf Flow
     */
    get inputHooks() {
        return this._inputHooks;
    }

    /**
     * Gets the flow's output Hook instances.
     *
     * @readonly
     *
     * @memberOf Flow
     */
    get outputHooks() {
        return this._outputHooks;
    }
}

module.exports = Flow;