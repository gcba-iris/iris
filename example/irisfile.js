const iris = require('../index');
const dock = require('./docks/http');
const handler = require('./handlers/handler1');
const inputHook = require('./hooks/hook1');
const outputHook = require('./hooks/hook2');

iris.config = {
    threads: 4,
    logLevel: 'verbose', // TODO: Implement
    events: {
        dispatcher: true,
        docks: true
    },
    vantage: {
        enabled: false,
        port: 1337
    }
};

dock.config = {
    port: 5000,
    parser: {
        subtagSeparator: '|',
        dataSeparator: ','
    },
    encoder: {
        subtagSeparator: '|',
        dataSeparator: ','
    },
    maxMessageLength: 100
};

iris.flow('Flow 1', {
    tag: 'tag1',
    docks: [dock],
    handler: handler,
    inputHooks: [inputHook],
    outputHooks: [outputHook]
});

iris.flow('Flow 2', {
    tag: 'tag2',
    docks: [dock],
    handler: handler,
    inputHooks: [inputHook],
    outputHooks: [outputHook]
});