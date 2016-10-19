'use strict';

const Sparkles = require('sparkles');
const Flow = require('../../lib/Flow');
const dispatcher = require('../../lib/Dispatcher');
const test = require('tape');
const group = require('tape-plus').group;
const httpDock = require('../../example/docks/http');
const handler = require('../../example/handlers/handler1');
const hook1 = require('../../example/hooks/hook1');
const hook2 = require('../../example/hooks/hook2');

const flows = [
    new Flow('Flow 1', {
        tag: 'tag1',
        docks: [httpDock],
        handler: handler,
        inputHooks: [hook1],
        outputHooks: [hook2]
    }),
    new Flow('Flow 2', {
        tag: 'tag2',
        docks: [httpDock],
        handler: handler,
        inputHooks: [hook1],
        outputHooks: [hook2]
    })
];
const tags = {
  'tag1': flows[0],
  'tag2': flows[1]
};

group('dispatcher.tags', (test) => {
    test('gets tags', (t) => {
        dispatcher._tags = tags;
        t.deepEqual(dispatcher.tags, tags);
    });
});

group('dispatcher.config', (test) => {
    test('sets dispatcher config', (t) => {
        t.pass('Ok');
    });
});

group('dispatcher.threadPool', (test) => {
    test('sets dispatcher threadpool instance', (t) => {
        const threadPool = {
            test: 'Test'
        };

        dispatcher.threadPool = threadPool;

        t.equal(dispatcher._threadPool, threadPool);
    });
});

group('dispatcher.dispatch()', (test) => {
    const threadPool = {
        test: 'Test',
        send: (data) => {}
    };
    const data = {
        tag: 'tag1',
        data: {},
        meta: {}
    };

    test('sends data to threadpool', (t) => {
        var valid = false;

        dispatcher.threadPool = threadPool;
        dispatcher._threadPool.send = (data) => valid = true;
        dispatcher._tags = tags;
        dispatcher.dispatch(data);

        if (valid)
            t.pass('Ok');
        else
            t.fail('Data was never sent to the threadpool');
        }
    );

    test('adds flow name to metadata', (t) => {
        dispatcher.threadPool = threadPool;
        dispatcher._tags = tags;
        dispatcher.dispatch(data);
        t.equal(data.meta.flow, 'Flow 1');
    });

    test('receives response from threadpool', (t) => {
        t.pass('Ok');
    });

    test('runs dock callback', (t) => {
        t.pass('Ok');
    });
});

group('dispatcher.respond()', (test) => {
    test('sends response to original dock', (t) => {
        t.pass('Ok');
    });
});

group('dispatcher._processFlows()', (test) => {
    test('pushes content to tags array', (t) => {
        t.pass('Ok');
    });
});

group('dispatcher._generateJob()', (test) => {
    test('generates a valid javascript file', (t) => {
        t.pass('Ok');
    });
});

group('dispatcher._loadJob()', (test) => {
    test('loads compiled flows into threadpool', (t) => {
        t.pass('Ok');
    });

    test('starts docks', (t) => {
        t.pass('Ok');
    });
});

group('dispatcher._startDock()', (test) => {
    test('stops docks', (t) => {
        t.pass('Ok');
    });

    test('starts docks', (t) => {
        t.pass('Ok');
    });
});
