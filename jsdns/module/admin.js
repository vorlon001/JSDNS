var redis = require('redis');
var http = require('http');
var express = require('express');
var config = require('../config/config.json');
var logger  = require('../libs/log.js').logger;
var log     = require('../libs/log.js').log;
var sprint = require('sprint');
var uuidv4 = require('../libs/uuid.js').v4;

let web_server = function () {

    var app = express();

    app.get('/api/get/:dns/:token', function(req, res) {
	var wid = uuidv4();
	var dns = req.params.dns;
	var token = req.params.token;

	
	const start = Date.now();
	const redisClient = redis.createClient(config.redis.port, config.redis.host).on('connect', () => {
        }).on('error', err => {
            log({type: 'ERROR', wid:wid, msg: sprint('[Redis ERROR] [%s]', JSON.stringify(err))});
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({'status': '500'}));
        });
        const {promisify} = require('util');
        const getAsync = promisify(redisClient.get).bind(redisClient);
        getAsync(sprint('redis-admin:%s:%s',req.connection.remoteAddress,token)).then(function(r) {
    	    if(r=='true') getAsync('redis-dns:'+dns).then(function(r) {
			        res.setHeader('Content-Type', 'application/json');
			        let json = null;
    			        if(r!=null) json=JSON.stringify({'status': '200', 'dns': dns, 'ip':  r });
			        else json = JSON.stringify({'status': '404'});
			        log({type:'INFO', wid: wid, msg: sprint('[%s:%s/HTTP] ["type":"GET", "domain":"%s"] ["answer":"%s"]',req.connection.remoteAddress,req.connection.remotePort,dns,json)});
			        res.end(json);
			        const delta = (Date.now()) - start;
    			        log({type: 'INFO', wid: wid, msg: sprint('[Finished processing request] [%sms]',delta.toString())});
    			});
    	    else  {
    		    var out_html='{status: 404}';
    		    log({type:'UNAUTH', wid:wid, msg: sprint('[%s:%s/HTTP] ["type":"GET", "url":"%s"] ["answer":"%s"]',req.connection.remoteAddress,req.connection.remotePort,req.url,JSON.stringify({'status': '404'}))})
    		    res.setHeader('Content-Type', 'application/json');
    		    res.end(out_html);
    		    const delta = (Date.now()) - start;
    		    log({type: 'INFO', wid: wid, msg: sprint('[Finished processing request] [%sms]',delta.toString())});

    		    }
        });
    });


    app.get('/api/set/:dns/:ip/:token', function(req, res) {
	var wid = uuidv4();
        var dns = req.params.dns;
	var dns_ip = req.params.ip;
	var token = req.params.token;
	const start = Date.now();
	const redisClient = redis.createClient(config.redis.port, config.redis.host).on('connect', () => {
        }).on('error', err => {
    	    log({type: 'ERROR', wid:wid, msg: sprint('[Redis ERROR] [%s]', JSON.stringify(err))});
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({'status': '500'}));
        });
        const {promisify} = require('util');
        const getAsync = promisify(redisClient.get).bind(redisClient);
        getAsync(sprint('redis-admin:%s:%s',req.connection.remoteAddress,token)).then(function(r) {
            if(r=='true') {
    		log({type:'INFO', wid:wid, msg: sprint('[%s:%s/HTTP] ["type":"SET", "domain":"%s"] ["answer":"%s"]',req.connection.remoteAddress,req.connection.remotePort,dns,JSON.stringify({'status': '200'}))});
	        redisClient.set('redis-dns:'+dns,dns_ip);
	    	redisClient.bgsave();
	        res.setHeader('Content-Type', 'application/json');
	        res.send(JSON.stringify({'status': '200'}));
    		const delta = (Date.now()) - start;
	        log({type: 'INFO', wid: wid, msg: sprint('[Finished processing request] [%sms]',delta.toString())});
    	    } else  {
            	    var out_html='{status: 404}';
                    log({type:'UNAUTH', wid:wid, msg: sprint('[%s:%s/HTTP] ["type":"GET", "url":"%s"] ["answer":"%s"]',req.connection.remoteAddress,req.connection.remotePort,req.url,JSON.stringify({'status': '404'}))})
                    res.setHeader('Content-Type', 'application/json');
                    res.end(out_html);
                    const delta = (Date.now()) - start;
                    log({type: 'INFO', wid: wid, msg: sprint('[Finished processing request] [%sms]',delta.toString())});

            }
        });
    });

    app.get('*', function(req, res) {
	const start = Date.now();
	var wid = uuidv4();
	var out_html='{status: 404}';
	log({type:'BAD_URL', wid:wid, msg: sprint('[%s:%s/HTTP] ["type":"GET", "url":"%s"] ["answer":"%s"]',req.connection.remoteAddress,req.connection.remotePort,req.url,JSON.stringify({'status': '404'}))})
	res.setHeader('Content-Type', 'application/json');
	res.end(out_html);
	const delta = (Date.now()) - start;
        log({type: 'INFO', wid: wid, msg: sprint('[Finished processing request] [%sms]',delta.toString())});
    });

    const http_server = http.createServer(app)

    http_server.listen(
      config.server.port,
      config.server.ip,
      () => {
	    log({type:'INFO',wid: 'PID:'+process.pid, msg: sprint('[Admin panel JS DNS is UP] [config:%s]',JSON.stringify(config.server))});
	}
    );

}

module.exports = { web: web_server } ;
