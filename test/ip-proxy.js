var ipProxy = require('../lib/ip-proxy')
  , fs      = require('fs')
  , path    = require('path')
  , http    = require('http')
  , should  = require('should')
  , request = require('request');

// Becasue this test use Self-Signed Certificate,
// env NODE_TLS_REJECT_UNAUTHORIZED must be set 0
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var httpsServerOpts = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

describe('ip proxy', function () {

  describe('#init', function () {
    var tests = [
      { targets: {} },
      { targets: { '127.0.0.1': 'http://127.0.0.1:3000' } },
      { targets: { '127.0.0.1': 'http://127.0.0.1:3000', other: 'http://127.0.0.1:3001' } },
      { targets: { other: 'http://127.0.0.1:3001' } },
    ];

    tests.forEach(function (test) {
      it('should success to create instance with (' + test + ')', function () {
        var proxy = ipProxy.createServer(test);
        proxy.should.not.be.null;
      });
    });
  });

  describe('#listen', function () {

    var proxyPort = 5555;

    it('should be a success to listen by specifying the port', function (done) {
      var proxy = ipProxy.createServer();
      proxy.listen(proxyPort, function () {
        proxyPort.should.be.exactly(proxy.address().port);
        proxy.close();
        done();
      });
    });

    var server1 = { body: 'server1', port: 3333, self: null, url: 'http://127.0.0.1:3333' }
      , server2 = { body: 'server2', port: 4444, self: null, url: 'http://127.0.0.1:4444' };

    beforeEach(function () {
      server1.self = http.createServer(function(req, res) {
        res.end(server1.body);
      }).listen(server1.port);
      server2.self = http.createServer(function(req, res) {
        res.end(server2.body);
      }).listen(server2.port);
    });

    afterEach(function() {
      server1.self.close();
      server2.self.close();
    })

    var tests = [
      { args : { targets: {} }, expected: { status: 400, body: '' } },
      { args : { targets: { '127.0.0.1': server1.url } }, expected: { status: 200, body: server1.body } },
      { args : { targets: { '127.0.0.1': server1.url, other: server2.url } }, expected: { status: 200, body: server1.body } },
      { args : { targets: { '127.0.0.1': server2.url, other: server1.url } }, expected: { status: 200, body: server2.body } },
      { args : { targets: { other: server1.url } }, expected: { status: 200, body: server1.body }  },
      { args : { ssl: httpsServerOpts, targets: {} }, expected: { status: 400, body: '' } },
      { args : { ssl: httpsServerOpts, targets: { '127.0.0.1': server1.url } }, expected: { status: 200, body: server1.body } },
      { args : { ssl: httpsServerOpts, targets: { '127.0.0.1': server1.url, other: server2.url } }, expected: { status: 200, body: server1.body } },
      { args : { ssl: httpsServerOpts, targets: { '127.0.0.1': server2.url, other: server1.url } }, expected: { status: 200, body: server2.body } },
      { args : { ssl: httpsServerOpts, targets: { other: server1.url } }, expected: { status: 200, body: server1.body }  },
    ];

    tests.forEach(function (test) {
      var protocol = ((typeof test.args.ssl !== 'undefined') ? 'https' : 'http');
      it('should be a success to access via proxy to host with ' + protocol, function (done) {
        var proxy = ipProxy.createServer(test.args);
        proxy.listen(proxyPort);

        request(protocol + '://localhost:' + proxyPort, function (err, res, body) {
          res.statusCode.should.be.equal(test.expected.status);
          res.body.should.be.equal(test.expected.body);
          proxy.close();
          done();
        });
      });
    });
  });

});
