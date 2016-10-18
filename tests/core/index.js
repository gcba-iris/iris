'use strict';

const Sparkles = require('sparkles');
const BaseDock = require('../../lib/bases/Dock');
const BaseHandler = require('../../lib/bases/Handler');
const BaseHook = require('../../lib/bases/Hook');
const test = require('tape');
const group = require('tape-plus').group;
const httpDock = require('../../example/docks/http');
const handler = require('../../example/handlers/handler1');
const hook1 = require('../../example/hooks/hook1');
const hook2 = require('../../example/hooks/hook2');

group('iris.config', (test) => {
    test('sets Iris config', (t) => {
        t.pass('Ok');
    });

    test('gets Iris config', (t) => {
        t.pass('Ok');
    });
});

group('iris.logger', (test) => {
    test('gets logger instance', (t) => {
        t.pass('Ok');
    });
});

group('iris.modules', (test) => {
    test('gets list of active module paths', (t) => {
        t.pass('Ok');
    });
});

group('iris.flows', (test) => {
    test('gets list of active flows', (t) => {
        t.pass('Ok');
    });
});

group('iris.Dock', (test) => {
    test('gets base Dock class', (t) => {
        t.pass('Ok');
    });
});

group('iris.Handler', (test) => {
    test('gets base Handler class', (t) => {
        t.pass('Ok');
    });
});

group('iris.Hook', (test) => {
    test('gets base Hook class', (t) => {
        t.pass('Ok');
    });
});

group('iris._checkConfig()', (test) => {
    test('checks Iris config', (t) => {
        t.pass('Ok');
    });
});

group('iris._checkFlowOptions()', (test) => {
    test('checks flow schema', (t) => {
        t.pass('Ok');
    });
});

group('iris._validateDocks()', (test) => {
    test('validate registered docks', (t) => {
        t.pass('Ok');
    });
});

group('iris._validateHooks()', (test) => {
    test('validate registered input hooks', (t) => {
        t.pass('Ok');
    });

    test('validate registered output hooks', (t) => {
        t.pass('Ok');
    });
});

group('iris._validateHandler()', (test) => {
    test('validate registered handler', (t) => {
        t.pass('Ok');
    });
});

group('iris._handleErrors()', (test) => {
    test('log validation errors', (t) => {
        t.pass('Ok');
    });
});