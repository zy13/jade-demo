/*
* @Author: zyuan
* @Date:   2017-01-11 12:40:03
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-06T19:22:35+08:00
*/

'use strict';

import Router from 'koa-router';
import CommonResult from "../../util/commonResult";
import userServices from '../../services/user/login'
import moment from 'moment';

const cr = new CommonResult();
const router = Router();

router.get('/session/getContext', async(ctx) => {
    if (ctx.session.user) {
        ctx.body = cr.successData(ctx.session.user);
    } else {
        ctx.body = cr.errorData({}, '用户登录超时', 999);
    }
})

router.post('/session/login', async(ctx) => {

    if (ctx.request && ctx.request.body) {

        if (ctx.request.body.isQrCodeLogin == 0) { //帐号密码登录
            let validateCode = ctx.request.body.validateCode || '';

            if (ctx.session.isRequiredValidateCode) {
                let isValidate = ctx.session.validateCode && validateCode.toUpperCase() == ctx.session.validateCode.toUpperCase();
                if (!isValidate) {
                    ctx.body = {
                        status: true,
                        isValidate: false,
                        message: '验证码错误！'
                    }
                    return;
                }
            }

            let query = {};

            query.callerIP = ctx.callerIP; //来源IP
            query.callerFrom = '0'; //来源（0：web,1:app）
            query.loginType = '0'; //登录类型: 0代表考生，1代表管理员
            query.account = ctx.request.body.account;
            query.password = ctx.request.body.password;
            query.validateCode = ctx.request.body.validateCode;

            const r = await userServices.userWebLogin(query);

            if (r && r.code == 0) {
                console.log(r.data.response)
                ctx.session.user = {}
                ctx.session.user.accessToken = r.data.response.token;
                ctx.session.user.account = r.data.response.account;
                ctx.session.user.companyId = r.data.response.companyId;
                ctx.session.user.name = r.data.response.name && r.data.response.name.length>0? r.data.response.name : r.data.response.account;
                ctx.session.user.userId = r.data.response.id;
                ctx.session.user.ExpiresTime = moment().add(1000 * 60 * 6000, 'ms').format();
                ctx.session.maxAge = 1000 * 60 * 120;
                ctx.session.isRequiredValidateCode = false;
                ctx.body = {
                    status: true,
                    isValidate: true,
                    user: ctx.session.user,
                    message: r.message
                }
            } else {
                ctx.session.isRequiredValidateCode = true;
                ctx.body = {
                    status: false,
                    isValidate: true,
                    message: r.message || '服务器繁忙，请稍后重试',
                    isRequiredValidateCode : true
                }
            }
        }

        if (ctx.request.body.isQrCodeLogin == 1) { //扫码登录
            let query = {};

            query.callerIP = ctx.callerIP; //来源IP
            query.callerFrom = '1'; //来源（0：web,1:app）
            query.mobile = ctx.request.body.mobile || '';
            query.verificationCode = ctx.request.body.verificationCode || '';
            query.projectId = ctx.request.body.projectId || '';

            const r = await userServices.userAppLogin(query); //扫码登录数据

            if (r && r.code == 0) {
                ctx.session.user = {}

                ctx.session.user.accessToken = r.data.response.token;
                ctx.session.user.account = r.data.response.account;
                ctx.session.user.companyId = r.data.response.companyId;
                ctx.session.user.name = r.data.response.name && r.data.response.name.length>0 ? r.data.response.name:r.data.response.account;
                ctx.session.user.userId = r.data.response.id;
                ctx.session.maxAge = 1000 * 60 * 1000;

                ctx.body = {
                    status: true,
                    user: ctx.session.user,
                    message: r.message
                }
            } else {
                ctx.body = {
                    status: false,
                    user: {},
                    message: r.message
                }
            }
        }
    } else {
        ctx.body = {
            status: false,
            message: '网络错误！'
        }
    }
})

router.post('/session/update', async(ctx) => {
    if (ctx.request && ctx.request.body) {
        let newName = ctx.request.body.name;
        if(typeof newName == 'string')
            ctx.session.user.name = newName && newName.length>0? newName : ctx.session.user.account;
        ctx.body = {
            status: true,
            message: '更新成功'
        }
    }else{
        ctx.body = {
            status: false,
            message: '参数错误！'
        }
    }
})

router.post('/session/logout', async(ctx) => {
    let postData = ctx.request.body;

    if (ctx.session || ctx.session.user || postData.accessToken == ctx.session.user.accessToken) {
        ctx.session = null;

        ctx.body = {
            status: true,
            message: 'logout success'
        }
    } else {
        ctx.body = {
            status: false,
            message: 'logout fail'
        }
    }
});


export default router
