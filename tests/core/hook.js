'use strict';

const Hook = require('../../lib/bases/Hook');
const Sparkles = require('sparkles');
const test = require('tape');
const group = require('tape-plus').group;

group('hook.name', (test) => {
    const hook = new Hook('test');

    test('gets dock name', (t) => {
        t.equal(hook.name, 'test');
    });
});

group('hook.config', (test) => {
    const hook = new Hook('test');

    const config = {
        test: 'Test'
    };

    test('sets dock config', (t) => {
        hook.config = config;
        t.deepEqual(hook._config, config);
    });

    test('gets dock config', (t) => {
        t.deepEqual(hook.config, config);
    });
});

group('hook.validated', (test) => {
    const hook = new Hook('test');

    test('sets dock validation state', (t) => {
        hook.validated = true;
        t.equal(hook.validated, true);
    });

    test('gets dock validation state', (t) => {
        t.equal(hook.validated, true);
    });
});

group('hook.run()', (test) => {
    const hook = new Hook('test');

    test('runs hook', (t) => {
        var valid = false;

        hook.process = () => {
            valid = true;
        };
        hook._emitEvent = (event, data) => {};
        hook.run('test');
        t.equal(valid, true);
    });
});

group('hook._emitEvent', (test) => {
    const hook = new Hook('test');

    test('emits events', (t) => {
        const config = {
            events: true
        };

        hook._events = {};
        hook._events.emit = function (event, callback) {
            t.pass('Ok');
        }.bind(this);
        hook._emitEvent('test', {});
    });
});