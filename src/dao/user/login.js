/*
* @Author: zyuan
* @Date:   2016-12-22 11:10:32
* @Last Modified by:   zyuan
* @Last Modified time: 2017-03-29 11:41:17
*/

'use strict';

import ajaxHelper from '../../util/ajaxHelper';

const LoginDao = {

    //web登录
    webLogin(opts){
        return ajaxHelper.post({
            url: `/oslogin/loginCheckForAccountPassword`,
            data: {
                account: opts.account,
                callerFrom: opts.callerFrom,
                callerIP: opts.callerIP,
                companyId: opts.companyId,
                loginType: opts.loginType,
                password: opts.password
            }
        })
    },

    //获取图片验证码
    getValidateCode(){
        return ajaxHelper.get({
            url: `/oslogin/verification/getValidateCode`
        })
    },

    //找回密码
    finsPassword(opts){
        return ajaxHelper.post({
            url: `/oslogin/login/findpass`,
            data: {
                account: opts.account,
                email: opts.email
            }
        })
    },

    //获取短息验证
    getSmsValidateCode(phoneNo,projectId){
        return ajaxHelper.post({
            url: `/oslogin/verification/send/${phoneNo}/${projectId}`
        })
    },

    logout(accessToken){
        return ajaxHelper.post({
            url:`/oslogin/loginOut`,
            data:{
                token:accessToken
            }
        })
    }
}
export default LoginDao
