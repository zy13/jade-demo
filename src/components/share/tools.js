/**
 * @Author: Jet.Chan
 * @Date:   2016-12-07T14:46:35+08:00
 * @Email:  guanjie.chen@talebase.com
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-02-28T16:25:16+08:00
 */



class RandomString {
    constructor() {
        this.text = ['abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '1234567890', '!@#-'];
    }
    rand(min, max) {
        return Math.floor(Math.max(min, Math.random() * (max + 1)));
    }
    getString(min, max) {
        let len = this.rand(min, max);
        let pwd = '';
        for (let i = 0; i < len; i++) {
            let strpos = this.rand(0, 3);
            pwd += this.text[strpos].charAt(this.rand(0, this.text[strpos].length - 1));
        }
        return pwd;
    }
    getTypeString(min, max, type) {
        let len = this.rand(min, max),
            pwd = '',
            types = [];

        if (type) {
            if (typeof type == 'string')
                types = type.split(',');
            else
                types = type;
            types.map((item) => {
                switch (item) {
                    case 'number':
                        pwd += this.text[2].charAt(this.rand(0, this.text[2].length - 1));
                        break;
                    case 'letter':
                        let strpos = this.rand(0, 1);
                        pwd += this.text[strpos].charAt(this.rand(0, this.text[strpos].length - 1));
                        break;
                    case 'char':
                        pwd += this.text[3].charAt(this.rand(0, this.text[3].length - 1));
                        break;
                    default:
                }
                len--;
            })
        }

        for (var i = 0; i < len; i++) {
            let strpos = this.rand(0, 3);
            pwd += this.text[strpos].charAt(this.rand(0, this.text[strpos].length - 1));
        }
        return pwd;
    }
}

class FormOptions {
    constructor(jqueryForm = {}) {
        this.jqueryForm = jqueryForm;
    };
    getDataObj(inputType = 'text') {
        let model = new Object()
        this.jqueryForm.find(`input[type=${inputType}]`).map((v, k) => {
            model[$(k).attr('name')] = $(k).val()
        })
        return model
    }
    toPostString(obj) {
        let postStrs = [];
        Object.keys(obj).map((v, k) => {
            postStrs.push(`${v}=${obj[v]}`)
        })
        return postStrs.join('&')
    }
}

const pageHelper = {
    urlContext: () => {
        let urlContext = {},
            hashReg = /#\/.*\?.*$/,
            href = location.href,
            _hash = href.match(hashReg);
        if (_hash) {
            let _paras = _hash[0].split('?');
            if (_paras.length > 1) {
                let _parArray = _paras[1].split('&');
                $(_parArray).each((k, v) => {
                    let _par = v.split('=');
                    urlContext[_par[0].toString()] = _par[1] || ''
                })
            }
        } else {
            let _locationSearch = location.search;
            if (_locationSearch) {
                _locationSearch = _locationSearch.replace('?', '');
                let _paras = _locationSearch.split('&');
                if (_paras.length > 0) {
                    $(_paras).each((k, v) => {
                        let _par = v.split('=');
                        urlContext[_par[0].toString()] = _par[1] || ''
                    })
                }
            }
        }
        // 返回的是一个对象
        return urlContext;
    },
    getBrowserInfo: () => {
        let browser = {
                appname: 'unknown',
                version: 0
            },
            userAgent = window.navigator.userAgent.toLowerCase();
        //IE,firefox,opera,chrome,netscape
        if (/(msie|firefox|opera|chrome|netscape)\D+(\d[\d.]*)/.test(userAgent)) {
            browser.appname = RegExp.$1;
            browser.version = RegExp.$2;
        } else if (/version\D+(\d[\d.]*).*safari/.test(userAgent)) { // safari
            browser.appname = 'safari';
            browser.version = RegExp.$2;
        } else if (!!window.ActiveXObject || "ActiveXObject" in window) {
            browser.appname = 'msie';
            browser.version = 11;
        }
        return browser;
    }
}

export {
    RandomString,
    FormOptions,
    pageHelper
}