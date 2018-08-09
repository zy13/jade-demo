/**
* @Author: Jet.Chan
* @Date:   2016-11-15T17:23:34+08:00
* @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-11-15T17:31:02+08:00
*/



'use strict';

var fs = require('fs'),
    path = require('path');

module.exports = {

    getEntry: function(cfg) {
        var entryExport = {};
        for (var pathItem in cfg.static.srcPath) {
            var srcPath = path.join(__dirname, '../', cfg.static.srcPath[pathItem]);
            fs.readdirSync(srcPath).forEach(function(v) {
                var tmpSrc = path.join(srcPath, v);
                if (fs.statSync(tmpSrc).isDirectory()) {
                    fs.readdirSync(tmpSrc).forEach(function(jsFile) {
                        var filePath = path.join(tmpSrc, jsFile);
                        if (fs.existsSync(filePath) && jsFile.indexOf('.js') !== -1) {
                            var _pageName = jsFile.replace('.js', '');
                            entryExport[v + '.' + _pageName] = filePath;
                        }
                    });
                }
            });
        }
        return entryExport;
    }

}
