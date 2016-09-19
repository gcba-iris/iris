const archie = require('archiejs');
const dispatcher = ['core/dispatcher'];
const utils = ['core/utils'];
const dependencies = archie.resolveConfig(dispatcher, __dirname); // Dependency trees

archiejs.createApp(dependencies, (err) => {

});