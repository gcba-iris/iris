<p align="center">
    <img src="https://github.com/gcba-iris/iris/raw/master/assets/img/logo.png" alt="Iris" />
</p>

<p align="center">
    <a href="https://travis-ci.org/gcba-iris/iris">
        <img src="https://travis-ci.org/gcba-iris/iris.svg?branch=master" alt="Build Status" />
    </a>
        <a href="https://www.codacy.com/app/zeta/iris?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gcba-iris/iris&amp;utm_campaign=Badge_Grade">
        <img src="https://api.codacy.com/project/badge/Grade/8f1241b15304485bbaefa6cf5d390214" alt="Codacy Status" />
    </a>
    <a href="https://codecov.io/gh/gcba-iris/iris">
        <img src="https://codecov.io/gh/gcba-iris/iris/branch/master/graph/badge.svg" alt="Coverage Status" />
    </a>
</p>

---

### Iris

A tiny Node.js framework for building fast, modular & extensible IoT backends. Assemble data processing flows in a Gulp-like fashion using third-party plugins, or write your own. Run the app. That's it.

Iris tries to strike a balance between convention vs configuration. It comes with sane defaults and a plugin system that makes it easy to get started, while allowing ample flexibility at the same time.

```bash
$ npm install gcba-iris/iris -g
```


## Contents

  * [1 Flow](#flow)
  * [2 Getting started](#getting-started)
    * [2.1 Create an empty project](#1-create-an-empty-project)
      * [2.1.1 Existing project](#existing-project)
    * [2.2 Add flows](#2-add-flows)
      * [2.2.1 Method signature](#method-signature)
      * [2.2.2 Sample irisfile.js](#sample-irisfilejs)
    * [2.3 Run flows](#3-run-flows)
  * [3 Requirements](#requirements)
  * [4 Learn more](#learn-more)


## Flow

![Architecture](https://github.com/gcba-iris/iris/raw/master/assets/img/architecture.png)

Iris is built around the **flow**, which is the path a message follows from the moment it arrives to the moment it gets handled/processed. If a response is generated, the flow will include its way back to the original device.

Data flows are processed in parallel using threads. A message will always remain within a single thread from start to finish, so if a thread goes down only the messages within will be affected.

```
--> Dock --> Dispatcher --> Hooks --> Handler
Handler --> Dispatcher --> Hooks --> Dock -->
```

### Dispatcher

Receives the data object from the **dock**, calls the registered **input hooks** and routes the data object to the right **handler**. Similarly, when there's a response the dispatcher routes it to the right **dock** and executes the registered **output hooks**.

The dispatcher is part of the Iris core and cannot be customized or swapped off - it's the glue that holds everything together.

### Plugins

#### Dock

Listens to a single port for incoming messages through a specific protocol and parses it into a plain javascript object. Then passes this object along to the dispatcher. If a response comes back, the dock serializes it to match the message format and sends it off to the original device.

##### Sample message

```
tag1|subtag1|02,56,58,8|subtag2|sds,sd,wtr,ghd
```

The flow tag is the first part of the message. It allows Iris to know how to route the message to the right handler. Therefore, a tag must be unique and belong to a single flow.
Subtags, on the other hand, are optional.

#### Handler

Processes the data object received from the dispatcher. A handler can generate a response, which goes back to the dispatcher. The response will be serialized and sent by the respective dock. If there's no response the data flow ends there.

#### Hooks

A hook is just a callback function that gets executed whenever a piece of data passes by the dispatcher in the course of a data flow. Multiple hooks can be tied to a single flow. Each hook can be set to run when the message object comes in (input hook) or when the response goes out (output hook).


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
iris.flow(name, config);
```
- **name**: A string identifier.
- **config**: An object containing:
  - **tag**: A unique string.
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
    logLevel: 'warn',
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

The default amount of threads is the number of CPU cores.

### 3. Run flows

Inside a project directory:

```bash
$ iris
```
![Iris screenshot](https://github.com/gcba-iris/iris/raw/master/assets/img/running.png)


## Writing plugins

All plugins must extend their base classes. Take a look at the [technical docs](https://gcba-iris.github.io/iris-tech-docs) for an in-depth explanation of the architecture and API reference.

### Docks

 You must implement `get path()`, `listen()` and `stop()`. `send()` is optional.

##### Sample HTTP dock

```javascript
'use strict';

const Dock = require('iris').Dock;
const http = require('http');
const requestIp = require('request-ip');

class HTTPDock extends Dock {
    constructor(name, protocol) {
        super(name, protocol);

        this._server = null;
        this._listening = false;
    }

    get path() {
        return __filename;
    }

    listen() {
        this._server = http.createServer(this._handleRequest.bind(this));

        if (!this._listening) {
            this._server.listen(this.config.port, () => {
                this._listening = true;
                this.logger.info('[HTTP Dock] Listening on port ' + this.config.port + '...');
            });
        }
    }

    stop() {
        if (this._listening) {
            this._server.close();
            this._listening = false;
            this.logger.info('[HTTP Dock] Stopped listening');
        }
    }

    _handleRequest(request, response) {
        const chunks = [];
        const meta = {
            ip: requestIp.getClientIp(request)
        };

        request.on('data', function (chunk) {
            chunks.push(chunk);
        });

        request.on('end', function () {
            const data = Buffer.concat(chunks);

            this.process(data, meta, (message) => {
                response.statusCode = 200;

                if (message) {
                    response.write(message);
                    this.logger.verbose('Sent response to client');
                } else response.end();
            });
        }.bind(this));
    }
}

module.exports = new HTTPDock('http', 'HTTP');
```

### Handlers

You must implement `get path()` and `handle()`.

##### Sample handler

```javascript
'use strict';

const Handler = require('iris').Handler;

class Handler1 extends Handler {
    constructor(name) {
        super(name);
    }

    get path() {
        return __filename;
    }

    handle(data) {
        this.logger.info('[Handler1] Handling data...');

        return 'A response';
    }
}

module.exports = new Handler1('handler1');
```

### Hooks

You must implement `get path()` and `process()`.

##### Sample hook
```javascript
'use strict';

const Hook = require('iris').Hook;

class Hook1 extends Hook {
    constructor(name) {
        super(name);
    }

    get path() {
        return __filename;
    }

    process(data) {
        this.logger.info('[Hook1] Running...');
    }

}

module.exports = new Hook1('hook1');
```


## Requirements

- Node.js 6.5.0+

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