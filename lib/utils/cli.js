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
const logger = require('winston');
const utils = require('./utils');
const packageData = require('../../package.json');

const consoleLog = utils.log;
const irisfile = 'const iris = require(\'iris\');\n';

/**
 * Displays success messages and then exits Iris.
 *
 * @param {string[]} messages
 * @param {Object} spinner
 */
const handleSuccess = (messages, spinner) => {
    spinner.succeed();
    process.stdout.write('\n');

    messages.forEach(function (message) {
        consoleLog.info(message);
    }, this);

    process.stdout.write('\n');

    process.exit(0);
};

/**
 * Displays error messages and then exits Iris with an error code.
 *
 * @param {string[]} errors
 * @param {Object} spinner
 */
const handleErrors = (errors, spinner) => {
    spinner.fail();
    process.stdout.write('\n');

    errors.forEach(function (error) {
        consoleLog.error(error);
    }, this);

    process.stdout.write('\n');

    process.exit(1);
};

/**
 * Displays an error message and then exits Iris with an error code.
 *
 * @param {string} message
 */
const fail = (message) => {
    process.stdout.write('\n');
    logger.error(message);
    process.stdout.write('\n');

    process.exit(1);
};

/**
 * Checks that a file exists.
 *
 * @param {string} fileName
 * @return {boolean} Whether the file exists or not
 */
const checkFile = (fileName) => {
    try {
        return fs.statSync(path.join(process.cwd(), fileName)).isFile();
    }
    catch (error) {
        if (error.code !== 'ENOENT') throw error;

        return false;
    }
};

/**
 * Crates a new file.
 *
 * @param {string} fileName
 * @param {Object} content
 * @return {boolean} Whether the file was created successfully or not
 */
const createFile = (fileName, content) => {
    try {
        fs.writeFileSync(path.join(process.cwd(), fileName), content);
    }
    catch (error) {
        return false;
    }

    return true;
};

/**
 * Handles the creation of a new file.
 *
 * @param {string} fileName
 * @param {string} content
 * @param {Object} spinner
 */
const newFile = (fileName, content, spinner) => {
    if (!createFile(fileName, content)) handleErrors([`Could not create ${fileName}`], spinner);
};

/**
 * Checks that a folder exists.
 *
 * @param {string} folderName
 * @return  {boolean} Whether the folder exists or not
 */
const checkFolder = (folderName) => {
    try {
        return fs.statSync(path.join(process.cwd(), folderName)).isDirectory();
    }
    catch (error) {
        if (error.code !== 'ENOENT') throw error;

        return false;
    }
};

/**
 * Creates a new folder.
 *
 * @param {string} folderName
 * @return {boolean} Whether the folder was created successfully or not
 */
const createFolder = (folderName) => {
    try {
        fs.mkdirSync(path.join(process.cwd(), folderName));
    }
    catch (error) {
        return false;
    }

    return true;
};

/**
 * Handles the creation of a new folder.
 *
 * @param {string} folderName
 * @param {Object} spinner
 */
const newFolder = (folderName, spinner) => {
    if (checkFolder(folderName)) handleErrors([`Directory '${folderName}' already exists`], spinner);
    if (!createFolder(folderName)) handleErrors([`Could not create directory '${folderName}'`], spinner);
};

/**
 * Creates all the folders for a new project.
 *
 * @param {string} message
 */
const createFolders = (name) => {
    const spinner = ora('Creating directories');

    newFolder(name, spinner);
    process.chdir(path.join(process.cwd(), name));
    newFolder('docks', spinner);
    newFolder('handlers', spinner);
    newFolder('hooks', spinner);
    spinner.succeed();
};

/**
 * Creates all the files for a new project.
 *
 * @param {string} message
 */
const createFiles = (name) => {
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
    const spinner = ora('Creating files').start();

    packageTemplate['name'] = paramCase(name);

    newFile('package.json', JSON.stringify(packageTemplate, undefined, 4), spinner);
    newFile('irisfile.js', irisfile, spinner);
    spinner.succeed();
};

/**
 * Installs all the needed dependencies for a new project.
 *
 * @param {string} message
 */
const installDependencies = () => {
    const spinner = ora('Running \'npm install\'').start();

    npm.install([], {
        cwd: process.cwd()
    }, (error) => {
        if (error) handleErrors(['Unable to do \'npm install\''], spinner);

        const messages = [
            'Done!', `New iris project created at ${process.cwd()}`
        ];

        handleSuccess(messages, spinner);
    });
};

/**
 * Checks if package.json exists.
 *
 */
const checkPackageFile = () => {
    const spinner = ora('Checking package.json').start();

    if (checkFile('package.json')) spinner.succeed();
    else {
        const errors = ['package.json not found', 'You need to run this command inside a node module folder'];

        handleErrors(errors, spinner);
    }
};

/**
 * Creates a new Irisfile.
 *
 */
const createIrisfile = () => {
    const spinner = ora('Creating Irisfile').start();

    if (checkFile('irisfile.js')) handleErrors(['Irisfile already exists'], spinner);

    newFile('irisfile.js', irisfile, spinner);
    spinner.succeed();
};

/**
 * Installs a local copy of Iris.
 *
 */
const installIris = () => {
    const spinner = ora('Running \'npm install gcba-iris/iris --save\'').start();

    npm.install(['gcba-iris/iris'], {
        cwd: process.cwd(),
        save: true
    }, (error) => {
        if (error) handleErrors(['Unable to run \'npm install gcba-iris/iris --save\''], spinner);

        handleSuccess(['Done'], spinner);
    });
};

const cli = {
    /**
     * Displays the current Iris version.
     *
     */
    version: () => {
        console.log(packageData.version);

        process.exit(0);
    },

    /**
     * Shows a runtime information dashboard.
     *
     */
    status: () => {
        fail('This command is not implemented yet');
    },

    /**
     * Creates a new Iris project.
     *
     * @param {string} name
     */
    new: (name) => {
        consoleLog.info(utils.banner + '\n');

        if (!name) fail('No project name specified');

        createFolders(name);
        createFiles(name);
        installDependencies();
    },

    /**
     * Initializes a new Iris project in an existing directory.
     *
     */
    init: () => {
        consoleLog.info(utils.banner + '\n');

        checkPackageFile();
        createIrisfile();
        installIris();
    },

    /**
     * Displays an Iris project's settings.
     *
     */
    config: () => {
        fail('This command is not implemented yet');
    },

    /**
     * Handles an unknown command.
     *
     * @param {string} command
     */
    error: (command) => {
        fail(`Command '${command}' not found`);
    },

    /**
     * Shows a list of Iris' commands.
     *
     */
    help: () => {
        const helpText = `
Usage: iris [command]

Commands:

    iris
        Runs Iris in the current directory.

    iris new [project-name]
        Creates a new empty Iris project at the directory [project-name].

    iris init
        Creates an empty Irisfile and installs Iris locally.

    iris --version
        Displays Iris's version.

    iris --help
        Displays this message.`;

        consoleLog.info(utils.banner);
        process.stdout.write(helpText + '\n\n');

        process.exit(0);
    }
};

module.exports = cli;