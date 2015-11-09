var config = require('./config.json')
  , ipProxy  = require('./lib/ip-proxy');

function printError(err) {
  console.error('[' + new Date().toUTCString() + '] ' + err);
}

var proxy = ipProxy.createServer(config.options);
ipProxy.on('error', printError);
ipProxy.listen(config.port, function () {
  console.log('Starting...');
});