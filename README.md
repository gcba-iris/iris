<center>
<p>
![Iris](https://github.com/gcba-iris/iris/raw/master/assets/img/logo.png)
</p>
</center>
<center>
<p>
[![Build Status](https://travis-ci.org/gcba-iris/iris.svg?branch=master)](https://travis-ci.org/gcba-iris/iris)
[![Codacy Status](https://api.codacy.com/project/badge/Grade/8f1241b15304485bbaefa6cf5d390214)](https://www.codacy.com/app/zeta/iris?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gcba-iris/iris&amp;utm_campaign=Badge_Grade)
[![Coverage Status](https://codecov.io/gh/gcba-iris/iris/branch/master/graph/badge.svg)](https://codecov.io/gh/gcba-iris/iris)
</p>
</center>

---

Iris is a tiny Node.js framework for building fast, modular, extensible IoT backends. Assemble data processing flows in a Gulp-like fashion using third-party plugins, or write your own. Start the app. That's it.

Iris tries to strike a balance between convention vs configuration. It comes with sane defaults and a plugin system that makes it easy to get started, while still allowing for ample flexibility.

```bash
$ npm install gcba-iris/iris -g
```

## Flow

![Architecture](https://github.com/gcba-iris/iris/raw/master/assets/img/architecture.png)

Iris is built around the **flow**, which is the path a request follows from the moment it arrives to the moment it gets handled/processed. If a response is generated, the flow includes its way back to the original device.

```
--> Dock --> Dispatcher --> Hooks --> Handler
Handler --> Dispatcher --> Hooks --> Dock -->

```

## Getting started

### 1. Create an empty project

```bash
$ iris new myApp
```

Creates a new folder called `myApp` with the following contents:

```
myApp/
|___modules/
|   |___docks/
|   |___handlers/
|   |___hooks/
|___irisfile.js
|___package.json
```
Then runs `npm install`.


#### Existing project

```bash
$ iris init
```

Creates an empty Irisfile and runs `npm install gcba-iris/iris --save`.

### 2. Add flows

The data flows are defined in the Irisfile, using `iris.flow()`.

#### Method signature

```javascript
iris.flow([name], [config]);
```
- **name**: A string identifier.
- **config**: An object containing:
  - **tag**: The flow tag is the first part of the request body, up until a known separator. It allows Iris to know how to route the request to the right handler. Therefore, a tag must belong to a single flow.
  - **docks**: An array of dock instances.
  - **handler**: The handler instance.
  - **inputHooks** *(optional)*:  An array of hook instances.
  - **outputHooks** *(optional)*: An array of hook instances.

#### Sample irisfile.js

```javascript
const iris = require('iris');
const dock = require('./docks/http');
const handler = require('./handlers/handler1');
const anotherHandler = require('./handlers/handler2');
const hook1 = require('./hooks/hook1');
const hook2 = require('./hooks/hook2');

iris.config = {
    threads: 4,
    logLevel: 'info',
};

dock.config = {
    port: 5000
};

iris.flow('Flow 1', {
    tag: 'tag1',
    docks: [dock],
    handler: handler,
    inputHooks: [hook1],
    outputHooks: [hook2]
});

iris.flow('Flow 2', {
    tag: 'tag2',
    docks: [dock],
    handler: anotherHandler,
    inputHooks: [hook2]
});
```

#### Sample request body

```
tag1|subtag1|02,56,58,8|subtag2|sds,sd,wtr,ghd
```

### 3. Run flows

Inside a project directory:

```bash
$ iris
```
![Iris screenshot](https://github.com/gcba-iris/iris/raw/master/assets/img/running.png)

## Requirements

- Node.js 6.5.0+


## Learn more

Take a look at the [technical docs](https://gcba-iris.github.io/iris-tech-docs) for an in-depth explanation of the architecture and API reference.

---

```
MIT License

Copyright (c) 2016+ Buenos Aires City Government

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```