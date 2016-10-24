'use strict';

const Flow = require('../../lib/Flow');
const dispatcher = require('../../lib/Dispatcher');
const fs = require('graceful-fs');
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
    'tag1': {
        flow: flows[0]
    },
    'tag2': {
        flow: flows[1]
    }
};
const config = {
    flows: flows
};

httpDock.config = {
    port: 5000
};

group('dispatcher.tags', (test) => {
    test('gets tags', (t) => {
        dispatcher._tags = tags;
        t.deepEqual(dispatcher.tags, tags);
    });
});

group('dispatcher.config', (test) => {
    const threadPool = {
        test: 'Test',
        run: (data) => {
            return {
                on: (event) => {}
            };
        }
    };

    test('sets dispatcher config', (t) => {
        config.flows[0].docks[0].listen = () => {};
        config.flows[1].docks[0].listen = () => {};

        dispatcher.threadPool = threadPool;
        dispatcher.config = config;
        t.deepEqual(dispatcher._config, config);
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
        send: (data) => {
            return {
                on: () => {}
            };
        }
    };
    const data = {
        tag: 'tag1',
        data: {},
        meta: {}
    };

    test('sends data to threadpool', (t) => {
        var valid = false;

        dispatcher.threadPool = threadPool;
        dispatcher._threadPool.send = (data) => {
            valid = true;

            return {
                on: () => {}
            };
        }
        dispatcher._tags = tags;
        dispatcher.dispatch(data);
        t.equal(valid, true);
    });

    test('adds flow name to metadata', (t) => {
        dispatcher.threadPool = threadPool;
        dispatcher._tags = tags;
        dispatcher.dispatch(data);
        t.equal(data.meta.flow, 'Flow 1');
    });
});

group('dispatcher.respond()', (test) => {
    test('sends response to original dock', (t) => {
        var valid = false;
        const response = {
            message: 'Test',
            meta: {
                dock: 'test'
            },
            tag: 'tag1'
        };

        flows[0].docks[0].reply = (response) => {
            valid = true;
        };
        dispatcher._docks['test'] = flows[0].docks[0];
        dispatcher.respond(response);
        t.equal(valid, true);
    });
});

group('dispatcher._processFlows()', (test) => {
    test('pushes content to tags array', (t) => {
        dispatcher._processFlows(config);
        t.deepEqual(dispatcher.tags, tags)
    });
});

group('dispatcher._generateJob()', (test) => {
    test('generates javascript file', (t) => {
        const fileName = '.iris';

        dispatcher._generateJob(dispatcher.tags, fileName);
        t.equal(Number.isInteger(fs.openSync(fileName, 'r')), true);
    });
});

group('dispatcher._startDock()', (test) => {
    const dock = {
        config: {
            port: 5000
        }
    };

    test('starts docks', (t) => {
        var valid = false;
        dock.stop = () => {};
        dock.listen = () => valid = true;

        dispatcher._startDock(dock);
        t.equal(valid, true);
    });
});

group('dispatcher._registerEventHandlers()', (test) => {
    test('registers event handlers', (t) => {
        dispatcher._events = {};
        dispatcher._events.on = function (event, callback) {
            t.pass('Ok');
        }.bind(this);
        dispatcher._registerEventHandlers('test', {});
    });
});

group('dispatcher._emitEvent()', (test) => {
    test('emits events', (t) => {
        dispatcher._events = {};
        dispatcher._events.emit = (event, callback) => {
            t.pass('Ok');
        };
        dispatcher._emitEvent('test', {});
    });
});