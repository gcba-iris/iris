'use strict';

const MiniSignal = require('mini-signals');

class Dispatcher {
    constructor(options) {
        this.options = options;
        this.signal = new MiniSignal();
    }

    register() {

    }

    dispatch(data) {

    }

    respond() {

    }
}

module.exports = function setup(options, imports) {
    const dispatcher = new Dispatcher(options);

    return dispatcher;
}