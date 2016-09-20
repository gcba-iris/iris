/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const MiniSignal = require('mini-signals');

class Handler {
    constructor(options, imports) {
        this.options = options;
        this.dispatcher = imports.dispatcher;
        this.signal = new MiniSignal();
    }

    send(response) {
        this.dispatcher.respond(response);
    }

    release() {
        // TODO: Implementation
    }

    /*
     * This method must be implemented by the child classes
     *
     handle(data) {

     }
     */
}

module.exports = Handler;