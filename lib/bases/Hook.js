/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const MiniSignal = require('mini-signals');

class Hook {
    constructor(options = {}) {
        this._options = options;
        this._signal = new MiniSignal();
    }

    release() {
        // TODO: Implementation
    }

    /*
     * This method must be implemented by the child classes
     *
     run(data) {

     }
     */
}

module.exports = Hook;