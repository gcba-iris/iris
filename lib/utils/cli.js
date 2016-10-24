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
const changeCase = require('change-case');
const npm = require('npm-programmatic');
const utils = require('./utils');

const consoleLog = utils.log;
const irisfile = 'const iris = require(\'iris\');\n';

const checkFile = (fileName) => {
    try {
        return fs.statSync(path.join(process.cwd(), fileName)).isFile();
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;

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

const checkFolder = (folder) => {
    try {
        return fs.statSync(path.join(process.cwd(), folder)).isDirectory();
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;

        return false;
    }
};

const createFolder = (folder) => {
    try {
        fs.mkdirSync(path.join(process.cwd(), folder));
    } catch (error) {
        return false;
    }

    return true;
};

const newFolder = (folder, spinner) => {
    if (checkFolder(folder)) {
        spinner.fail();
        consoleLog.error('Directory \'' + folder + '\' already exists');

        process.exit(1);
    }

    if (!createFolder(folder)) {
        spinner.fail();
        consoleLog.error('Could not create directory \'' + folder + '\'');

        process.exit(1);
    }
};

const newFile = (fileName, content, spinner) => {
    if (!createFile(fileName, content)) {
        spinner.fail();
        consoleLog.error('Could not create ' + fileName);

        process.exit(1);
    }
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

        newFile('irisfile.js', JSON.stringify(irisfile), spinner);
        spinner.succeed();
        spinner = ora('Running \'npm install gcba-iris/iris --save\'');
        spinner.start();

        npm.install(['gcba-iris/iris'], {
                cwd: process.cwd(),
                save: true
            })
            .then(() => {
                spinner.succeed();
                consoleLog.info('Done!');

                process.exit(0);
            })
            .catch((error) => {
                spinner.fail();
                consoleLog.error('Unable to do \'npm install gcba-iris/iris --save\'');

                process.exit(1);
            });
    },
    new: (name) => {
        const packageTemplate = {
            "name": "",
            "version": "0.1.0",
            "description": "",
            "main": "irisfile.js",
            "dependencies": {
                "iris": "github:gcba-iris/iris"
            },
            "devDependencies": {},
            "scripts": {
                "test": "echo \"Error: no test specified\" && exit 1"
            },
            "keywords": [],
            "author": "",
            "license": "MIT"
        };

        var spinner;

        spinner = ora('Creating directories');
        newFolder(name, spinner);
        process.chdir(path.join(process.cwd(), name));
        newFolder('docks', spinner);
        newFolder('handlers', spinner);
        newFolder('hooks', spinner);
        spinner.succeed();

        spinner = ora('Creating files');
        spinner.start();
        packageTemplate['name'] = changeCase.paramCase(name);

        newFile('package.json', JSON.stringify(packageTemplate, undefined, 4), spinner);
        newFile('irisfile.js', irisfile, spinner);
        spinner.succeed();
        consoleLog.info('Done!');
        consoleLog.info('New iris project created in ' + process.cwd());

        process.exit(0);
    },
    config: () => {

    },
    help: () => {}
};

module.exports = cli;