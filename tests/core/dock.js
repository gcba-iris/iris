'use strict';

const Dock = require('../../lib/bases/Dock');
const Sparkles = require('sparkles');
const test = require('tape');
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
    maxMessageLength: 100
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
        const result = dock.validate('tag1|subtag1|02,56,58,8,69,45,78,65,125,69,898,98|subtag2|sds,sd,wtr,ghd,sd,rt,f' +
                'rt,uty,adf,wfg,dgs,sd');

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

    test('sends messages to dispatcher', (t, next) => {
        var failed = true;
        const eventCallback = (data) => {
            failed = false;

            t.pass('Ok');
            next();
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
                next();
            }
        }, 5);
    });

    test('sets dock Id', (t, next) => {
        var failed = true;
        const eventCallback = (data) => {
            failed = false;

            t.pass('Ok');
            next();
        };

        events.on('setDockId', eventCallback.bind(this));
        dock.dispatcher = dispatcher;
        dock._dispatcher.dispatch = (data, callback) => {
            if (data.meta.dock) 
                events.emit('setDockId', {});
            };
        dock.process(message, meta, callback);

        setTimeout(() => {
            if (failed) {
                t.fail('Dock id was never set');
                next();
            }
        }, 5);
    });

    test('sets message timestamp', (t, next) => {
        var failed = true;
        const eventCallback = (data) => {
            failed = false;

            t.pass('Ok');
            next();
        };

        events.on('setTimestamp', eventCallback.bind(this));
        dock.dispatcher = dispatcher;
        dock._dispatcher.dispatch = (data, callback) => {
            if (data.meta.timestamp) 
                events.emit('setTimestamp', {});
            };
        dock.process(message, meta, callback);

        setTimeout(() => {
            if (failed) {
                t.fail('Timestamp was never set');
                next();
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
                subtag2: ['jkl', 'mno', 'pqr']
            }
        });

        t.equal(result, '|subtag1|abc,def,ghi|subtag2|jkl,mno,pqr');
    });

    test('encodes messages with toString() method', (t) => {
        const message = {};
        message.prototype = {
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
        const result = dock.encode({message: new Date()});

        t.equal(result, '');
    });
});

group('dock._checkConfig()', (test) => {
    const dock = new Dock('test', 'test');

    var failed = false;

    dock.id = 'test';
    dock.config = config;
    dock.dispatcher = dispatcher;
    dock.logger.error = () => {
        failed = true;
    };

    test('checks config', (t) => {
        dock._checkConfig(config);

        if (failed) 
            t.fail('Config threw validation errors');
        else 
            t.pass('Ok');
        }
    );
});