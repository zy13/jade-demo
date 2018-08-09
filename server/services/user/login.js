/*
* @Author: zyuan
* @Date:   2016-12-22 13:54:46
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-02-08 20:13:06
*/

'use strict';

import CommonResult from "../../util/commonResult";
import loginDao from "../../dao/user/login";

const cr = new CommonResult();

const LoginService = {

    async userWebLogin(query = {}) {

        if (!query) {
            return cr.errorData('参数错误');
        }

        const opts = {
            param: {
                account: query.account,
                callerFrom: query.callerFrom || '0',
                callerIP: query.callerIP || '0',
                loginType: query.loginType || '0',
                password: query.password || '0'
            }
        }
        const r = await loginDao.userWebLogin(opts);

        if (r && r.code == 0) {
            opts.permission = r.permission
            opts.response = r.response
            opts.message = r.message
            return cr.successData(opts)
        }
        return cr.errorData(opts, r.message || '数据查询失败，请稍后重试',r.code);
    },

    async userAppLogin(query = {}) {

        if (!query) {
            return cr.errorData('参数错误');
        }

        const opts = {
            param: {
                callerFrom: query.callerFrom,
                callerIP: query.callerIP,
                mobile: query.mobile,
                projectId: query.projectId,
                verificationCode: query.verificationCode
            }
        }

        const r = await loginDao.userAppLogin(opts);

        if (r && r.code == 0) {
            opts.permission = r.permission
            opts.response = r.response
            opts.message = r.message
            return cr.successData(opts)
        }
        return cr.errorData(opts, r.message || '数据查询失败，请稍后重试',r.code);
    },

    async getValidateCode() {

        const opts = {}
        const r = await loginDao.getValidateCode();

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },

    async checkScanCode(projectId) {
        if (!projectId) {
            return cr.errorData('参数错误');
        }

        const opts = {
            param: {
                projectId: projectId
            }
        }

        const r = await loginDao.checkScanCode(opts);

        if (r && r.code == 0) {
            opts.permission = r.permission
            opts.response = r.response
            opts.message = r.message
            return cr.successData(opts)
        }
        return cr.errorData(opts, r.message || '数据查询失败，请稍后重试',r.code);
    }

}
export default LoginService
