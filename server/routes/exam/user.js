/*
 * @Author: zyuan
 * @Date:   2017-01-05 13:56:22
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-04-05 18:16:04
 */

'use strict';

import Router from 'koa-router'
import userInfoDao from '../../services/projectManagement/examineeInfo'
import loginDao from '../../services/user/login'
import userAuth from '../authController/userAuth'

//UA分流中间件公共部分
let UA = (ua) => {
    let $ = {};

    if (/mobile/i.test(ua))
        $.Mobile = true;

    if (/like Mac OS X/.test(ua)) {
        $.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
        $.iPhone = /iPhone/.test(ua);
        $.iPad = /iPad/.test(ua);
    }

    if (/Android/.test(ua)) {
        $.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];
    }

    if (/webOS\//.test(ua)) {
        $.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];
    }

    if (/(Intel|PPC) Mac OS X/.test(ua)) {
        $.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;
    }

    if (/Windows NT/.test(ua)) {
        $.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];
    }

    return ($.Mobile || $.iOS || $.iPhone || $.iPad || $.Android);
}

const router = Router()

router.get('/login', async(ctx, next) => {
    let r, ua = ctx.request.headers['user-agent'],
        loginType = ctx.query && ctx.query.projectId ? 2 : 1, //1: 帐号密码登录；2：扫码登录
        path = UA(ua) ? 'examM/login' : 'exam/login',
        projectId = ctx.query && ctx.query.projectId ? ctx.query.projectId : ''

    if (loginType == 2) {
        r = await loginDao.checkScanCode(projectId);

        if (ctx.session && ctx.session.user!=undefined && ctx.session.user.userId != undefined && ctx.session.user.accessToken != undefined) {
            ctx.redirect('/examM/warnTip');
        }
    }
    ctx.render(path, {
        pageTitle: "登录页",
        noReturn: true,
        loginType: loginType,
        projectId: projectId,
        isRequiredValidateCode: ctx.session.isRequiredValidateCode || false,
        isToDownloadIE9: ctx.request.header['user-agent'].indexOf('MSIE 8.0')
    })

});


router.get('/warnTip', userAuth, async(ctx, next) => {
    let ua = ctx.request.headers['user-agent'],
        path = UA(ua) ? 'examM/warnTip' : 'exam/warnTip'

    ctx.render(path, {
        pageTitle: "温馨提示",
        noReturn: false,
        noEdit: true,
        isInitUserInfo: true,
        customer_service:true,
        name: ctx.session.user.name,
        type: 1
    })
});

router.get('/userInfo', userAuth, async(ctx, next) => {
    let ua = ctx.request.headers['user-agent'],
        path = UA(ua) ? 'examM/userInfo' : 'exam/userInfo'
    ctx.request.query.projectId = ctx.session.customer && ctx.session.user.projectId ? ctx.session.user.projectId : '';
    const r = await userInfoDao.getEditAccountInfo(ctx.request.query,
        ctx.session.user.accessToken,
        ctx.session.user.userId
    )

    ctx.render(path, {
        pageTitle: "个人信息",
        noReturn: false,
        noEdit: true,
        customer_service:true,
        r: r.data.response,
        name: ctx.session.user.name,
        isInitUserInfo: ctx.request.query.isEditUserInfo,
        type: 1
    })
});

router.get('/resetPassword', userAuth, async(ctx, next) => {
    let ua = ctx.request.headers['user-agent'],
        path = UA(ua) ? 'examM/resetPassword' : 'exam/resetPassword'

    ctx.render(path, {
        pageTitle: "修改密码",
        noReturn: false,
        noEdit: true,
        customer_service:true,
        name: ctx.session.user.name,
        type: 1
    })
});

router.get('/logout', async(ctx, next) => {
    let ua = ctx.request.headers['user-agent'],
        path = UA(ua) ? 'common/logout' : 'user/logout'
    ctx.render(path, {
        pageTitle: "超时页",
        noReturn: true,
        path: '/exam/login'
    })
});


router.get('/start', async(ctx, next) => {
    ctx.render('examM/index', {
        pageTitle: "启动页",
        noReturn: true,
        noFooter: true
    })
});

export default router
