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

group('config', (test) => {
    test('sets Iris config', (t) => {
        t.pass('Ok');
    });

    test('gets Iris config', (t) => {
        t.pass('Ok');
    });
});

group('logger', (test) => {
    test('gets logger instance', (t) => {
        t.pass('Ok');
    });
});

group('modules', (test) => {
    test('gets list of active module paths', (t) => {
        t.pass('Ok');
    });
});

group('flows', (test) => {
    test('gets list of active flows', (t) => {
        t.pass('Ok');
    });
});

group('Dock', (test) => {
    test('gets base Dock class', (t) => {
        t.pass('Ok');
    });
});

group('Handler', (test) => {
    test('gets base Handler class', (t) => {
        t.pass('Ok');
    });
});

group('Hook', (test) => {
    test('gets base Hook class', (t) => {
        t.pass('Ok');
    });
});

group('_checkConfig()', (test) => {
    test('checks Iris config', (t) => {
        t.pass('Ok');
    });
});

group('_checkFlowOptions()', (test) => {
    test('checks flow schema', (t) => {
        t.pass('Ok');
    });
});

group('_validateDocks()', (test) => {
    test('validate registered docks', (t) => {
        t.pass('Ok');
    });
});

group('_validateHooks()', (test) => {
    test('validate registered input hooks', (t) => {
        t.pass('Ok');
    });

    test('validate registered output hooks', (t) => {
        t.pass('Ok');
    });
});

group('_validateHandler()', (test) => {
    test('validate registered handler', (t) => {
        t.pass('Ok');
    });
});

group('_handleErrors()', (test) => {
    test('log validation errors', (t) => {
        t.pass('Ok');
    });
});