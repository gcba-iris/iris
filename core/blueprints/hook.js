/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * MIT Licensed
 *
 */

'use strict';

const MiniSignal = require('mini-signals');

class HookBase {
    constructor(options, imports) {
        this.options = options;
        this.signal = new MiniSignal();
    }

    /*
     * This method must be implemented by the child classes
     *
     run(data) {

     }
     */

    release() {
        // TODO: Implementation
    }
}

module.exports = HookBase;