const http = require("http");
const options = {
    hostname: '127.0.0.1',
    port: 1337,
    path: '/',
    method: 'POST'
};

const data = 'tag1|subtag1|02,56,58,8|subtag2|sds,sd,wtr,ghd';

const loop = (options) => {
    setTimeout(function () {
        const request = http.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', function (body) {
                console.log('Response: ' + body);
            });
        });

        request.on('error', function (e) {
            console.log('Error: ' + e.message);
        });

        request.write(data);
        request.end();

        console.log('[ResquestEmitter] Sending ' + '\'' + data + '\'');

        loop(options);
    }, 1000);
};

console.log('[RequestEmitter] Connecting to ' + options.hostname + ':' + options.port + '...');

loop(options);