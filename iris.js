/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

const archie = require('archiejs');
const vantage = require("vantage")();
const core = [
    {
        packagePath: 'core/dispatcher',
        name: 'dispatcher'
    }, {
        packagePath: 'core/utils',
        name: 'utils'
    }
];
const dependencies = archie.resolveConfig(core, __dirname); // Dependency trees

archie.createApp(dependencies, (err) => {
    console.log('Iris up and running');
});