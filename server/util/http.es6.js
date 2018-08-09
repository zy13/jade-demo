/**
 * @Author: Jet.Chan
 * @Date:   2016-12-02T11:58:12+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-12-02T12:13:14+08:00
 */
import r from "request";
import mockjs from "mockjs";
import { ApiRequestError, CodeException } from "./error";
import logger from "./logger";
const conf = global.appConfig || {};

// 发送请求
const send = (opt) => {
    return new Promise((resolve, reject) => {
        r(opt, (err, response, body) => {
            if (err) {
                reject(new ApiRequestError(`request [${url}] error: [${err}]`));
            } else {
                http.onComplete(response);
                if (response.statusCode === 200) {
                    try {
                        let res = (conf.http.mock || opt.mock) ? eval(`(${body})`) : JSON.parse(body);
                        if (conf.http.mock || opt.mock) {
                            res = mockjs.mock(res);
                        }
                        if (http.isSuccess(res)) {
                            res = http.responseFormat(res);
                            resolve(res);
                        } else {
                            http.errorCallback(response, res);
                            resolve(null);
                        }
                    } catch (e) {
                        reject(new CodeException(e.message));
                    }
                } else {
                    reject(new ApiRequestError(`the httpStatus of [${url}] is [${response.statusCode}]`));
                }
            }
        });
    });
}

const http = {
    get(url, params, header = {}) {
        const req = {
            url,
            params,
            header
        };
        http.onBeforeSend(req);
        const opt = Object.assign({}, http.defaultOptions, {
            url: req.url,
            method: 'GET',
            qs: req.params,
            header: req.header,
        });
        return send(opt);
    },

    post(url, params, header = {}) {
        const req = {
            url,
            params,
            header
        };
        http.onBeforeSend(req);
        const opt = Object.assign({}, http.defaultOptions, {
            url: req.url,
            method: 'POST',
            form: req.params,
            header: req.header,
        });
        return send(opt);
    },


    put(url, params, header = {}) {
        const req = {
            url,
            params,
            header
        };
        http.onBeforeSend(req);
        const opt = Object.assign({}, http.defaultOptions, {
            url: req.url,
            method: 'put',
            form: req.params,
            header: req.header,
        });
        return send(opt);
    },

    del(url, params, header = {}) {
        const req = {
            url,
            params,
            header
        };
        http.onBeforeSend(req);
        const opt = Object.assign({}, http.defaultOptions, {
            url: req.url,
            method: 'delete',
            form: req.params,
            header: req.header,
        });
        return send(opt);
    }
}

http.defaultOptions = {
    time: true
};

// 注册请求前事件
http.onBeforeSend = function(req) {}

// 格式化输出
http.responseFormat = function(res) {
    return res;
}

// 判断请求是否成功
http.isSuccess = function(res) {
    return Number(res.code) === 1;
}

// 注册请求完成事件, 无论成功与否
http.onComplete = function(response) {}

// 业务上的错误回调
http.errCallback = function(response, body) {}

export default http;
