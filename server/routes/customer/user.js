/*
 * @Author: zyuan
 * @Date:   2016-12-21 18:55:14
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-01-24T14:59:09+08:00
 */

'use strict';

import 'babel-polyfill'
import Router from 'koa-router'
import userServices from '../../services/user/login'
import customerAuth from '../authController/customerAuth'

const router = Router()

router.get('/login', async(ctx, next) => {
    if (ctx.session.customer != null && ctx.session.customer.userId) {
        return ctx.redirect('/customer/home');
    }
    ctx.render('user/login', {
        pageTitle: "登录页",
        isRequiredValidateCode: ctx.session.isRequiredValidateCode || false,
        isToDownloadIE9: ctx.request.header['user-agent'].indexOf('MSIE 8.0')
    })
});

router.get('/logout', async(ctx, next) => {
    ctx.render('user/logout', {
        pageTitle: "登录超时",
        path: ctx.request.query.path || ''
    })
});

router.get('/findPassword', async(ctx, next) => {
    const r = await userServices.getValidateCode();

    ctx.render('user/findPassword', {
        pageTitle: "找回密码",
        initCode: r.data.response.code
    })
});

router.get('/findPassword/finish', async(ctx, next) => {

    ctx.render('user/findPswFinish', {
        pageTitle: "完成"
    })
});
router.post('/findPassword/validateValidateCode', async(ctx) => {

    if (ctx.request && ctx.request.body) {
        let validateCode = ctx.request.body.validateCode || '';
        let isValidate = ctx.session.validateCode && validateCode.toUpperCase() == ctx.session.validateCode.toUpperCase();

        if (isValidate) {
            ctx.body = {
                status: true,
                isValidate: true,
                message: '验证码正确！'
            }
        } else {
            ctx.body = {
                status: true,
                isValidate: false,
                message: '验证码错误！'
            }
        }
    } else {
        ctx.body = {
            status: false,
            message: '网络错误！'
        }
    }
})
export default router