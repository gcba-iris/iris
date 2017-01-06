'use strict';

const Flow = require('../../lib/Flow');
const dispatcher = require('../../lib/Dispatcher');
const fs = require('graceful-fs');
const test = require('tape-plus');
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
    flows: flows,
    events: true
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
        run: (data) => {
            return dispatcher._events;
        }
    };

    test('sets dispatcher config', (t) => {
        config.flows[0].docks[0].listen = () => {};
        config.flows[1].docks[0].listen = () => {};

        dispatcher.threadPool = threadPool;
        dispatcher.config = config;

        t.deepEqual(dispatcher._config, config);
    });

    test('sets threadpool error handler', (t, next) => {
        let failed = false;

        dispatcher.threadPool = threadPool;
        dispatcher._logger.error = () => {
            failed = true;
        };
        dispatcher.config = config;

        dispatcher._events.emit('error', { message: 'Test' });

        setTimeout(() => {
            t.equal(failed, true);

            next();
        }, 5);
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
        let valid = false;

        dispatcher.threadPool = threadPool;
        dispatcher._threadPool.send = (data) => {
            valid = true;

            return dispatcher._events;
        };
        dispatcher._tags = tags;
        dispatcher.dispatch(data);

        t.equal(valid, true);
    });

    test('receives response from the threadpool', (t, next) => {
        let valid = false;
        const callback = () => {
            valid = true;
        };

        dispatcher.threadPool = threadPool;
        dispatcher._threadPool.send = (data) => {
            valid = true;

            return dispatcher._events;
        };
        dispatcher._docks = {
            test: {
                reply: () => { }
            }
        };
        dispatcher._tags = tags;

        dispatcher.dispatch(data, callback);
        dispatcher._events.emit('done', {
            meta: {
                dock: 'test'
            }
        });

        setTimeout(() => {
            t.equal(valid, true);

            next();
        }, 5);
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
        const response = {
            message: 'Test',
            meta: {
                dock: 'test'
            },
            tag: 'tag1'
        };
        let valid = false;

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

        t.deepEqual(dispatcher.tags, tags);
    });
});

group('dispatcher._generateJob()', (test) => {
    test('generates javascript file', (t) => {
        const fileName = '.iris';

        dispatcher._generateJob(dispatcher.tags, fileName);

        t.equal(Number.isInteger(fs.openSync(fileName, 'r')), true);
    });

    test('fails on file write error', (t, next) => {
        const fileName = '\0'; // Invalid file name, write will fail
        let failed = false;

        dispatcher._logger.error = () => {
            failed = true;
        };

        dispatcher._generateJob(dispatcher.tags, fileName);

        setTimeout(() => {
            t.equal(failed, true);

            next();
        }, 5);
    });
});

group('dispatcher._startDock()', (test) => {
    const dock = {
        config: {
            port: 5000
        }
    };

    test('starts docks', (t) => {
        let valid = false;

        dock.stop = () => {};
        dock.listen = () => valid = true;

        dispatcher._startDock(dock);

        t.equal(valid, true);
    });
});

group('handler._emitEvent', (test) => {
    test('emits events', (t, next) => {
        let failed = true;

        dispatcher._events.on('test', () => {
            failed = false;
        });
        dispatcher._emitEvent('test', {});

        setTimeout(() => {
            t.equal(failed, false);

            next();
        }, 5);
    });
});

group('dispatcher._registerEventHandlers()', (test) => {
    test('reloads dock', (t, next) => {
        let failed = true;

        dispatcher._startDock = () => {
            failed = false;
        };

        dispatcher._emitEvent('reload', {
            module: {
                type: 'dock',
                listen: () => {},
                config: { port: 3000 }
            }
        });

        setTimeout(() => {
            t.equal(failed, false);

            next();
        }, 5);
    });

    test('reloads all flows', (t, next) => {
        let valid = false;

        dispatcher._threadPool = dispatcher._events;
        dispatcher._loadJob = () => {
            valid = true;
        };

        dispatcher._emitEvent('reload', {
            module: {
                type: 'hook'
            }
        });

        setTimeout(() => {
            t.equal(valid, true);

            next();
        }, 5);
    });

    test('replaces old threadpool with new one', (t, next) => {
        const throws = () => {
            dispatcher._events.emit('finished', {});
        };

        dispatcher._threadPool.killAll = () => {};

        t.throws(throws, 'TypeError: Cannot read property \'killAll\' of undefined');

        next();
    });
});