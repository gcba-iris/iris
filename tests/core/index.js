'use strict';

const Sparkles = require('sparkles');
const Flow = require('../../lib/Flow');
const BaseDock = require('../../lib/bases/Dock');
const BaseHandler = require('../../lib/bases/Handler');
const BaseHook = require('../../lib/bases/Hook');
const iris = require('../../index');
const test = require('tape');
const group = require('tape-plus').group;
const httpDock = require('../../example/docks/http');
const handler = require('../../example/handlers/handler1');
const hook1 = require('../../example/hooks/hook1');
const hook2 = require('../../example/hooks/hook2');

const config = {
    threads: 4,
    logLevel: 'warn',
    events: {
        dispatcher: true,
        docks: true,
        handlers: true,
        hooks: true
    }
};

group('iris.config', (test) => {
    test('sets Iris config', (t) => {
        iris.config = config;

        setTimeout(() => {
            t.deepEqual(iris._config, config);
        }, 5);
    });

    test('gets Iris config', (t) => {
        t.deepEqual(iris.config, config);
    });
});

group('iris.logger', (test) => {
    test('gets logger instance', (t) => {
        const logger = require('winston');
        t.deepLooseEqual(iris.logger, logger);
    });
});

group('iris.modules', (test) => {
    test('gets list of active module paths', (t) => {
        t.equal(Array.isArray(iris.modules), true);
    });
});

group('iris.flows', (test) => {
    test('gets list of active flows', (t) => {
        t.equal(Array.isArray(iris.flows), true);
    });
});

group('iris.flow()', (test) => {
    test('registers a new flow', (t) => {
        const flow = new Flow('Flow 1', {
            tag: 'tag1',
            docks: [httpDock],
            handler: handler,
            inputHooks: [hook1],
            outputHooks: [hook2]
        });

        iris.flow('Flow 1', {
            tag: 'tag1',
            docks: [httpDock],
            handler: handler,
            inputHooks: [hook1],
            outputHooks: [hook2]
        });

        setTimeout(() => {
            t.deepEqual(iris.flows[0], flow);
        }, 5);
    });
});

group('iris.Dock', (test) => {
    test('gets base Dock class', (t) => {
        t.deepLooseEqual(iris.Dock, BaseDock);
    });
});

group('iris.Handler', (test) => {
    test('gets base Handler class', (t) => {
        t.deepLooseEqual(iris.Handler, BaseHandler);
    });
});

group('iris.Hook', (test) => {
    test('gets base Hook class', (t) => {
        t.deepLooseEqual(iris.Hook, BaseHook);
    });
});