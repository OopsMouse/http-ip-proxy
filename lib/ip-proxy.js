'use strict';

var http         = require('http')
  , httpProxy    = require('http-proxy');

function createServer(options) {
  var self = this;
  var opts = options || {};

  var proxy   = httpProxy.createProxyServer(opts)
    , targets = opts.targets || [];

  var server = http.createServer(function(req, res) {
    var addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!addr) {
      res.end(400);
      return;
    }

    var target = targets[addr];
    if (!target) {
      res.end(400);
      return;
    }

    proxy.web(req, res, target);
  });

  return server;
}

module.exports = {
  createServer: createServer
}