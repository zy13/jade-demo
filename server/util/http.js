/*
 * @Author: dser.wei
 * @Date:   2016-06-29 11:02:37
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-10T11:27:56+08:00
 */

'use strict';

var http = require('http');
var q = require('q');
var mockjs = require('mockjs');
var consoler = require('consoler');
var logger = require('./logger');
var customError = require('./error');

var whiteList = ['27003001', '27003002', '27003003', '27003004', '27003006', '27002007']

var clean = function(param) {
    if (!param) {
        return '';
    }
    param = param.replace(/^&+/, '');
    param = param.replace(/&{2,}/g, '');
    return param;
}

var appendToUrl = function(url, params) {
    if (!params) {
        return url;
    }
    url += (url.indexOf('?') != -1 ? '&' : '?') + clean(params);
    return url;
}

var request = function(url, opt) {
    var conf = global.appConfig.app;
    var hostAddress = conf.http.host;
    if (process.env.NODE_ENV && 　process.env.NODE_ENV != 'development' && conf.http.host.indexOf('{domain}') > -1)
        hostAddress = global.getDynamicHost()
    var request_timer = null,
        req = null,
        startDate = new Date(),
        dfd = q.defer();

    var postData = opt.postDataString;
    var options = {
        hostname: hostAddress,
        path: opt.path,
        method: opt.method,
        headers: opt.headers
    };
    console.time(options.path);
    req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var returnBody = '';
        res.on('data', function(chunk) {
            returnBody += chunk;
        });
        res.on('end', function(response) {
            clearTimeout(request_timer);

            if (conf.http.mock) {
                returnBody = returnBody.replace(/^\s*callback\(|\)$/g, '');
                if (typeof returnBody == 'string') {
                    returnBody = returnBody.trim();
                    try {

                        returnBody = eval('(' + returnBody + ')');
                        // console.log('returnBody',returnBody);
                        returnBody = mockjs.mock(returnBody);
                        dfd.resolve(returnBody);
                    } catch (e) {
                        consoler.error('Error:not valid json: ');
                        consoler.error(returnBody);
                        dfd.reject(e);
                    }
                } else {
                    consoler.error('Error:not valid string: ');
                    consoler.error(returnBody);
                    dfd.reject('data error');
                }
            } else {
                try {
                    if (typeof returnBody == 'string' && res.statusCode == 200) {

                        returnBody = JSON.parse(returnBody);

                        if (returnBody.code > 0 && whiteList.join(',').indexOf(returnBody.code) <= -1)
                            throw new customError.DataException(returnBody.message, returnBody);
                    } else if (typeof returnBody == 'string' && res.statusCode == 403) {
                          dfd.reject('statusCode:403');
                          return dfd.promise;
                    }
                    if (!returnBody) {
                        logger.error('data error, returnBody is [' + returnBody + ']\r\n request HOST is [' + hostAddress + ']\r\n request URL is [' + options.path + ']');
                        consoler.error('Error:no data');
                        dfd.reject(`no Data statusCode:${res.statusCode}`);
                    }
                    if (returnBody) {
                        logger.http('data succcess, request time is [' + (new Date() - startDate) + 'ms]\r\n request HOST is [' + hostAddress + ']\r\n request URL is [' + options.path + ']');
                        dfd.resolve(returnBody);
                    }
                } catch (e) {
                    logger.http('data error, returnBody is [' + returnBody + ']\r\n request HOST is [' + hostAddress + ']\r\n request URL is [' + options.path + ']');
                    consoler.error('Error:not valid data: ');
                    consoler.error(returnBody);
                    consoler.error('Request URL:' + options.path);
                    dfd.reject(e);
                }
            }

            if (conf.http.console) {
                consoler.info({
                    req: url,
                    args: opt.args,
                    res: returnBody,
                    host: hostAddress
                });

                console.timeEnd(options.path);
                console.log('\r\n');
            }

        });
        res.on('abort', function() {
            dfd.reject('请求超时');
        });
    }).on('timeout', function(e) {
        if (req.res) {
            req.res.emit('abort');
        }
        req.abort();
        dfd.reject('请求超时');
    }).on('error', function(e) {
        logger.error(e);
        consoler.error('Error:unknown')
        consoler.error('Request URL:' + options.path);
        dfd.reject(e.message + ' statusCode:502');
    });
    request_timer = setTimeout(function() {
        req.emit('timeout', {
            message: 'have been timeout...'
        });
    }, 30000);
    if (!req.socket) {
        req.write(postData);
        req.end();
    }
    return dfd.promise;
}


module.exports = {
    get: function(url, args) {
        var conf = global.appConfig.app;
        var postDataString = args ? require('querystring').stringify(args) : '';
        var options = {
            path: appendToUrl(conf.http.path + url, postDataString),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postDataString.length
            },
            args: args,
            postDataString: postDataString
        };
        return request(url, options);
    },

    post: function(url, args) {
        var conf = global.appConfig.app;
        var postDataString = args ? require('querystring').stringify(args) : '';
        var options = {
            path: appendToUrl(conf.http.path + url),
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postDataString.length
            },
            args: args,
            postDataString: postDataString
        };
        return request(url, options);
    },

    put: function(url, args) {
        var conf = global.appConfig.app;
        var postDataString = args ? require('querystring').stringify(args) : '';
        var options = {
            path: appendToUrl(conf.http.path + url),
            method: 'put',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postDataString.length
            },
            args: args,
            postDataString: postDataString
        };
        return request(url, options);
    },

    del: function(url, args) {
        var conf = global.appConfig.app;
        var postDataString = args ? require('querystring').stringify(args) : '';
        var options = {
            path: appendToUrl(conf.http.path + url),
            method: 'delete',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postDataString.length
            },
            args: args,
            postDataString: postDataString
        };
        return request(url, options);
    }

}
