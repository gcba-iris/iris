/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const MiniSignal = require('mini-signals');

class Dock {
    constructor(dispatcher, options = {}) {
        this._meta = options.meta;
        this._ports = options.ports;
        this._parser = options.parser;
        this._encoder = options.encoder;
        this._dispatcher = dispatcher;
        this._signal = new MiniSignal();
    }

    get ports() {
        return this._ports;
    }

    parse(message) {
        // TODO: Default implementation
    }

    send(data) {
        this._dispatcher.dispatch(data);
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