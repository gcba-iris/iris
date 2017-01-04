'use strict';

const Dock = require('../../lib/bases/Dock');
const Sparkles = require('sparkles');
const test = require('tape-plus');
const group = require('tape-plus').group;

const config = {
    port: 8080,
    parser: {
        subtagSeparator: '|',
        dataSeparator: ','
    },
    encoder: {
        subtagSeparator: '|',
        dataSeparator: ','
    },
    maxMessageLength: 100,
    events: true
};
const dispatcher = {
    tags: {
        'tag1': {}
    },
    dispatch: (data, callback) => {}
};

group('dock.id', (test) => {
    const dock = new Dock('test', 'test');

    test('sets dock Id', (t) => {
        dock.id = 'test';
        t.equal(dock.id, 'test');
    });

    test('gets dock Id', (t) => {
        dock.id = 'example';
        t.equal(dock.id, 'example');
    });
});

group('dock.name', (test) => {
    const dock = new Dock('test', 'test');

    test('gets dock name', (t) => {
        t.equal(dock.name, 'test');
    });
});

group('dock.type', (test) => {
    const dock = new Dock('test', 'test');

    test('gets dock type', (t) => {
        t.equal(dock.type, 'dock');
    });
});

group('dock.protocol', (test) => {
    const dock = new Dock('test', 'test');

    test('gets dock protocol', (t) => {
        t.equal(dock.protocol, 'test');
    });
});

group('dock.port', (test) => {
    const dock = new Dock('test', 'test');

    test('gets dock port', (t) => {
        dock.config = config;
        t.equal(dock.port, 8080);
    });
});

group('dock.config', (test) => {
    const dock = new Dock('test', 'test');

    test('sets dock config', (t) => {
        dock.config = config;
        t.deepEqual(dock._config, config);
    });

    test('gets dock config', (t) => {
        t.deepEqual(dock.config, config);
    });
});

group('dock.dispatcher', (test) => {
    const dock = new Dock('test', 'test');

    test('sets dispatcher instance', (t) => {
        dock.dispatcher = dispatcher;
        t.deepEqual(dock._dispatcher, dispatcher);
    });
});

group('dock.validate()', (test) => {
    const dock = new Dock('test', 'test');

    dock.dispatcher = dispatcher;
    dock.config = config;

    test('validates messages', (t) => {
        const result = dock.validate('tag1|subtag1|02,56,58,8|subtag2|sds,sd,wtr,ghd');
        const expectedResult = {
            tag: 'tag1',
            message: ['subtag1', '02,56,58,8', 'subtag2', 'sds,sd,wtr,ghd']
        };

        t.deepEqual(result, expectedResult);
    });

    test('checks message length', (t) => {
        const result = dock.validate(
            'tag1|subtag1|02,56,58,8,69,45,78,65,125,69,898,98|subtag2|sds,sd,wtr,ghd,sd,rt,frt,uty,adf,wfg,dgs,sd'
        );

        t.equal(result, false);
    });

    test('checks message tag', (t) => {
        const result = dock.validate('tag2|subtag1|02,56,58,8|subtag2|sds,sd,wtr,ghd');

        t.equal(result, false);
    });

    test('checks message format', (t) => {
        const result = dock.validate('tag1|subtag1|02;56;58;8|subtag2|sds;sd;wtr;ghd');

        t.equal(result, false);
    });
});

group('dock.parse()', (test) => {
    const dock = new Dock('test', 'test');

    dock.dispatcher = dispatcher;
    dock.config = config;

    test('parses messages', (t) => {
        const data = {
            tag: 'tag1',
            message: ['subtag1', '02,56,58,8', 'subtag2', 'sds,sd,wtr,ghd']
        };
        const meta = {
            test: 'test'
        };
        const result = dock.parse(data, meta);
        const expectedResult = {
            tag: 'tag1',
            meta: meta,
            data: {
                'subtag1': [
                    '02', '56', '58', '8'
                ],
                'subtag2': ['sds', 'sd', 'wtr', 'ghd']
            }
        };

        t.deepEqual(result, expectedResult);
    });

    test('checks message body', (t) => {
        const data = {
            tag: 'tag1',
            message: '|subtag1|02,56,58,8|subtag2|sds,sd,wtr,ghd'
        };
        const meta = {};
        const result = dock.parse(data, meta);

        t.equal(result, false);
    });
});

