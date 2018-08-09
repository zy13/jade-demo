/*
* @Author: zyuan
* @Date:   2017-01-11 18:53:20
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-04-19 11:29:36
*/

'use strict';

import Router from 'koa-router'
import taskListDao from '../../services/examManagement/examiner'
import userAuth from '../authController/userAuth'
import userInfoDao from '../../services/projectManagement/examineeInfo'
//UA分流中间件公共部分
let UA =  (ua)=> {
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

router.get('/taskList',userAuth, async(ctx, next) => {
    const r = await taskListDao.getUserTaskList(ctx.session.user.userId,
        ctx.session.user.accessToken)
    let ua = ctx.request.headers['user-agent'],
        path = UA(ua)?'examM/taskList':'exam/taskList',
        pageTitle = ''
    // const res = await userInfoDao.getEditAccountInfo(ctx.request.query,
    //     ctx.session.user.accessToken,
    //     ctx.session.user.userId
    // )
    // for (let i = 0; i < res.data.response.fields.length; i++) {
    //     if (res.data.response.fields[i].fieldKey == 'name' && res.data.response.fields[i].fieldValue) {
    //         pageTitle = res.data.response.fields[i].fieldValue
    //     }
    // }
    // console.log(r)
    ctx.render(path, {
        pageTitle: ctx.session.user.name,
        noReturn: false,
        r: r.data.response,
        code: r.code,
        message: r.message,
        sourceBack: '/exam/userInfo',
        name:ctx.session.user.name,
        customer_service:true,
        type:1
    })
});

export default router
