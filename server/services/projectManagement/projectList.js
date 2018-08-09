/*
* @Author: zyuan
* @Date:   2016-12-06 10:35:45
* @Last Modified by:   zyuan
* @Last Modified time: 2016-12-12 20:05:30
*/

'use strict';

import CommonResult from "../../util/commonResult";
import projectListDao from "../../dao/projectManagement/projectList";
// import paperDao from "../../dao/projectManagement/paper";

const cr = new CommonResult();

const projectListServices = {
    async getProjectList(query = {}, accessToken = '') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                limit: query.pagesize || 10,
                pageIndex: query.p || 1,
                projectNameLike: query.projectNameLike || '',
                taskNameLike: query.taskNameLike || ''
            }
        }

        const r = await projectListDao.getProjectList(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            opts.permission = r.permission
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    },
    async getProjectDetail(projectId='',accessToken='') {
        if (!projectId || !accessToken) {
            return cr.errorData('参数错误');
        }
        let opts = {}

        const r = await projectListDao.getProjectDetail(projectId,accessToken);
        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    },
    async getPapers(projectId, accessToken='') {
        if (!projectId || !accessToken) {
            return cr.errorData('参数错误');
        }
        let opts = {
            param: {
                accessToken
            }
        }

        const r = await projectListDao.getPapers(projectId, accessToken);
        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    },
    async getNotifyRecords(query = {}, accessToken = '') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                companyId: query.companyId ||'',
                key: query.key || '',
                limit: query.pagesize || 10,
                pageIndex: query.p || 1,
                projectId: query.projectId || '',
                roleId: query.roleId || '',
                searchType: query.searchType || '',
                sendDateBegin: query.sendDateBegin || '',
                sendDateEnd: query.sendDateEnd || '',
                sendStatus: query.sendStatus || '',
                sendType: query.sendType || '0',
                sortFields: query.sortFields || '',
                taskId: query.taskId || '',
            }
        }
        const r = await projectListDao.getNotifyRecords(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    },
    async getProSelect(accessToken = '') {
        if (!accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken
            }
        }
        const r = await projectListDao.getProSelect(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    },

    async getTaskList(projectId = '') {
        if(!projectId) {
            return cr.errorData('参数错误')
        }
        const opts = {
            param:{
                projectId
            }
        }
        const r = await projectListDao.getTaskList(projectId)
        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    },

    async getAccount(companyId, accessToken){
        if (!companyId || !accessToken) {
            return cr.errorData('参数错误');
        }
        return projectListDao.getAccount(companyId, accessToken)
    }
}

export default projectListServices
