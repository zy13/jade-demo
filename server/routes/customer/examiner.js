/*
 * @Author: zyuan
 * @Date:   2016-12-27 14:14:24
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-06T11:18:55+08:00
 */

'use strict';


import 'babel-polyfill'
import Router from 'koa-router'

//import q from '../../util/asyncHttp'
//import http from '../../util/http'
import examinerService from '../../services/examManagement/examiner'
import customerAuth from '../authController/customerAuth'

const router = Router()

//考官任务列表
router.get('/examiner/taskList', customerAuth, async(ctx, next) => {
    const queryList = await examinerService.getTaskList(ctx.request.query,
        ctx.session.customer.accessToken);

    ctx.render('examiner/taskList', {
        pageTitle: '考官界面-考官任务列表',
        queryList: queryList.data.response,
        totalCount: queryList.data.response.pageResponse.total,
        pagesize: queryList.data.response.pageResponse.limit,
        name: ctx.session.customer.name,
        type:0,
        code: queryList.code,
        message: queryList.message
    })
})

//评卷详情
router.get('/examiner/taskDetail', customerAuth, async(ctx, next) => {
    const queryList = await examinerService.getTaskDetailList(ctx.request.query,
        ctx.session.customer.accessToken);

    ctx.render('examiner/taskDetail', {
        pageTitle: '考官界面-评卷详情',
        queryList: queryList.data.response,
        totalCount: queryList.data.response.examinees.total,
        pagesize: queryList.data.response.examinees.limit,
        name: ctx.session.customer.name,
        type:0
    })
})

//按考生评卷
router.get('/examiner/evaluate1', customerAuth, async(ctx, next) => {

    const queryList = await examinerService.getExamerMarkList(ctx.request.query,
        ctx.session.customer.accessToken);
    const taskDetail = await examinerService.getTaskDetailList(ctx.request.query,
        ctx.session.customer.accessToken);

    ctx.request.query.evaluate = 1;//按考生评卷
    ctx.render('examiner/examinee', {
        pageTitle: '考官界面-按考生评卷',
        queryList: queryList.data.response,
        taskDetail: taskDetail.data.response,
        name: ctx.session.customer.name,
        code: queryList.code,
        message: queryList.message,
        type:0
    })
})

//按试题评卷
router.get('/examiner/evaluate2', customerAuth, async(ctx, next) => {
    const queryList = await examinerService.getPaperMarkList(ctx.request.query,
        ctx.session.customer.accessToken);
    const taskDetail = await examinerService.getTaskDetailList(ctx.request.query,
        ctx.session.customer.accessToken);

    ctx.request.query.evaluate = 2;//按试题评卷
    ctx.render('examiner/paper', {
        pageTitle: '考官界面-按试题评卷',
        queryList: queryList.data.response,
        taskDetail: taskDetail.data.response,
        name: ctx.session.customer.name,
        code: queryList.code,
        message: queryList.message,
        type:0
    })
})


router.get('/examiner/resetPassword', customerAuth, async(ctx, next) => {
    ctx.render('examiner/resetPassword', {
        pageTitle: '考官界面-修改密码',
        name: ctx.session.customer.name,
        type:0
    })
})
export default router
