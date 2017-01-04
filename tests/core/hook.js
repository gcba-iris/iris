'use strict';

const Hook = require('../../lib/bases/Hook');
const test = require('tape-plus');
const group = require('tape-plus').group;

group('hook.name', (test) => {
    const hook = new Hook('test');

    test('gets dock name', (t) => {
        t.equal(hook.name, 'test');
    });
});

group('hook.type', (test) => {
    const hook = new Hook('test');

    test('gets dock type', (t) => {
        t.equal(hook.type, 'hook');
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
        let valid = false;

        hook.process = () => {
            valid = true;
        };
        hook._emitEvent = (event, data) => { };

        hook.run('test');
        t.equal(valid, true);
    });
});

group('hook.on', (test) => {
    const hook = new Hook('test');

    test('registers an event handler', (t, next) => {
        const config = {
            events: true
        };
        let failed = true;

        hook.config = config;

        hook.on('test', () => {
            failed = false;
        });
        hook._emitEvent('test', {});

        setTimeout(() => {
            if (failed) t.fail('Event was not handled');
            else t.pass('Ok');

            next();
        }, 5);
    });
});

group('hook._emitEvent', (test) => {
    const hook = new Hook('test');
    let failed = true;

    test('emits events', (t, next) => {
        const config = {
            events: true
        };

        hook.config = config;

        hook.on('test', () => {
            failed = false;
        });
        hook._emitEvent('test', {});

        setTimeout(() => {
            if (failed) t.fail('Event was not emitted');
            else t.pass('Ok');

            next();
        }, 5);
    });
});