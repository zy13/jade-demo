/**
 * @Author: Jet.Chan
 * @Date:   2016-11-15T17:30:07+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-12-07T12:07:07+08:00
 */



'use strict';

var makeConf = require('./webpack.makeconf'),
    webpackDevExtJson = require('../build/webpack.dev.ext');

module.exports = makeConf(Object.assign({
    dev: true,
    debug: true,
    NODE_ENV: 'development'
}, webpackDevExtJson));
