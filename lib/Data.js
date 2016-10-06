/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const shortid = require('shortid');

class Data {
    constructor() {
        this._id = shortid.generate();
    }

    get id() {
        return this._id;
    }
}

module.exports = Data;