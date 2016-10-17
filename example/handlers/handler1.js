'use strict';

const Handler = require('../../lib/bases/Handler');

class Handler1 extends Handler {
    constructor(name) {
        super(name);
    }

    get path() {
        return __filename;
    }

    handle(data) {
        this.logger.info('[Handler1] Handling data...');

        return 'A response';
    }
}

module.exports = new Handler1('handler1');