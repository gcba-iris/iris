'use strict';

const Dock = require('../../lib/bases/Dock');
const http = require('http');
const requestIp = require('request-ip');

class HTTPDock extends Dock {
    constructor(name, protocol) {
        super(name, protocol);
    }

    get path() {
        return __filename;
    }

    listen(port) {
        const server = http.createServer(this._handleRequest.bind(this));

        server.listen(port, () => {
            this.logger.info('[HTTP Dock] Listening on port ' + port + '...');
        });
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
                } else response.end();
            });
        }.bind(this));
    }
}

module.exports = new HTTPDock('http', 'HTTP');