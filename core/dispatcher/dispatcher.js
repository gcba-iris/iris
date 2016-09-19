'use strict';

class Dispatcher {
    constructor(options) {
        this.options = options;
    }

    dispatch(data) {

    }

    respond() {

    }
}

module.exports = function setup(options, imports) {
    const dispatcher = Dispatcher(options);

    return dispatcher;
}