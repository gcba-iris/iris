const Dock = require('../../lib/bases/Dock');
const test = require('tape');
const mockery = require('mockery');
const group = require('tape-plus').group;

const dock = new Dock('test', 'test');

const setMockery = (test) => {
    test.beforeEach((t) => {
        mockery.enable();
    });

    test.afterEach((t) => {
        mockery.disable();
    });
};

group('id', (test) => {
    test('sets dock Id', (t) => {

        t.pass('Ok');
    });

    test('gets dock Id', (t) => {

        t.pass('Ok');
    });
});

group('name', (test) => {
    test('gets dock name', (t) => {

        t.pass('Ok');
    });
});

group('protocol', (test) => {
    test('gets dock protocol', (t) => {

        t.pass('Ok');
    });
});

group('port', (test) => {
    test('gets dock port', (t) => {

        t.pass('Ok');
    });
});

group('config', (test) => {
    test('sets dock config', (t) => {

        t.pass('Ok');
    });

    test('gets dock config', (t) => {

        t.pass('Ok');
    });
});

group('dispatcher', (test) => {
    test('sets dispatcher instance', (t) => {

        t.pass('Ok');
    });
});

group('validate()', (test) => {
    setMockery(test);

    test('validates messages', (t) => {

        t.pass('Ok');
    });

    test('checks message length', (t) => {

        t.pass('Ok');
    });

    test('checks message tag', (t) => {

        t.pass('Ok');
    });

    test('checks message format', (t) => {

        t.pass('Ok');
    });
});

group('parse()', (test) => {
    setMockery(test);

    test('parses messages', (t) => {

        t.pass('Ok');
    });
});

group('process()', (test) => {
    setMockery(test);

    test('sends messages to dispatcher', (t) => {

        t.pass('Ok');
    });

    test('sets dock Id', (t) => {
        //t.equal(add(base, -1), 9)
        t.pass('Ok');
    });

    test('sets timestamp', (t) => {

        t.pass('Ok');
    });

    test('emits \'message\' event', (t) => {

        t.pass('Ok');
    });
});

group('reply()', (test) => {
    setMockery(test);

    test('emits \'response\' event', (t) => {

        t.pass('Ok');
    });
});

group('encode()', (test) => {
    setMockery(test);

    test('encodes messages', (t) => {

        t.pass('Ok');
    });
});

group('_emitEvent()', (test) => {
    setMockery(test);

    test('emits events', (t) => {

        t.pass('Ok');
    });
});

group('_invalidMessage()', (test) => {
    setMockery(test);

    test('emits emits \'invalidMessage\' event', (t) => {

        t.pass('Ok');
    });
});

group('_checkConfig()', (test) => {
    setMockery(test);

    test('checks config', (t) => {

        t.pass('Ok');
    });
});