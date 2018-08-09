/**
 * @Author: Jet.Chan
 * @Date:   2016-12-05T15:05:50+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-12-07T19:10:08+08:00
 */



import adminListDao from "../../dao/administratorSetting/adminList";

import CommonResult from "../../util/commonResult";

const cr = new CommonResult();

const adminListServices = {
    async getAdminList(query = {}, accessToken = '') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                groupId: query.groupId || '',
                key: query.key || '',
                limit: query.pagesize || 10,
                pageIndex: query.p || 1,
                roleId: query.roleId || '',
                searchType: query.searchType || '',
                status: query.status || ''
            }
        }

        const r = await adminListDao.getAdminList(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    }
}

export default adminListServices
