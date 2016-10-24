/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const fs = require('graceful-fs');
const path = require('path');
const ora = require('ora');
const npm = require('npm-programmatic');
const utils = require('./utils');

const consoleLog = utils.log;
const irisfile = 'const iris = require(\'iris\');\n';

const checkFile = (fileName) => {
    try {
        return fs.statSync(path.join(process.cwd(), fileName)).isFile();
    } catch (error) {
        if (error.code !== 'ENOENT')
            throw error;

        return false;
    }
};

const createFile = (fileName, content) => {
    try {
        fs.writeFileSync(path.join(process.cwd(), fileName), content);
    } catch (error) {
        return false;
    }

    return true;
};

const cli = {
    status: () => {

    },
    init: () => {
        var spinner;

        spinner = ora('Checking package.json');
        spinner.start();

        if (checkFile('package.json')) {
            spinner.succeed();
        } else {
            spinner.fail();
            consoleLog.error('package.json not found');
            consoleLog.error('You need to run this command inside a npm module folder');

            process.exit(1);
        }

        spinner = ora('Creating Irisfile');
        spinner.start();

        if (checkFile('irisfile.js')) {
            spinner.fail();
            consoleLog.error('Irisfile already exists');

            process.exit(1);
        }

        if (createFile('irisfile.js', irisfile)) {
            spinner.succeed();
            spinner = ora('Running \'npm install gcba-iris/iris --save\'');
            spinner.start();

            npm.install(['gcba-iris/iris'], {
                    cwd: process.cwd(),
                    save: true
                })
                .then(() => {
                    spinner.succeed();
                    consoleLog.info('Done');

                    process.exit(0);
                })
                .catch((error) => {
                    spinner.fail();
                    consoleLog.error('Unable to do \'npm install gcba-iris/iris --save\'');

                    process.exit(1);
                });
        } else {
            spinner.fail();
            consoleLog.error('Could not create Irisfile');

            process.exit(1);
        }
    },
    new: (name) => {

    },
    config: () => {

    },
    help: () => {}
};

module.exports = cli;