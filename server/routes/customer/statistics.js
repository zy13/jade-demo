/*
 * @Author: zyuan
 * @Date:   2017-01-04 15:11:22
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-06T11:20:08+08:00
 */

'use strict';

import Router from 'koa-router'
import statisticsService from '../../services/projectManagement/statistics'
import customerAuth from '../authController/customerAuth'

const router = Router()

router.get('/statistics/index', customerAuth, async(ctx, next) => {
    const getPayQuery = await statisticsService.getPayQuery(ctx.request.query,
        ctx.session.customer.accessToken);
    const getConsumesQuery = await statisticsService.getConsumesQuery(ctx.request.query,
        ctx.session.customer.accessToken);

    ctx.render('statistics/index', {
        pageTitle: '项目管理-使用统计',
        getPayQuery: getPayQuery.data.response,
        getConsumesQuery: getConsumesQuery.data.response,
        defaultaccount:''
    })
})

export default router
