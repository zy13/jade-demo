/**
 * @Author: Jet.Chan
 * @Date:   2016-11-17T15:20:47+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-16T11:40:24+08:00
 */



'use strict';

import $ from 'jquery'
import q from 'q'
import mockjs from 'mockjs'
const appConfig = AppConfig || {}
import each from './errorCode.handler.js';

const isMockData = (r) => {
    if (appConfig.app.http.mock) {
        if (typeof r == 'string') {
            r = r.replace(/^\s*callback\(|\)$/g, '');
            r = r.trim();
            r = JSON.parse(r);
        }
        r = mockjs.mock(r);
    }
}

const sendRequest = (opts) => {
    return new Promise((resolve, reject) => {
        //let conf = appConfig.static;

        if (opts.url && typeof opts.url === 'string' && opts.url[0] === '/' && opts.url[1] !== '/') {
            opts.url = ajaxHelper.dynamicDomain() + opts.url;
        }
        opts = $.extend({}, opts, {
            dataType: 'json'
        });

        opts.url = opts.url + `${opts.url.indexOf('?')>-1?'&':'?'}m=${Math.random()}`;

        $.ajax(opts).done((res) => {
            if (appConfig.app.http.mock) {
                if (typeof res == 'string') {
                    res = res.replace(/^\s*callback\(|\)$/g, '');
                    res = res.trim();
                    res = JSON.parse(res);
                }
                res = mockjs.mock(res);
            }
            if (each.validateOfflineCode(res, opts.data)) {
                setTimeout(() => {
                    resolve(res);
                }, 6000)
            } else {
                resolve(res);
            }
        }).fail((err) => reject(err))
    });
}

const ajaxHelper = {
    get(opts) {
        return sendRequest($.extend({
            type: 'GET'
        }, opts));
    },
    post(opts) {
        return sendRequest($.extend({
            type: 'POST'
        }, opts));
    },
    put(opts) {
        return sendRequest($.extend({
            type: 'PUT'
        }, opts));
    },
    delete(opts) {
        return sendRequest($.extend({
            type: 'DELETE'
        }, opts));
    },
    async aycGet(opt) {
        return await this.get(opt);
    },
    async aycPost(opt) {
        return await this.post(opt);
    },
    async aycPut(opt) {
        return await this.put(opt);
    },
    async aycDelete(opt) {
        return await this.delete(opt);
    },
    dynamicDomain(args) {
        if (process.env.NODE_ENV != 'development' && appConfig.static.ajaxDomain.indexOf('{domain}')) {
            return appConfig.static.ajaxDomain.replace('{domain}', window.location.host);
        }
        return appConfig.static.ajaxDomain;
    },
    download(url, method, appendToFormInputHtml = '', enctype = "multipart/form-data") {
        return new Promise((r, rj) => {
            let conf = this.dynamicDomain();
            let mr = Math.random();
            $(`<form id='form${mr}' action="${conf}${url}" method="${method ||"post"}"  enctype ="${enctype}" target="${mr}" style='display:none'>${appendToFormInputHtml}</form><iframe style='display:none' id='${mr}' name='${mr}'></iframe>`).appendTo('body');

            // let frmDoc = document.getElementById(`${mr}`).contentWindow.document;
            // let script = document.createElement("script");
            // script.innerHTML=`var uploadCallback = () => {
            //     console.log('callback')
            //     r()
            // }
            // uploadCallback();`
            // frmDoc.body.appendChild(script);
            let uploadCallback = () => {
                setTimeout(() => {
                    $(`[id='${mr}'],[id='form${mr}']`).remove();
                }, 1000);
                r();
            };
            if (window.attachEvent) {
                document.getElementById(mr).attachEvent('onload', uploadCallback);
            } else {
                document.getElementById(mr).addEventListener('load', uploadCallback, false);
            }
            $(`form[id='form${mr}']`).submit();
        });
    },
    ajaxForMultipartFile(url, fileId, opts) {
        let conf = this.dynamicDomain();
        return new Promise((r, rej) => {
            $.ajaxFileUpload({
                url: conf + url,
                secureuri: false,
                fileElementId: fileId,
                data: opts,
                dataType: 'text',
                success: function(result, status) {
                    r(result)
                },
                error: function(err) {
                    rej(err)
                },
                complete: function(a) {}
            })
        })
    }
}

export default ajaxHelper
