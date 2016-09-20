'use strict';

const MiniSignal = require('mini-signals');

class HookBase {
    constructor(options) {
        this.options = options;
        this.signal = new MiniSignal();
    }

    run(data) {

    }

    release() {

    }
}

module.exports = HookBase;