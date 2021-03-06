'use strict';

const Hook = require('../../lib/bases/Hook');

class Hook1 extends Hook {
    constructor(name) {
        super(name);
    }

    get path() {
        return __filename;
    }

    process(data) {
        this.logger.info('[Hook1] Running...');
    }
}

module.exports = new Hook1('hook1');