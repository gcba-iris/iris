'use strict';

const Dock = require('../../lib/bases/Dock');
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

    listen(port) {
        this._server = http.createServer(this._handleRequest.bind(this));

        this._server.listen(port, () => {
            this._listening = true;
            this.logger.info('[HTTP Dock] Listening on port ' + port + '...');
        });
    }

    stop() {
        if (this._listening) this._server.close();
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
            const data = Buffer.concat(chunks).toString();

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