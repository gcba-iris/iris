'use strict';

const Handler = require('../../lib/bases/Handler');
const Sparkles = require('sparkles');
const test = require('tape');
const group = require('tape-plus').group;

const dispatcher = {
    test: 'Test'
};

group('handler.name', (test) => {
    const handler = new Handler('test');

    test('gets hook name', (t) => {
        t.equal(handler.name, 'test');
    });
});

group('handler.config', (test) => {
    const handler = new Handler('test');

    const config = {
        test: 'Test'
    };

    test('sets hook config', (t) => {
        handler.config = config;
        t.deepEqual(handler._config, config);
    });

    test('gets hook config', (t) => {
        t.deepEqual(handler.config, config);
    });
});

group('handler.dispatcher', (test) => {
    const handler = new Handler('test');

    test('sets hook dispatcher instance', (t) => {
        handler.dispatcher = dispatcher;
        t.deepEqual(handler._dispatcher, dispatcher);
    });
});

group('handler.validated', (test) => {
    const handler = new Handler('test');

    test('sets hook validation state', (t) => {
        handler.validated = true;
        t.equal(handler.validated, true);
    });

    test('gets hook validation state', (t) => {
        t.equal(handler.validated, true);
    });
});

group('handler.send()', (test) => {
    const handler = new Handler('test');

    const response = 'Test';
    var valid = false;

    dispatcher.respond = () => {
        valid = true;
    };
    handler.dispatcher = dispatcher;

    test('sends response to dispatcher', (t) => {
        handler.send(response);

        if (valid) t.pass('Ok');
        else t.fail('Response is not being set to dispatcher');
    });
});