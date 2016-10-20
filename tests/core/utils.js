'use strict';

const log = require('../../lib/utils/utils');
const test = require('tape');
const group = require('tape-plus').group;
const util = require('util');

group('utils.log.error()', (test) => {
    test('logs errors', (t) => {
        t.equal(util.isFunction(log.log.error), true);
    });
});

group('utils.log.warn()', (test) => {
    test('logs warnings', (t) => {
        t.equal(util.isFunction(log.log.warn), true);
    });
});