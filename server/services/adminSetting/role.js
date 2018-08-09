/*
* @Author: zyuan
* @Date:   2016-12-05 18:51:36
* @Last Modified by:   zyuan
* @Last Modified time: 2016-12-05 19:08:40
*/

'use strict';

import roleDao from "../../dao/administratorSetting/role";

import CommonResult from "../../util/commonResult";

const cr = new CommonResult();

const roleServices = {

    async getRoleQuery(query = {}, accessToken = '', companyId = '') {
        if (!query || !accessToken || !companyId) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken : accessToken,
                limit: query.pagesize || 10,
                key: query.key || '',
                sreachType: query.sreachType || '',
                pageIndex: query.p || 1,
                status: query.status || '',
            }
        }

        const r = await roleDao.getRoleQuery(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            opts.permission = r.permission
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    }
}

export default roleServices
