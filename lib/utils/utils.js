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

const banner = `
          _          _            _         _        \r\n         \/\\ \\       \/\\ \\         \/\\ \\      \/ \/\\      \r\n         \\ \\ \\     \/  \\ \\        \\ \\ \\    \/ \/  \\     \r\n         \/\\ \\_\\   \/ \/\\ \\ \\       \/\\ \\_\\  \/ \/ \/\\ \\__  \r\n        \/ \/\\\/_\/  \/ \/ \/\\ \\_\\     \/ \/\\\/_\/ \/ \/ \/\\ \\___\\ \r\n       \/ \/ \/    \/ \/ \/_\/ \/ \/    \/ \/ \/    \\ \\ \\ \\\/___\/ \r\n      \/ \/ \/    \/ \/ \/__\\\/ \/    \/ \/ \/      \\ \\ \\       \r\n     \/ \/ \/    \/ \/ \/_____\/    \/ \/ \/   _    \\ \\ \\      \r\n ___\/ \/ \/__  \/ \/ \/\\ \\ \\  ___\/ \/ \/__ \/_\/\\__\/ \/ \/      \r\n\/\\__\\\/_\/___\\\/ \/ \/  \\ \\ \\\/\\__\\\/_\/___\\\\ \\\/___\/ \/       \r\n\\\/_________\/\\\/_\/    \\_\\\/\\\/_________\/ \\_____\\\/\n`;

module.exports = {
    log: log,
    banner: banner
};