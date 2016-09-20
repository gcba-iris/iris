/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * MIT Licensed
 *
 */

'use strict';

const MiniSignal = require('mini-signals');

class DockBase {
    constructor(options, imports) {
        this.ports = options.ports;
        this.parser = options.parser;
        this.encoder = options.encoder;
        this.dispatcher = imports.dispatcher;
        this.signal = new MiniSignal();
    }

    /*
     * This method must be implemented by the child classes
     *
     listen(ports) {

     }
     */

    parse(message) {
        // TODO: Default Implementation
    }

    send(data) {
        this.dispatcher.dispatch(data);
    }

    encode(response) {
        // TODO: Default Implementation
    }

    /*
     * This method must be implemented by the child classes
     *
     reply(message) {

     }
     */

    release() {
        // TODO: Implementation
    }
}

module.exports = DockBase;