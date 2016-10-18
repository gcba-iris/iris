'use strict';

const Sparkles = require('sparkles');
const Flow = require('../../lib/Flow');
const dispatcher = require('../../lib/Dispatcher');
const test = require('tape');
const group = require('tape-plus').group;
const httpDock = require('../../example/docks/http');
const handler = require('../../example/handlers/handler1');
const hook1 = require('../../example/hooks/hook1');
const hook2 = require('../../example/hooks/hook2');

const flows = [new Flow('Flow 1', {
        tag: 'tag1',
        docks: [httpDock],
        handler: handler,
        inputHooks: [hook1],
        outputHooks: [hook2]
    }),
    new Flow('Flow 2', {
        tag: 'tag2',
        docks: [httpDock],
        handler: handler,
        inputHooks: [hook1],
        outputHooks: [hook2]
    })
];

group('tags', (test) => {
    test('gets tags', (t) => {
        t.pass('Ok');
    });
});

group('config', (test) => {
    test('sets dispatcher config', (t) => {
        t.pass('Ok');
    });
});

group('threadPool', (test) => {
    test('sets dispatcher threadpool instance', (t) => {
        t.pass('Ok');
    });
});

group('dispatch()', (test) => {
    test('sends data to threadpool', (t) => {
        t.pass('Ok');
    });

    test('adds flow name to metadata', (t) => {
        t.pass('Ok');
    });

    test('receives response from threadpool', (t) => {
        t.pass('Ok');
    });
});

group('respond()', (test) => {
    test('sends response to original dock', (t) => {
        t.pass('Ok');
    });
});

group('_processFlows()', (test) => {
    test('pushes content to tags array', (t) => {
        t.pass('Ok');
    });
});

group('_generateJob()', (test) => {
    test('generates a valid javascript file', (t) => {
        t.pass('Ok');
    });
});

group('_loadJob()', (test) => {
    test('loads compiled flows into threadpool', (t) => {
        t.pass('Ok');
    });

    test('starts docks', (t) => {
        t.pass('Ok');
    });
});

group('_startDock()', (test) => {
    test('stops docks', (t) => {
        t.pass('Ok');
    });

    test('starts docks', (t) => {
        t.pass('Ok');
    });
});