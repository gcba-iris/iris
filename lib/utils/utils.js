/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const chalk = require('chalk');
const logger = require('winston');

const log = {
    info: (message) => {
        console.info(chalk.dim(message));
    },
    error: (message) => {
        console.error(chalk.red(message));
    },
    warn: (message) => {
        console.warn(chalk.yellow(message));
    }
};

module.exports = {
    log: log
};