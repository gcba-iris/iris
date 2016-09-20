'use strict';

const MiniSignal = require('mini-signals');

class DockBase {
    constructor(ports, parser, encoder) {
        this.ports = ports;
        this.parser = parser;
        this.encoder = encoder;
        this.signal = new MiniSignal();
    }

    listen(ports) {

    }

    parse(message) {

    }

    pass(data) {

    }

    encode(response) {

    }

    reply(message) {

    }

    release() {

    }
}

module.exports = DockBase;