/*
 * @Author: zyuan
 * @Date:   2017-01-12 10:41:57
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-02-17T18:14:06+08:00
 */

'use strict';

'use strict';

import Router from 'koa-router'
import exerciseDao from '../../services/examManagement/exercise'
import userAuth from '../authController/userAuth'
import userInfoDao from '../../services/projectManagement/examineeInfo'
import moment from 'moment'
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

router.get('/paper', userAuth, async(ctx, next) => {
    let r, ua = ctx.request.headers['user-agent'],
        path = 'exam/paper',
        noFooter = false,
        isLoadingM = false,
        pageTitle = '',
        refreshTime = '';
    // const res = await userInfoDao.getEditAccountInfo(ctx.request.query,
    //     ctx.session.user.accessToken,
    //     ctx.session.user.userId
    // )
    // for (let i = 0; i < res.data.response.fields.length; i++) {
    //     if (res.data.response.fields[i].fieldKey == 'name' && res.data.response.fields[i].fieldValue) {
    //         pageTitle = res.data.response.fields[i].fieldValue
    //     }
    // }
    if (UA(ua)) {
        path = 'examM/paper';
        noFooter = true;
        isLoadingM = true;
        r = await exerciseDao.getExerciseDetail(ctx.request.query,
            ctx.session.user.accessToken)
    } else {
        r = await exerciseDao.getExerciseDetailPC(ctx.request.query,
            ctx.session.user.accessToken)
    }

    if(r.message && r.message=='您已交卷'){
        ctx.redirect('/exam/taskList')
    }

    ctx.render(path, {
        pageTitle: ctx.session.user.name,
        noReturn: false,
        r: r.data.response,
        code: r.code,
        message: r.message,
        name: ctx.session.user.name,
        type: 1,
        customer_service:true,
        noFooter: noFooter,
        isLoadingM: isLoadingM,
        userId: ctx.session.user.userId
    });
});

router.get('/paper/finish',userAuth, async(ctx, next) => {
    console.log(ctx.session)
    let ua = ctx.request.headers['user-agent'],
        path = UA(ua) ? 'examM/finish' : 'exam/finish'
    if(UA(ua)){
        if(ctx.session.user.userId!=ctx.request.query.userId){
            ctx.redirect('/exam/logout');
        }
    }
    ctx.render(path, {
        pageTitle: `${ctx.session.user.name}`,
        noReturn: false,
        name: ctx.session.user.name,
        customer_service:true,
        type: 1
    })
});

export default router