group('dock.process()', (test) => {
    const dock = new Dock('test', 'test');
    const events = Sparkles('test');

    const message = 'tag1|subtag1|02,56,58,8|subtag2|sds,sd,wtr,ghd';
    const meta = {};
    const callback = () => {};

    dock.id = 'test';
    dock.config = config;

    test('sends messages to dispatcher', (t) => {
        let failed = true;
        const eventCallback = (data) => {
            failed = false;

            t.pass('Ok');
        };

        events.on('dispatcherExecuted', eventCallback.bind(this));
        dock.dispatcher = dispatcher;
        dock._dispatcher.dispatch = (data, callback) => {
            events.emit('dispatcherExecuted', {});
        };
        dock.process(message, meta, callback);

        setTimeout(() => {
            if (failed) {
                t.fail('dispatcher.dispatch() was never called');
            }
        }, 5);
    });

    test('sets dock Id', (t) => {
        const eventCallback = (data) => {
            failed = false;

            t.pass('Ok');
        };
        let failed = true;

        events.on('setDockId', eventCallback.bind(this));
        dock.dispatcher = dispatcher;
        dock._dispatcher.dispatch = (data, callback) => {
            if (data.meta.dock) events.emit('setDockId', {});
        };
        dock.process(message, meta, callback);

        setTimeout(() => {
            if (failed) {
                t.fail('Dock id was never set');
            }
        }, 5);
    });

    test('sets message timestamp', (t) => {
        const eventCallback = (data) => {
            failed = false;

            t.pass('Ok');
        };
        let failed = true;

        events.on('setTimestamp', eventCallback.bind(this));
        dock.dispatcher = dispatcher;
        dock._dispatcher.dispatch = (data, callback) => {
            if (data.meta.timestamp) events.emit('setTimestamp', {});
        };
        dock.process(message, meta, callback);

        setTimeout(() => {
            if (failed) {
                t.fail('Timestamp was never set');
            }
        }, 5);
    });

    test('uses message.toString()', (t) => {
        const customMessage = {
            toString: () => 'tag1|subtag1|02,56,58,8|subtag2|sds,sd,wtr,ghd'
        };
        const eventCallback = (data) => {
            failed = false;

            t.pass('Ok');
        };
        let failed = true;

        events.on('dispatcherExecuted', eventCallback.bind(this));
        dock.dispatcher = dispatcher;
        dock._dispatcher.dispatch = (data, callback) => {
            events.emit('dispatcherExecuted', {});
        };
        dock.process(customMessage, meta, callback);

        setTimeout(() => {
            if (failed) {
                t.fail('dispatcher.dispatch() was never called');
            }
        }, 5);
    });

    test('fails with unrecognized message types', (t) => {
        const customMessage = {
            message: {}
        };
        const returnValue = dock.process(customMessage, meta, callback);

        if (returnValue === false) t.pass('failed to recognize Date type');
        else t.fail('returned something else than false');
    });

    test('fails when there is no dispatcher reference', (t) => {
        let valid = false;

        dock._dispatcher = undefined;
        dock.logger.error = () => {
            valid = true;
        };

        dock.process(message, meta, callback);

        if (valid) t.pass('Ok');
        else t.fail('does not fail when there is no dispatcher reference');
    });

    test('fails when the parser returns no data', (t) => {
        const eventCallback = (data) => {
            passed = false;

            t.fail('dispatcher.dispatch() should not have been called');
        };
        let passed = true;

        dock.parse = () => {};

        events.on('dispatcherExecuted', eventCallback.bind(this));
        dock.dispatcher = dispatcher;
        dock._dispatcher.dispatch = (data, callback) => {
            events.emit('dispatcherExecuted', {});
        };
        dock.process(message, meta, callback);

        setTimeout(() => {
            if (passed) {
                t.pass('Ok');
            }
        }, 5);
    });
});

