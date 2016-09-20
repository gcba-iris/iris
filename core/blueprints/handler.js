/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * MIT Licensed
 *
 */

'use strict';

const MiniSignal = require('mini-signals');

class HandlerBase {
    constructor(options, imports) {
        this.options = options;
        this.dispatcher = imports.dispatcher;
        this.signal = new MiniSignal();
    }

    /*
     * This method must be implemented by the child classes
     *
     handle(data) {

     }
     */

    send(response) {
        this.dispatcher.respond(response);
    }

    release() {
        // TODO: Implementation
    }
}

module.exports = HandlerBase;