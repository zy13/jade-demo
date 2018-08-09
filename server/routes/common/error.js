/*
 * @Author: zyuan
 * @Date:   2017-01-13 14:28:02
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-03-10T14:38:37+08:00
 */

'use strict';

import 'babel-polyfill'
import Router from 'koa-router'

import uaHandler from '../../middlewares/ua.Handler';

const router = Router()

// router.get('/testerror', async(ctx, next) => {
//     let a = {};
//     ctx.body ={a:1};
// });
router.get('/error/:code', async(ctx, next) => {
    let code = ctx.params.code,
        ua = await uaHandler(ctx);

    let lastErrorData = {};
    if (code > 1000) {
        lastErrorData = ctx.cookies.get('lastErrorMsg') ? JSON.parse(ctx.cookies.get('lastErrorMsg')) : {};
        lastErrorData.message = decodeURIComponent(lastErrorData.message);
        if (code == '29000001')
            ctx.session.customer = null;
    }
    if (ua) {
        //M端错误
        ctx.render('common/error', {
            pageTitle: '错误页',
            noReturn: true,
            code: code,
            lastErrorData: lastErrorData
        })
    } else {
        //PC端错误
        ctx.render('common/notFound', {
            pageTitle: '错误页',
            code: code,
            lastErrorData: lastErrorData
        })
    }
});

export default router;