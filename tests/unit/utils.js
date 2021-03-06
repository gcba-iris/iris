'use strict';

const log = require('../../lib/utils/utils');
const test = require('tape-plus');
const group = require('tape-plus').group;
const util = require('util');

group('utils.log.info()', (test) => {
    test('logs info messages', (t) => {
        log.log.info('Test');
        t.equal(util.isFunction(log.log.info), true);
    });
});

group('utils.log.error()', (test) => {
    test('logs errors', (t) => {
        log.log.error('Test');
        t.equal(util.isFunction(log.log.error), true);
    });
});

group('utils.log.warn()', (test) => {
    test('logs warnings', (t) => {
        log.log.warn('Test');
        t.equal(util.isFunction(log.log.warn), true);
    });
});