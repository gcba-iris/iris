const Hook = require('../../lib/bases/Hook');
const Sparkles = require('sparkles');
const test = require('tape');
const group = require('tape-plus').group;

group('name', (test) => {
    const hook = new Hook('test');

    test('gets dock name', (t) => {
        t.equal(hook.name, 'test');
    });
});

group('config', (test) => {
    const hook = new Hook('test');

    const config = {
        test: 'Test'
    };

    test('sets dock config', (t) => {
        hook.config = config;
        t.deepEqual(hook.config, config);
    });

    test('gets dock config', (t) => {
        t.deepEqual(hook.config, config);
    });
});

group('validated', (test) => {
    const hook = new Hook('test');

    test('sets dock validation state', (t) => {
        hook.validated = true;
        t.equal(hook.validated, true);
    });

    test('gets dock validation state', (t) => {
        t.equal(hook.validated, true);
    });
});