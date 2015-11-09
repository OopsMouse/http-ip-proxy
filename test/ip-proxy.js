'use strict';

var ipProxy = require('../lib/ip-proxy')
  , http    = require('http')
  , should  = require('should')
  , request = require('request');

// Becasue this test use Self-Signed Certificate,
// env NODE_TLS_REJECT_UNAUTHORIZED must be set 0
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

    it('should be a success to listen by specifying the port', function (done) {
      var proxy = ipProxy.createServer();
      proxy.listen(5555, function () {
        (5555).should.be.exactly(proxy.address().port);
        proxy.close();
        done();
      });
    });

    it('should be a success to access via host', function (done) {
      var port  = 3000;
      var proxy = ipProxy.createServer({ targets: { '127.0.0.1': 'http://localhost:' + port } });
      proxy.listen(5555);

      var server = http.createServer(function(req, res) {
        res.end('ok');
      }).listen(port);

      request('http://localhost:5555', function (err, res, body) {
        if (err) {
          assert.fail;
        }

        body.should.be.equal('ok');
        done();
      });
    });

  });

  //   var tests = [
  //     { args: { protocol: 'http', isWhite: false }, expected: { throughs: [ 'downstream' ] } },
  //     { args: { protocol: 'http', isWhite: true }, expected: { throughs: [ 'downstream', 'upstream' ] } },
  //     { args: { protocol: 'https', isWhite: false }, expected: { throughs: [ 'downstream' ] } },
  //     { args: { protocol: 'https', isWhite: true }, expected: { throughs: [ 'downstream', 'upstream' ] } }
  //   ];

  //   tests.forEach(function (test) {

  //     var actualThroughs = [];

  //     var server, downstream, upstream;
  //     var isHttps = (test.args.protocol === 'https');

  //     beforeEach(function startServer(done) {
  //       if (isHttps) {
  //         server = https.createServer(httpsServerOpts);
  //       } else {
  //         server = http.createServer();
  //       }

  //       server.on('request', function (req, res) {
  //         res.end();
  //       }).listen(function () {
  //         done();
  //       });
  //     });

  //     beforeEach(function startUpStreamProxy(done) {
  //       upstream = (new Proxy()).on('connect', function () {
  //         actualThroughs.push('upstream');
  //       }).listen(function () {
  //         done();
  //       });
  //     });

  //     beforeEach(function startDownStreamProxy(done) {
  //       downstream = (new Proxy({
  //         proxyHost: 'localhost',
  //         proxyPort: upstream.address().port,
  //         whiteHosts: test.args.isWhite ? [ 'localhost' ] : []
  //       })).on('connect', function () {
  //         actualThroughs.push('downstream');
  //       }).listen(function () {
  //         done();
  //       });
  //     });

  //     it('should be a success to access via ' + (isHttps ? 'https' : 'http') + ' to the host, which ' + (test.args.isWhite ? 'is' : 'isn\'t') + ' a white host', function (done) {

  //       var uri = (isHttps ? 'https' : 'http') + '://localhost:' + server.address().port;
  //       request({
  //         uri: uri,
  //         proxy: 'http://localhost:' + downstream.address().port
  //       }, function (err, res) {
  //         (err === null).should.be.true;
  //         (200).should.be.exactly(res.statusCode);
  //         test.expected.throughs.should.eql(actualThroughs);
  //         done();
  //       });
  //     });

  //     afterEach(function () {
  //       server.close();
  //       downstream.close();
  //       upstream.close();
  //     });
  //   });

  //   it('should cause a error', function (done) {
  //     var server = https.createServer(httpsServerOpts).listen();

  //     var proxy = new Proxy()
  //     .on('connect', function () {
  //       server.close();
  //       proxy.close();
  //     }).on('error', function (err) {
  //       err.should.not.be.null;
  //       done();
  //     }).listen(function () {
  //       request({
  //         uri: 'https://localhost:' + server.address().port,
  //         proxy: 'http://localhost:' + proxy.address().port
  //       }, function () {});
  //     });
  //   });

});