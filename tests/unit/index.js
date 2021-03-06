'use strict';

const Flow = require('../../lib/Flow');
const BaseDock = require('../../lib/bases/Dock');
const BaseHandler = require('../../lib/bases/Handler');
const BaseHook = require('../../lib/bases/Hook');
const iris = require('../../index');
const test = require('tape-plus');
const group = require('tape-plus').group;
const httpDock = require('../../example/docks/http');
const handler = require('../../example/handlers/handler1');
const hook1 = require('../../example/hooks/hook1');
const hook2 = require('../../example/hooks/hook2');

const config = {
    threads: 4,
    logLevel: 'error',
    events: {
        dispatcher: true,
        docks: true,
        handlers: true,
        hooks: true
    }
};

iris._logger.level = 'error'; // This affects all other tests (the Winston instance is a singleton)

group('iris.config', (test) => {
    test('sets Iris config', (t) => {
        iris.config = config;

        setTimeout(() => {
            t.deepEqual(iris._config, config);
        }, 5);
    });

    test('sets Iris config with events disabled', (t, next) => {
        let valid = false;

        iris._logger.verbose = () => {
            valid = true;
        };
        iris.config = {
            threads: 4,
            logLevel: 'error'
        };

        setTimeout(() => {
            t.equal(valid, true);

            next();
        }, 5);
    });

    test('gets Iris config', (t) => {
        t.deepEqual(iris.config, config);
    });
});

group('iris.logger', (test) => {
    test('gets logger instance', (t) => {
        if (iris.logger) t.pass('Ok');
        else t.fail('No logger instance returned');
    });
});

group('iris.modules', (test) => {
    test('gets list of active module paths', (t) => {
        t.equal(Array.isArray(Object.keys(iris.modules)), true);
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

group('iris.flow()', (test) => {
    test('does not validate the same hook twice', (t) => {
        let valid = false;

        iris._logger.silly = () => {
            valid = true;
        };

        iris.flow('Flow 1', {
            tag: 'tag1',
            docks: [httpDock],
            handler: handler,
            inputHooks: [hook1],
            outputHooks: [hook1]
        });

        t.equal(valid, true);
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

group('iris._handleErrors()', (test) => {
    test('handles errors', (t, next) => {
        let failed = true;
        const spinner = {
            fail: () => {
                failed = false;
            }
        };

        iris._checkFlowOptions({ tag: 'test', docks: [] }, spinner);

        setTimeout(() => {
            t.equal(failed, false);

            next();
        }, 5);
    });
});