group('dock.encode()', (test) => {
    const dock = new Dock('test', 'test');

    dock.id = 'test';
    dock.config = config;
    dock.dispatcher = dispatcher;

    test('encodes array messages', (t) => {
        const result = dock.encode({
            message: ['abc', 'def', 'ghi']
        });

        t.equal(result, 'abc,def,ghi');
    });

    test('encodes object messages', (t) => {
        const result = dock.encode({
            message: {
                subtag1: [
                    'abc', 'def', 'ghi'
                ],
                subtag2: ['jkl', 'mno', 'pqr'],
                subtag3: {
                    toString: () => {
                        return 'stu,vwx';
                    }
                }
            }
        });

        t.equal(result, '|subtag1|abc,def,ghi|subtag2|jkl,mno,pqr|subtag3|stu,vwx');
    });

    test('encodes object messages with string values', (t) => {
        const result = dock.encode({
            message: {
                subtag1: 'abc',
                subtag2: 'jkl'
            }
        });

        t.equal(result, '|subtag1|abc|subtag2|jkl');
    });

    test('encodes messages with toString() method', (t) => {
        const message = {
            toString: () => 'Test'
        };

        const result = dock.encode({message: message});

        t.equal(result, 'Test');
    });

    test('returns string messages', (t) => {
        const result = dock.encode({message: 'Test'});

        t.equal(result, 'Test');
    });

    test('handles unknown message types', (t) => {
        const result = dock.encode({
            message: () => 'Test'
        });

        t.equal(result, false);
    });
});

group('dock.reply()', (test) => {
    test('sends a reply', (t, next) => {
        const dock = new Dock('test', 'test');
        let valid = false;

        dock.config = config;
        dock.send = () => {
            valid = true;
        };

        dock.reply({
            meta: {
                dock: dock._id
            },
            message: 'test'
        });

        setTimeout(() => {
            if (valid) t.pass('Ok');
            else t.fail('dock.send() was not called');

            next();
        }, 5);
    });

    test('fails because there is no message to send', (t, next) => {
        const dock = new Dock('test', 'test');
        let valid = false;

        dock.config = config;
        dock.send = () => {};
        dock.logger.error = () => {
            valid = true;
        };

        dock.reply({
            meta: {
                dock: dock._id
            },
            message: {}
        });

        setTimeout(() => {
            if (valid) t.pass('Ok');
            else t.fail('the message was sent anyway');

            next();
        }, 5);
    });

    test('fails with invalid dock reference', (t, next) => {
        const dock = new Dock('test', 'test');
        let valid = false;

        dock.config = config;
        dock.logger.error = () => {
            valid = true;
        };

        dock.reply({
            meta: {
                dock: 'test'
            },
            message: {}
        });

        setTimeout(() => {
            if (valid) t.pass('Ok');
            else t.fail('did not fail with an invalid dock reference');

            next();
        }, 5);
    });
});

group('dock.on()', (test) => {
    test('registers an event handler', (t, next) => {
        const dock = new Dock('test', 'test');
        let failed = true;

        dock.config = config;

        dock.on('test', () => {
            failed = false;
        });
        dock._emitEvent('test', {});

        setTimeout(() => {
            if (failed) t.fail('Event was not handled');
            else t.pass('Ok');

            next();
        }, 5);
    });
});

group('dock._checkConfig()', (test) => {
    const dock = new Dock('test', 'test');

    dock.id = 'test';
    dock.dispatcher = dispatcher;

    test('checks config', (t, next) => {
        let fails = false;

        dock.config = config;
        dock.logger.error = () => {
            fails = true;
        };

        dock._checkConfig(config);

        setTimeout(() => {
            if (fails) t.fail('Config threw validation errors');
            else t.pass('Ok');

            next();
        }, 5);
    });

    test('catches validation errors', (t, next) => {
        const invalidConfig = {
            parser: {
                subtagSeparator: '|',
                dataSeparator: ','
            },
            encoder: {
                subtagSeparator: '|',
                dataSeparator: ','
            },
            maxMessageLength: 100,
            events: true
        };
        let valid = false;

        dock.logger.error = () => {
            valid = true;
        };

        dock._checkConfig(invalidConfig);

        setTimeout(() => {
            if (valid) t.pass('Ok');
            else t.fail('Config did not throw validation errors');

            next();
        }, 5);
    });
});

group('dock._emitEvent', (test) => {
    const dock = new Dock('test', 'test');
    let failed = true;

    test('emits events', (t, next) => {
        dock.config = config;

        dock.on('test', () => {
            failed = false;
        });
        dock._emitEvent('test', {});

        setTimeout(() => {
            if (failed) t.fail('Event was not emitted');
            else t.pass('Ok');

            next();
        }, 5);
    });
});