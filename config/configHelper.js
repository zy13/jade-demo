/**
 * @Author: Jet.Chan
 * @Date:   2016-11-15T17:25:23+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-02-28T10:54:00+08:00
 */



'use strict';

var fileHelper = require('../server/util/fileHelper'),
    path = require('path'),
    _ = require('lodash');

var getConfig = function(env) {
    // var env = process.env.NODE_ENV || 'development';
    var defConfig = fileHelper.readJSON(path.join(__dirname, './systemConfig', 'default.json'));
    var userConfig = fileHelper.readJSON(path.join(__dirname, './systemConfig', 'user.json'), {});
    var cfg = _.extend(defConfig, userConfig);
    return cfg[env] || {};
}

//koa middleware
var config = function(app, env) {
    var self = app || this || {};
    var conf = getConfig(env || 'development');
    self.context.appConfig = global.appConfig = conf;

    return function*(next) {
        try {
            //domains
            if (env != 'development' && global.appConfig.app.http.host.indexOf('{domain}') > -1) {
                var _ = this;
                global.getDynamicHost = function() {
                    return _.host;
                };
            }
            yield* next;
        } catch (err) {
            throw err;
        }
    };
}

module.exports = getConfig;
module.exports.config = config;
