'use strict';

const Handler = require('../../lib/bases/Handler');
const test = require('tape-plus');
const group = require('tape-plus').group;

const dispatcher = {
    test: 'Test'
};

group('handler.name', (test) => {
    const handler = new Handler('test');

    test('gets handler name', (t) => {
        t.equal(handler.name, 'test');
    });
});

group('handler.type', (test) => {
    const handler = new Handler('test');

    test('gets dock type', (t) => {
        t.equal(handler.type, 'handler');
    });
});

group('handler.config', (test) => {
    const handler = new Handler('test');

    const config = {
        test: 'Test'
    };

    test('sets handler config', (t) => {
        handler.config = config;
        t.deepEqual(handler._config, config);
    });

    test('gets handler config', (t) => {
        t.deepEqual(handler.config, config);
    });
});

group('handler.dispatcher', (test) => {
    const handler = new Handler('test');

    test('sets handler dispatcher instance', (t) => {
        handler.dispatcher = dispatcher;
        t.deepEqual(handler._dispatcher, dispatcher);
    });
});

group('handler.validated', (test) => {
    const handler = new Handler('test');

    test('sets handler validation state', (t) => {
        handler.validated = true;
        t.equal(handler.validated, true);
    });

    test('gets handler validation state', (t) => {
        t.equal(handler.validated, true);
    });
});

group('handler.handle()', (test) => {
    const handler = new Handler('test');

    test('handles data', (t) => {
        const response = 'test';
        let valid = false;

        handler.process = () => {
            valid = true;
        };
        handler._emitEvent = (event, data) => {};
        handler.handle(response);
        t.equal(valid, true);
    });
});

group('handler.send()', (test) => {
    const handler = new Handler('test');

    test('sends response to dispatcher', (t) => {
        const response = 'test';
        let valid = false;

        dispatcher.respond = () => {
            valid = true;
        };
        handler.dispatcher = dispatcher;
        handler.send(response);
        t.equal(valid, true);
    });
});

group('handler.on', (test) => {
    const handler = new Handler('test');

    test('registers an event handler', (t, next) => {
        const config = {
            events: true
        };
        let failed = true;

        handler.config = config;

        handler.on('test', () => {
            failed = false;
        });
        handler._emitEvent('test', {});

        setTimeout(() => {
            if (failed) t.fail('Event was not handled');
            else t.pass('Ok');

            next();
        }, 5);
    });
});

group('handler._emitEvent', (test) => {
    const handler = new Handler('test');
    let failed = true;

    test('emits events', (t, next) => {
        const config = {
            events: true
        };

        handler.config = config;

        handler.on('test', () => {
            failed = false;
        });
        handler._emitEvent('test', {});

        setTimeout(() => {
            if (failed) t.fail('Event was not emitted');
            else t.pass('Ok');

            next();
        }, 5);
    });
});