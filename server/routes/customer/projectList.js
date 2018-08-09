/*
 * @Author: zyuan
 * @Date:   2016-12-06 10:11:39
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-13T21:14:12+08:00
 */

'use strict';

import 'babel-polyfill'
import Router from 'koa-router'
import customerAuth from '../authController/customerAuth'
import q from '../../util/asyncHttp'
import http from '../../util/http'
import projectListServices from '../../services/projectManagement/projectList'

const router = Router()

router.get('/projectList/index', customerAuth, async(ctx, next) => {
    console.info("session is " + ctx.session.customer)

    const r = await projectListServices.getProjectList(ctx.request.query,
        ctx.session.customer.accessToken);

    ctx.render('projectList/index', Object.assign({
        pageTitle: '项目管理-项目列表',
        param: r.data.param,
        pros: r.data.response,
        permission: r.data.permission.hasUpgradeVersionPermission,
        totalCount: r.data.response.total,
        pagesize: r.data.response.limit
    }));
})

//创建项目
router.get('/projectList/createProject', customerAuth, async(ctx, netxt) => {

    const rAccount = await projectListServices.getAccount(ctx.session.customer.companyId,
        ctx.session.customer.accessToken)

    ctx.render('projectList/createProject', {
        pageTitle: '项目管理-新建项目',
        createOredit: 'create',
        customer: {
            account: ctx.session.customer.account,
            name: ctx.session.customer.name
        },
        account: rAccount && rAccount.response ? {
            pointBalance: rAccount.response.pointBalance,
            smsBalance: rAccount.response.smsBalance,
            pointCost: rAccount.response.peraccountValid || 4
        } : {}
    })
})

//选择试卷
router.get('/projectList/selectPaper/:projectId', customerAuth, async(ctx, netxt) => {
    var projectId = ctx.params.projectId;
    const r = await projectListServices.getPapers(projectId, ctx.session.customer.accessToken);
    ctx.render('projectList/selectPaper', {
        pageTitle: '项目管理-选择试卷',
        response: r.data.response || {},
        projectId: projectId,
        totalCount: r.data.response.total,
        pagesize: r.data.response.limit,
        createOredit: ctx.query.createOredit,
    })
})

//创建完成
router.get('/projectList/createFinish/:projectId', customerAuth, async(ctx, next) => {
    var projectId = ctx.params.projectId;
    ctx.render('projectList/createFinish', Object.assign({
        pageTitle: '项目管理-项目列表-完成创建',
        projectId: projectId,
        createOredit: ctx.query.createOredit || 'edit'
    }));

})

//修改项目
router.get('/projectList/editProject/:projectId', customerAuth, async(ctx, netxt) => {
    var projectId = ctx.params.projectId;
    const r = await projectListServices.getProjectDetail(projectId,
        ctx.session.customer.accessToken)

    const rAccount = await projectListServices.getAccount(ctx.session.customer.companyId,
        ctx.session.customer.accessToken)

    ctx.render('projectList/createProject', {
        pageTitle: '项目管理-修改项目',
        response: r.data.response || {},
        createOredit: ctx.query.createOredit || 'edit',
        projectId: projectId,
        account: rAccount && rAccount.response ? {
            pointBalance: rAccount.response.pointBalance,
            smsBalance: rAccount.response.smsBalance,
            pointCost: rAccount.response.peraccountValid || 4
        } : {}
    })
})


//通知日志
router.get('/projectList/notifyRecords', customerAuth, async(ctx, next) => {
    let projectName = ctx.request.query.projectName;

    console.log('projectName',projectName);
    const querylist = await projectListServices.getNotifyRecords(ctx.request.query, ctx.session.customer.accessToken);
    const proSelect = await projectListServices.getProSelect(ctx.session.customer.accessToken);
    const sendType = ctx.request.query.sendType;
    ctx.render('projectList/notifyRecords', {
        pageTitle: '项目管理-项目列表-通知日志',
        querylist: querylist.data.response,
        proSelect: proSelect.data.response,
        projectName: projectName,
        isogeny: 0,
        sendType: sendType
    });
})


export default router
