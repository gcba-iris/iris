const archie = require('archiejs');
const core = [{
    packagePath: 'core/dispatcher',
    name: 'Dispatcher'
}, {
    packagePath: 'core/utils',
    name: 'Utils'
}];
const dependencies = archie.resolveConfig(core, __dirname); // Dependency trees

archiejs.createApp(dependencies, (err) => {

});