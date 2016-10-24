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
const paramCase = require('param-case');
const npm = require('npm-cmd');
const utils = require('./utils');

const consoleLog = utils.log;
const irisfile = 'const iris = require(\'iris\');\n';

const handleErrors = (errors, spinner) => {
    spinner.fail();

    errors.forEach(function (error) {
        consoleLog.error(error);
    }, this);

    process.exit(1);
};

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

const newFile = (fileName, content, spinner) => {
    if (!createFile(fileName, content)) {
        handleErrors(['Could not create ' + fileName], spinner);
    }
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
        handleErrors(['Directory \'' + folder + '\' already exists'], spinner);
    }

    if (!createFolder(folder)) {
        handleErrors(['Could not create directory \'' + folder + '\''], spinner);
    }
};

const cli = {
    status: () => {

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
        packageTemplate['name'] = paramCase(name);

        newFile('package.json', JSON.stringify(packageTemplate, undefined, 4), spinner);
        newFile('irisfile.js', irisfile, spinner);
        spinner.succeed();

        spinner = ora('Running \'npm install\'');
        spinner.start();

        npm.install([], {
            cwd: process.cwd()
        }, (error) => {
            if (error) {
                handleErrors(['Unable to do \'npm install\''], spinner);
            }

            spinner.succeed();
            consoleLog.info('Done!');
            consoleLog.info('New iris project created at ' + process.cwd());

            process.exit(0);
        });
    },
    init: () => {
        var spinner;

        spinner = ora('Checking package.json');
        spinner.start();

        if (checkFile('package.json')) {
            spinner.succeed();
        } else {
            const errors = ['package.json not found', 'You need to run this command inside a npm module folder'];

            handleErrors(errors, spinner);
        }

        spinner = ora('Creating Irisfile');
        spinner.start();

        if (checkFile('irisfile.js')) {
            handleErrors(['Irisfile already exists'], spinner);
        }

        newFile('irisfile.js', JSON.stringify(irisfile), spinner);
        spinner.succeed();
        spinner = ora('Running \'npm install gcba-iris/iris --save\'');
        spinner.start();

        npm.install(['gcba-iris/iris'], {
            cwd: process.cwd(),
            save: true
        }, (error) => {
            if (error) {
                handleErrors(['Unable to do \'npm install gcba-iris/iris --save\''], spinner);
            }

            spinner.succeed();
            consoleLog.info('Done!');

            process.exit(0);
        });
    },
    config: () => {

    },
    help: () => {
        const helpText = `
Commands:

    iris
        Runs Iris in the current directory.

    iris new [project-name]
        Creates a new empty Iris project at the directory [project-name].

    iris init
        Creates an empty Irisfile and installs Iris locally.`;

        consoleLog.info(utils.banner);
        console.log(helpText + '\n\n');
        process.exit(0);
    }
};

module.exports = cli;