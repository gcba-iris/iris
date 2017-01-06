/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const chalk = require('chalk');
const logger = require('winston');
const util = require('util');

const log = {
    /**
     * Logs an information message to the console.
     *
     * @param {string} message
     */
    info: (message) => {
        console.info(chalk.dim(message));
    },

    /**
     * Logs an error message to the console.
     *
     * @param {string} message
     */
    error: (message) => {
        console.error(chalk.red(message));
    },

    /**
     * Logs a warning message to the console.
     *
     * @param {string} message
     */
    warn: (message) => {
        console.warn(chalk.yellow(message));
    }
};

/**
 * Check if the param is a string.
 *
 * @param {any} thing
 */
const isString = (thing) => {
    return typeof thing === 'string' || thing instanceof String;
};

/**
 * Check if the param is a plain object.
 *
 * @param {any} thing
 */
const isPlainObject = (thing) => {
    return typeof thing === 'object' &&
            thing !== null &&
            thing.constructor === Object &&
            thing.hasOwnProperty('isPrototypeOf') === false &&
            thing.toString() === '[object Object]';
};

/**
 * Check if the param has a toString() method.
 *
 * @param {Object} thing
 */
const hasToString = (thing) => {
    return !util.isFunction(thing) &&
        thing.toString &&
        util.isFunction(thing.toString) &&
        thing.toString() !== '[object Object]';
};

const banner = `
          _          _            _         _        \r\n         \/\\ \\       \/\\ \\         \/\\ \\      \/ \/\\      \r\n         \\ \\ \\     \/  \\ \\        \\ \\ \\    \/ \/  \\     \r\n         \/\\ \\_\\   \/ \/\\ \\ \\       \/\\ \\_\\  \/ \/ \/\\ \\__  \r\n        \/ \/\\\/_\/  \/ \/ \/\\ \\_\\     \/ \/\\\/_\/ \/ \/ \/\\ \\___\\ \r\n       \/ \/ \/    \/ \/ \/_\/ \/ \/    \/ \/ \/    \\ \\ \\ \\\/___\/ \r\n      \/ \/ \/    \/ \/ \/__\\\/ \/    \/ \/ \/      \\ \\ \\       \r\n     \/ \/ \/    \/ \/ \/_____\/    \/ \/ \/   _    \\ \\ \\      \r\n ___\/ \/ \/__  \/ \/ \/\\ \\ \\  ___\/ \/ \/__ \/_\/\\__\/ \/ \/      \r\n\/\\__\\\/_\/___\\\/ \/ \/  \\ \\ \\\/\\__\\\/_\/___\\\\ \\\/___\/ \/       \r\n\\\/_________\/\\\/_\/    \\_\\\/\\\/_________\/ \\_____\\\/\n`;

module.exports = {
    log,
    isString,
    isPlainObject,
    hasToString,
    banner
};