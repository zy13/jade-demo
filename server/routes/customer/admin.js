/*
 * @Author: zyuan
 * @Date:   2016-11-28 10:53:38
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-06T11:17:57+08:00
 */

'use strict';

import 'babel-polyfill'
import Router from 'koa-router'

import q from '../../util/asyncHttp'
import http from '../../util/http'

// import daoGroup from '../../dao/administratorSetting/group'
// import daoRole from '../../dao/administratorSetting/role'
import customerAuth from '../authController/customerAuth'

import groupServices from '../../services/adminSetting/group'
import adminListServices from '../../services/adminSetting/adminList'
import roleServices from '../../services/adminSetting/role'
import companyMessageServices from '../../services/adminSetting/companyMessage'


const router = Router()

router.get('/admin/group', customerAuth, async(ctx, next) => {
    const queryList = await groupServices.getGroupQuery(ctx.request.query,
        ctx.session.customer.accessToken,
        ctx.session.customer.companyId);

    ctx.render('admin/group', Object.assign({
        pageTitle: '项目管理-分组管理',
    }, {
        param: queryList.data.param,
        queryList: queryList.data.response,
        // operatePermission: queryList.data.permission.operatePermissio || true
    }));
})

router.get('/admin/adminList', customerAuth, async(ctx, next) => {
    const r = await adminListServices.getAdminList(ctx.request.query,
        ctx.session.customer.accessToken);

    ctx.render('admin/adminList', {
        pageTitle: '项目管理-管理员列表',
        response: r.data.response
    })
})

router.get('/admin/role', customerAuth, async(ctx, next) => {
    const queryList = await roleServices.getRoleQuery(ctx.request.query,
        ctx.session.customer.accessToken,
        ctx.session.customer.companyId);

    ctx.render('admin/role', Object.assign({
        pageTitle: '项目管理-角色管理',
        param: queryList.data.param,
        queryList: queryList.data.response,
        // operatePermission: queryList.data.permission.operatePermissio || true
    }));
})


router.get('/admin/companyMessage', customerAuth, async(ctx, next) => {
    const r = await companyMessageServices.getCompanyMessage({},
        ctx.session.customer.accessToken,
        ctx.session.customer.companyId);

    ctx.render('admin/companyMessage', {
        pageTitle: '企业信息',
        response: r.data.response || {}
    })
})


router.get('/admin/resetPassword', customerAuth, async(ctx, next) => {

    ctx.render('admin/resetPassword', {
        pageTitle: '修改信息',
        //response: r.data.response || {}
    })
})

export default router
