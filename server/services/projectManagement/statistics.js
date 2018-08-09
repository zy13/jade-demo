/*
* @Author: zyuan
* @Date:   2017-01-04 16:32:53
* @Last Modified by:   zyuan
* @Last Modified time: 2017-01-05 10:16:43
*/

'use strict';

import CommonResult from "../../util/commonResult";
import statisticsDao from "../../dao/projectManagement/statistics";

const cr = new CommonResult();

const statisticsService = {

    //查询充值记录列表
    async getPayQuery(query={}, accessToken = '',account= '') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                account:query.key||account,
                accessToken,
                limit: query.pagesize || 10,
                pageIndex: query.p || 1
            }
        }
        const r = await statisticsDao.getPayQuery(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    },

    //查询消费记录列表
    async getConsumesQuery(query={}, accessToken = '',account= '') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                account: query.key||account,
                limit: query.pagesize || 10,
                pageIndex: query.p || 1,
                projectId: query.projectId || 0,
                taskId: query.taskId || 0
            }
        }
        console.log(opts)

        const r = await statisticsDao.getConsumesQuery(opts);
        console.log(r)
        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    }
}

export default statisticsService
