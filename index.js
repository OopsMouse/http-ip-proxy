var fs = require('fs')
  , path = require('path')
  , config = require('./config.json')
  , ipProxy  = require('./lib/ip-proxy');

function printError(err) {
  console.error('[' + new Date().toUTCString() + '] ' + err);
}

process.on('uncaughtException', function (err) {
  printError(err);
});

if (config.options.ssl) {
  config.options.ssl = {
    key: fs.readFileSync(path.join(__dirname, config.options.ssl.key)),
    cert: fs.readFileSync(path.join(__dirname, config.options.ssl.cert))
  }
}

var proxy = ipProxy.createServer(config.options);
proxy.on('error', printError);
proxy.listen(config.port, function () {
  console.log('Starting...');
});
