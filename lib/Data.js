/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const shortid = require('shortid');

class Data {
    constructor(tags, meta, data) {
        this._tags = tags ? tags : undefined;
        this._meta = meta;
        this._data = data;
        this._id = shortid.generate();
    }

    get id() {
        return this._id;
    }

    get tags() {
        return this._tags;
    }

    get meta() {
        return this._meta;
    }

    get data() {
        return this._data;
    }
}

module.exports = Data;