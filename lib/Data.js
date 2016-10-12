/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const shortid = require('shortid');

class Data {
    constructor(tag, meta, data) {
        this.tag = tag ? tag : undefined;
        this.meta = meta;
        this.data = data;
        this.id = shortid.generate();
    }
}

module.exports = Data;