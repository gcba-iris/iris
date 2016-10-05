#!/usr/bin/env node

/*
 * Iris
 * (c) 2016+ Buenos Aires City Government
 * License: https://opensource.org/licenses/MIT
 *
 */

'use strict';

const Liftoff = require('liftoff');
const iris = require('../lib/Iris');

const loader = new Liftoff({
    name: 'iris',
    extensions: {
        '.js': null
    },
    v8flags: ['--harmony']
});

loader.launch({}, iris.init);

// TODO: Handle termination (destroy threadpool, cleanup, etc)