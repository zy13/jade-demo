/**
* @Author: Jet.Chan
* @Date:   2016-11-15T11:32:49+08:00
* @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-11-15T18:15:55+08:00
*/



'use strict';

var Logger = require('mini-logger');
var path = require('path');
var moment = require('moment');

var logger;

/*
    线上日志记录
 */

var getLogger = function() {
    if (!logger) {
        logger = Logger({
            dir: path.join(__dirname, '../../', 'logs'),
            stdout: true,
            mkdir: true,
            categories: ['http', 'error', 'other'],
            format: '[{category}.]YYYY-MM-DD[.log]'
        });
    }
    return logger;
}


module.exports = {

    http: function(log) {
        var logStr = '';
        if (typeof log === 'object') {
            logStr = JSON.stringify(log);
        } else {
            logStr = log;
        }
        getLogger().http(moment().format('YYYY-MM-DD HH:mm:ss ---') + 'http log : %s', logStr || '');
    },

    error: function(log) {
        var logStr = '';
        if (typeof log === 'object') {
            logStr = JSON.stringify(log);
        } else {
            logStr = log;
        }
        getLogger().error(moment().format('YYYY-MM-DD HH:mm:ss ---') + 'error log : %s', logStr || '');
    },

    other: function(log) {
        var logStr = '';
        if (typeof log === 'object') {
            logStr = JSON.stringify(log);
        } else {
            logStr = log;
        }
        getLogger().other(moment().format('YYYY-MM-DD HH:mm:ss ---') + 'other log : %s', logStr || '');
    }

};
