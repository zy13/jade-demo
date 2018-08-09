/**
* @Author: Jet.Chan
* @Date:   2016-11-24T16:30:13+08:00
* @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-11-24T17:33:35+08:00
***************************************************************
定义常用的返回数据的结果实体
使用方式：
const cr =new commonResult( .. )
cr.success()
...
***************************************************************
*/
'use strict'

class commonResult {
    constructor(opts) {
        this.base = Object.assign({
            status: false,
            message: '',
            code: 0
        }, opts)
        this.baseData = Object.assign({
            data: {}
        }, this.base)
    }
    success(msg = '', code = 0) {
        let r = Object.assign({}, this.base);
        r.status = true;
        r.message = message;
        r.code = code;
        return r;
    };

    error(msg = '', code = 200) {
        let r = Object.assign({}, this.base);
        r.status = false;
        r.message = message;
        r.code = code;
        return r;
    };

    successData(obj = {}, message = '', code = 0) {
        let r = Object.assign({}, this.baseData);
        r.data = obj;
        r.status = true;
        r.message = message;
        r.code = code;
        return r;
    };

    errorData(obj = {}, message = '', code = 200) {
        let r = Object.assign({}, this.baseData);
        r.data = obj;
        r.status = false;
        r.message = message;
        r.code = code;
        return r;
    }
}

export default commonResult;
