/**
* @Author: Jet.Chan
* @Date:   2016-11-15T17:30:21+08:00
* @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-11-15T17:30:58+08:00
*/



'use strict';

var makeConf = require('./webpack.makeconf');

module.exports = makeConf({
    dev: false,
    debug: false,
    NODE_ENV: 'test'
});
