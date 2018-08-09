/*
* @Author: sihui.cao
* @Date:   2016-12-05 18:40:00
* @Last Modified by:   sihui.cao
* @Last Modified time: 2016-12-06 16:11:43
*/



import templateDao from "../../dao/projectManagement/template";

import CommonResult from "../../util/commonResult";

const cr = new CommonResult();

const templateServices = {
    async getEmailTemplateList(query = {}, accessToken = '', companyId = '') {
        if (!query || !accessToken || !companyId) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                companyId,
                creator:query.creator || '',
                limit:query.pagesize || 10,
                pageIndex:query.p || 1,
                sortFields:query.sortFields || ''
            }
        }
        const r = await templateDao.GetEailTemplates(opts);
        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    },


    async getMesTemplateList(query = {}, accessToken = '', companyId = '') {
        if (!query || !accessToken || !companyId) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                companyId,
                creator:query.creator || '',
                limit:query.pagesize || 10,
                pageIndex:query.p || 1,
                sortFields:query.sortFields || ''
            }
        }

        const r = await templateDao.GetSmsTemplates(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    }
}

export default templateServices
