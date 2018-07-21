
var path = require('path');
var dnsd = require('dnsd');
var nconf = require('nconf');
var redis = require('redis');
var dns = require('native-dns');
var log     = require('../libs/log.js').log;
var sprint = require('sprint');
var uuidv4 = require('../libs/uuid.js').v4;

let dns_server = function () {
    nconf.use('file', {
	file: path.join(__dirname, '../config/config.json')
    }).defaults({
	redis: {
    	    host: '127.0.0.1',
    	    port: 6379
	},
	dns: {
    	    port: 5353
	}
    }).env({
	separator: '_',
        lowerCase: true,
	whitelist: [
    	    'DNS_INTERFACE',
            'DNS_PORT',
	    'DNS_ZONE',
            'REDIS_HOST',
	    'REDIS_PORT',
            'LOGS_LEVEL'
	]
    });

    const keysToLowerCase = obj => {
	if (!typeof obj === 'object' || typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    	    return obj;
	}
        const keys = Object.keys(obj);
	let n = keys.length;
        let lowKey;
	while (n--) {
    	    const key = keys[n];
            if (key === (lowKey = key.toLowerCase())) {
	        continue;
    	    }
	    if (typeof obj[lowKey] === 'object') {
    	        obj[lowKey] = Object.assign(obj[lowKey], keysToLowerCase(obj[key]));
            } else {
	        obj[lowKey] = keysToLowerCase(obj[key]);
    	    }
            delete obj[key];
	}
        return (obj);
    };

    const config = {
	dns: keysToLowerCase(nconf.get()).dns,
        redis: keysToLowerCase(nconf.get()).redis
    };

    const redisClient = redis.createClient(config.redis.port, config.redis.host).on('connect', () => {
	log({type:'INFO', wid: 'PID:' + process.pid, msg: sprint('[Connected to Redis] [config:%s]',JSON.stringify(config.redis))});
    }).on('error', err => {
	console.error('Redis error', err);
    });

    const server = dnsd.createServer((req, res) => {
	const question = res.question[0];
        const hostname = question.name;
	const ttl = Math.floor(Math.random() * 3600);
        var wid = uuidv4();
	let answer = {};
        const start = Date.now();
	if (question.type === 'A') {
    	    redisClient.get(`redis-dns:${hostname}`, (redisErr, redisRes) => {
        	if (redisErr) {
        	    log({type: 'ERROR', wid:wid, msg: sprint('[Redis ERROR] [%s]', JSON.stringify(redisErr))});
        	}
                if (redisRes !== null && redisRes.length > 0) {
	            answer = {
    	                name: hostname,
        	        type: 'A',
            	        data: redisRes,
                	ttl
            	    };

                    res.answer.push(answer);
	            log({type: 'INFO', wid: wid, msg: sprint('[%s:%s/%s] [question:"%s"] [answer:%s]', req.connection.remoteAddress, req.connection.remotePort, req.connection.type, sprint('{domain:"%s", type: "%s"}',question.name,question.type), JSON.stringify(answer))});
    	            res.end();
        	    const delta = (Date.now()) - start;
            	    log({type: 'INFO', wid: wid, msg: sprint('[Finished processing request] [%sms]',delta.toString())});
                } else {
	            const nativeQuestion = new dns.Question({
    	                name: question.name,
        	        type: 'A'
            	    });

                    const start = Date.now();

	            const nativeReq = new dns.Request({
    	                question: nativeQuestion,
        	        server: {
            	            address: '8.8.8.8',
                	    port: 53,
                    	    type: 'udp'
	                },
    	                timeout: 1000
        	    });

            	    nativeReq.on('timeout', () => {
                	log({type:'INFO', wid:wid, msg:'[native-dns: Timeout in making request]'});
            	    });

    	            nativeReq.on('message', (err, answer) => {
        	        if (err) {
                	    console.error(err);
                	}
                	answer.answer.forEach(a => {
                    	    answer = {
                        	name: hostname,
                        	type: 'A',
                        	data: a.address,
                        	ttl
                    	    };
                    	    res.answer.push(answer);
                	});	
            	    });

	            nativeReq.on('end', () => {
    	    	        log({type: 'INFO', wid: wid, msg: sprint('[%s:%s/%s] [question:"%s"] [answer:%s]', req.connection.remoteAddress, req.connection.remotePort, req.connection.type, sprint('{domain:"%s", type: "%s"}',question.name,question.type), JSON.stringify(res.answer))});
                	res.end();
            		const delta = (Date.now()) - start;
                	log({type: 'INFO', wid: wid, msg: sprint('[Finished processing request] [%sms]',delta.toString())});
            	    });

            	    nativeReq.send();
        	}
    	    });
	} else {
    	    res.end();
	}
    });

    server.zone(config.dns.zone, 'ns1.' + config.dns.zone, 'us@' + config.dns.zone, 'now', '2h', '30m', '2w', '10m').listen(config.dns.port, config.dns.interface);
    setTimeout(function () {
	log({type:'INFO', wid: 'PID:'+process.pid, msg: sprint('[Start DNS server] [config:%s]',JSON.stringify(require('../config/config.json')))});
    }, 1);

    process.on('exit', () => {
	log({type:'EXIT', wid: 'PID:'+process.pid, msg: '[Shutting down DNS server.]'});
        log({type:'EXIT', wid: 'PID:'+process.pid, msg: '[Closing Redis connection.]'});
	redisClient.quit();
    });
}

module.exports = { dns: dns_server } ;