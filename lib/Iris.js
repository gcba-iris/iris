/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Vantage = require('vantage');

class Iris {
    constructor() {
        this.cli = new Vantage();
    }

    init(env) {
        console.dir(env);

        if (this.configPath) {
            process.chdir(this.configBase);
        } else {
            console.log('No Irisfile found.');
            process.exit(1);
        }
    }
}

module.exports = new Iris();