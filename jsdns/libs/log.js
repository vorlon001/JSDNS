var dateFormat = require('./date.js').dateFormat;

let log = function (msg) {
        let wid=null;
    	if(msg.wid!=null) wid=msg.wid;
	process.stdout.write('[' + wid + '] [' + msg.type + '] ' + msg.msg + '\n');
	
    }


let logger = function (cluster) {

    var config = require('../config/config.json').logger;
    var fs  = require('fs');

    var ws = fs.createWriteStream('../logs/rest_api.log', { 
        'flags'   : 'a+',
        'encoding': 'utf8',
        'mode'    : '0666',
    });
 
    process.stdout.wr = process.stdout.write;
    process.stdout.er = process.stderr.write;
    
    process.stdout.write = function(mes, c) {
	var ts_hms = Date.now();
        var tms = dateFormat ( new Date(ts_hms), "%Y-%m-%d %H:%M:%S", false);
	if(config.file) ws.write( '[' + tms + '] [' + ts_hms + '] ' + mes); 
    };
    
    process.stderr.write = function(mes, c) {
        if(config.file) ws.write(mes);
	if(config.cli) process.stdout.er(mes, c)   
    };
    
}

module.exports = { logger: logger , log: log};
