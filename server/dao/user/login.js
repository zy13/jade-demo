/*
* @Author: zyuan
* @Date:   2016-12-22 13:53:03
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-02-08 20:02:22
*/

'use strict';

import http from '../../util/http';

const userDao = {

    //获取验证码
    async getValidateCode() {
        return http.get('/oslogin/verification/getValidateCode')
    },

    //web登录
    async userWebLogin(data) {
        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }
        return http.post('/oslogin/loginCheckForAccountPassword',data.param)
    },

    //app登录
    async userAppLogin(data) {
        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.post('/oslogin/loginCheckForScanCode',data.param)
    },
    //二维码是否失效
    async checkScanCode(data) {
        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.post('/oslogin/checkScanCode',data.param)
    }
}

export default userDao
