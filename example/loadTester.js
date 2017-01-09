const http = require('http');
const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/',
    method: 'POST'
};
const dataTag = 'tag1|subtag1|02,56,58,8|subtag2|sds,sd,wtr,ghd';

http.globalAgent.maxSockets = 5;

const loop = (options) => {
    setTimeout(function () {
        const requests = 10000;
        let responses = 0;

        for (let i = 0; i < requests; i++) {
            const request = http.request(options, function (response) {
                response.setEncoding('utf8');
                response.once('data', function (body) {
                    if (body === 'A response') {
                        responses++;
                        console.log(`Response: ${responses}`);
                    }
                });
            });

            request.once('error', function (e) {
                console.log('Error: ' + e.message);
            });
            request.write(dataTag);
            request.end();
        }

        console.log(`------------------------------------------------------------------------`);
        console.log(`Requests: ${requests}`);

        loop(options);
    }, 1000);
};

console.log(`[RequestEmitter] Connecting to ${options.hostname}:${options.port}...`);

loop(options);