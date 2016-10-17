/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const chalk = require('chalk');

const log = {
    error: (message) => console.log(chalk.red(output)),
    warn: (message) => console.log(chalk.yellow(output))
};

module.exports = {
    log: log
};