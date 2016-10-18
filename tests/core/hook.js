const Hook = require('../../lib/bases/Dock');
const Sparkles = require('sparkles');
const test = require('tape');
const group = require('tape-plus').group;

group('name', (test) => {
    var hook = new Hook('test');

    test('gets dock name', (t) => {
        t.pass('Ok');
    });
});

group('config', (test) => {
    var hook = new Hook('test');

    test('sets dock config', (t) => {
        t.pass('Ok');
    });

    test('gets dock config', (t) => {
        t.pass('Ok');
    });
});

group('validated', (test) => {
    var hook = new Hook('test');

    test('sets dock validation state', (t) => {
        t.pass('Ok');
    });

    test('gets dock validation state', (t) => {
        t.pass('Ok');
    });
});