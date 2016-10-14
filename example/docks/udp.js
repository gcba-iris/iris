'use strict';

const Dock = require('../../lib/bases/Dock');

class UDPDock extends Dock {
    constructor(name, protocol) {
        super(name);
    }

    get path() {
        return __filename;
    }

    listen(port) {
        console.log('[UDP Dock] Listening on port ' + port + '...');
    }

    reply(message) {
        console.log('[HTTP Dock] Sending reply...');
    }
}

module.exports = new UDPDock('udp', 'UDP');