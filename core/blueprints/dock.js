/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const MiniSignal = require('mini-signals');

class Dock {
    constructor(options, imports) {
        this.meta = options.meta;
        this.ports = options.ports;
        this.parser = options.parser;
        this.encoder = options.encoder;
        this.dispatcher = imports.dispatcher;
        this.signal = new MiniSignal();
    }

    parse(message) {
        // TODO: Default implementation
    }

    send(data) {
        this.dispatcher.dispatch(data);
    }

    encode(response) {
        // TODO: Default implementation
    }

    release() {
        // TODO: Implementation
    }

    /*
     * This method must be implemented by the child classes
     *
     listen(ports) {

     }
     */

    /*
     * This method must be implemented by the child classes
     *
     reply(message) {

     }
     */
}

module.exports = Dock;