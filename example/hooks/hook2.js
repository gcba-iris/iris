'use strict';

const Hook = require('../../lib/bases/Hook');

class Hook2 extends Hook {
    constructor(name) {
        super(name);
    }

    get path() {
        return __filename;
    }

    process(data) {
        console.log('[Hook2] Running...');
    }
}

module.exports = new Hook2('hook2');