/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

const archie = require('archiejs');
const core = [{
    packagePath: 'core/dispatcher',
    name: 'Dispatcher'
}, {
    packagePath: 'core/utils',
    name: 'Utils'
}];
const dependencies = archie.resolveConfig(core, __dirname); // Dependency trees

archie.createApp(dependencies, (err) => {
    console.log('Iris up and running');

    // TODO: Show an ASCII table with components loaded, ports used, uptime
});