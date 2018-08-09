/*
 * @Author: zyuan
 * @Date:   2016-12-14 16:16:34
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-20T15:42:24+08:00
 */

'use strict';

import 'babel-polyfill'
import Router from 'koa-router'
import q from '../../util/asyncHttp'
import http from '../../util/http'
import examineeInfoService from '../../services/projectManagement/examineeInfo'
import customerAuth from '../authController/customerAuth'

const router = Router()

//帐号管理
router.get('/examineeInfo/accountManagement/', customerAuth, async(ctx, next) => {
    //let projectName = ctx.request.query.projectName;
    //let taskName = ctx.request.query.taskName;
    const queryList = await examineeInfoService.getExamineeInfo(ctx.request.query, ctx.session.customer.accessToken);
    const accountInfo = await examineeInfoService.getAccountInfo(ctx.request.query, ctx.session.customer.accessToken);
    let projectName = queryList.data.response.param.projectName;
    let taskName = queryList.data.response.param.taskName;
    // const isogeny = ctx.header.referer&&ctx.header.referer.match(/\/examineeInfo\/accountManagement\//g)?0:1
    ctx.render('examineeInfo/accountManagement', {
        pageTitle: '项目管理-项目列表-帐号管理',
        queryList: queryList.data.response,
        projectName: projectName,
        taskName: taskName,
        isogeny: 0,
        accountInfo: accountInfo.data.response
    })
})

//数据管理
router.get('/examineeInfo/dataManagement', customerAuth, async(ctx, next) => {
    const queryList = await examineeInfoService.getDataManagement(ctx.session.customer.accessToken , ctx.request.query);

    ctx.render('examineeInfo/dataManagement', {
        pageTitle: '项目管理-项目列表-数据管理',
        response:queryList.data.response
    })
})

//导入日志
router.get('/examineeInfo/accountManagement/importLog', customerAuth, async(ctx, next) => {
    let projectName = ctx.request.query.projectName;
    let taskName = ctx.request.query.taskName;
    const queryList = await examineeInfoService.getImportLog(ctx.request.query, ctx.session.customer.accessToken);

    ctx.render('examineeInfo/importLog', {
        pageTitle: '项目管理-项目列表-帐号管理',
        queryList: queryList.data.response,
        projectName: projectName,
        taskName: taskName
    })
})

export default router
