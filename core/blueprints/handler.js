'use strict';

const MiniSignal = require('mini-signals');

class HandlerBase {
    constructor(options) {
        this.options = options;
        this.signal = new MiniSignal();
    }

    handle(data) {

    }

    release() {

    }
}

module.exports = HandlerBase;