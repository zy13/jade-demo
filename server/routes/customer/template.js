/*
 * @Author: sihui.cao
 * @Date:   2016-11-24 14:59:55
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-06T11:20:27+08:00
 */

import 'babel-polyfill'
import Router from 'koa-router'

import q from '../../util/asyncHttp'
import http from '../../util/http'
import templateServices from '../../services/projectManagement/template'
import customerAuth from '../authController/customerAuth'

const router = Router()

router.get('/template/email', customerAuth, async(ctx, next) => {
    const r = await templateServices.getEmailTemplateList(ctx.request.query,
        ctx.session.customer.accessToken,
        ctx.session.customer.companyId)

    // if(r.code!=0){
    //     console.log(r.message)
    //     return;
    // }

    ctx.render('template/email', {
        pageTitle: '项目管理-通知模板',
        totalCount: r && r.data && r.data.response && r.data.response.total ? r.data.response.total : 0, //总记录数
        response: r && r.data && r.data.response ? r.data.response : {}
    })
})

router.get('/template/message', customerAuth, async(ctx, next) => {
    const r = await templateServices.getMesTemplateList(ctx.request.query,
        ctx.session.customer.accessToken,
        ctx.session.customer.companyId)

    // if(r.code!=0){
    //     console.log(r.message)
    //     return;
    // }

    ctx.render('template/message', {
        pageTitle: '项目管理-通知模板',
        totalCount: r && r.data && r.data.response && r.data.response.total ? r.data.response.total : 0, //总记录数
        response: r && r.data && r.data.response ? r.data.response : {}
    })
})


export default router
