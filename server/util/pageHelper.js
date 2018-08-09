/*
 * @Author: dser.wei
 * @Date:   2016-06-22 11:23:19
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-02-28T10:53:20+08:00
 */

'use strict';

/*
    jade上面可以直接调用的方法
 */

var path = require('path');
var fileHelper = require('./fileHelper');
var moment = require('moment');
var _ = require('lodash');
var ip = require('ip')

var getModuleStat = function() {
    var statJSON = fileHelper.readJSON(path.join(__dirname, '../../build', 'assets.json'));
    return statJSON;
};

module.exports = {

    setScript: function(moduleName) {
        var statJSON = getModuleStat();
        if (moduleName && statJSON[moduleName] && statJSON[moduleName].js) {
            var scriptName = typeof(statJSON[moduleName]) == 'string' ? statJSON[moduleName] : statJSON[moduleName].js;
            if (process.env.NODE_ENV && 　process.env.NODE_ENV != 'development' && scriptName.indexOf('{domain}') > -1) {
                scriptName = scriptName.replace('{domain}', global.getDynamicHost());
            }
            return scriptName;
        } else {
            return '';
        }

    },

    setStyle: function(moduleName) {
        var statJSON = getModuleStat();
        if (moduleName && statJSON[moduleName] && statJSON[moduleName].css) {
            var cssName = typeof(statJSON[moduleName]) == 'string' ? statJSON[moduleName] : statJSON[moduleName].css;
            if (process.env.NODE_ENV && 　process.env.NODE_ENV != 'development' && cssName.indexOf('{domain}') > -1) {
                cssName = cssName.replace('{domain}', global.getDynamicHost());
            }
            return cssName;
        } else {
            return '';
        }

    },

    getConfData: function(fileName) {
        var filePath = path.join(__dirname, '../enum', fileName + '.json');
        var res = fileHelper.readJSON(filePath, {});
        return res;
    },

    isDev: function() {
        //判断是否开发环境
        return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    },

    isPro: function() {
        return process.env.NODE_ENV && process.env.NODE_ENV === 'production';
    },

    getWeinre: function() {
        return `http://${ip.address()}:8080/target/target-script-min.js#anonymous`
    },

    querySet: function(queryObj, currQueryObj) {
        var queryArray = [];
        var qObj = _.extend({}, currQueryObj || {}, queryObj || {});
        Object.keys(qObj).forEach(function(v) {
            if (qObj[v] && queryArray[v] != '') {
                queryArray.push(v + '=' + encodeURIComponent(qObj[v])); // 阻止IE浏览器自动解码
            }
        });
        var queryString = queryArray.join('&');
        return queryString.length > 0 ? ('?' + queryString) : '';
    },

    setPageImgPath: function(imgPath) {
        if (this.isDev()) {
            return imgPath;
        } else {
            var sc = global.appConfig.static || {};
            if (sc) {
                if (process.env.NODE_ENV && 　process.env.NODE_ENV != 'development' && sc.staticDomain.indexOf('{domain}') > -1) {
                    return sc.staticDomain.replace('{domain}', global.getDynamicHost()) + imgPath;
                }
                return sc.staticDomain + imgPath;
            }
            return '';
        }
    },

    setUeditor: function(dir) {
        dir = dir || '/ueditor/';

        var sc = global.appConfig.static || {};
        if (process.env.NODE_ENV && 　process.env.NODE_ENV != 'development' &&
            sc.staticDomain && sc.staticDomain.includes("{domain}")) {
            dir = sc.staticDomain.replace('{domain}', global.getDynamicHost()) + dir;
        } else if (process.env.NODE_ENV && 　process.env.NODE_ENV != 'development') {
            dir = sc.staticDomain + dir;
        }
        return [dir + 'ueditor.config.js', dir + 'ueditor.all.js'];
    },

    date: {
        isToday: function(date) {
            try {
                return mement().isSame(date, 'day');
            } catch (e) {
                return false;
            }
        },
        format: function(dateString, format) {
            //设置语言
            moment.locale('zh-cn');
            return moment(dateString).format(format);
        },
        getweek: function(dateString) {
            return moment(dateString).format('dddd').replace(/星期/, '周');
        }
    },

    formatter: {
        escape: function(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        },
        nl2br: function(value) {
            return String(value || '')
                .replace(/<[^>]+>/g, '')
                .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br/>' + '$2');
        },
        toText: function(value) {
            return String(value || '').replace(/<[^>]+>/g, '');
        },
        strCut: function(str, maxLength, tail) {
            //文字裁剪
            if (maxLength == null) {
                maxLength = 80;
            }
            if (tail == null) {
                tail = '...';
            }
            str = str || '';
            if (str.length > maxLength) {
                return str.slice(0, maxLength - tail.length) + tail;
            }
            return str;
        },
        toDic: function(arr, setKeyName, setValueName, appendList) {
            if (!arr)
                return [];

            var key = setKeyName || 'key',
                val = setValueName || 'value';
            var r = arr.map(function(item) {
                return {
                    text: item[key],
                    value: item[val]
                };
            });
            if (appendList)
                r.unshift(appendList);
            return r;
        },
        formatNum: function(num, digit) {
            return num.toFixed(digit);
        }
    },

    f2int: {
        ceil: function(float) {
            return Math.ceil(float);
        },
        floor: function(float) {
            return Math.floor(float);
        },
        parse: function(float) {
            return parseInt(float, 10);
        }
    },
    getHost: function() {
        var env = process.env.NODE_ENV || 'development';
        var host = config.getConfig(env).http.host;
        return host;
    }

};