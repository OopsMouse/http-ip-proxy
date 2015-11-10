var http      = require('http')
  , https     = require('https')
  , httpProxy = require('http-proxy');

function createServer(options) {
  var opts     = options || {}
    , proxy    = httpProxy.createProxyServer({})
    , targets  = opts.targets || {}
    , isHttps  = (typeof opts.ssl !== 'undefined')
    , server;

  if (isHttps) {
    server = https.createServer(opts.ssl);
  } else {
    server = http.createServer();
  }

  server.on('request', function (req, res) {
    var addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      , target = targets[addr] || targets['other'];

    if (!target) {
      res.statusCode = 400;
      res.end();
      return;
    }

    console.error('[' + new Date().toUTCString() + ']: access from ' + addr + ' to ' + target);

    proxy.web(req, res, { target: target });
  });

  return server;
}

module.exports = {
  createServer: createServer
}
