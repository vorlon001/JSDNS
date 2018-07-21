
var web = require('../module/admin.js').web;
var logger  = require('../libs/log.js').logger;
var dns     = require('../module/dns.js').dns; 

let init = function () {
    web();
    logger();
    dns();
}

module.exports = { init: init } ;
