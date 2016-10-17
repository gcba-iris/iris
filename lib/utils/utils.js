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
    error: (message) => {
        console.error(chalk.red(message));
        logger.error(message);
    },
    warn: (message) => {
        console.warn(chalk.yellow(message));
        logger.warn(message);
    }
};

module.exports = {
    log: log
};