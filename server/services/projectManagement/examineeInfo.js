/*
 * @Author: zyuan
 * @Date:   2016-12-15 11:46:27
 * @Last Modified by:   zyuan
 * @Last Modified time: 2017-02-15 17:29:16
 */

'use strict';

import CommonResult from "../../util/commonResult";
import examineeInfoDao from "../../dao/projectManagement/examineeInfo";

const cr = new CommonResult();

const examineeInfoService = {

    //获取帐号管理列表
    async getExamineeInfo(query = {}, accessToken = '') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                cmctStatus: query.cmctStatus || '',
                cmctWay: query.cmctWay || '',
                key1Begin: query.key1Begin || '',
                key1End: query.key1End || '',
                key2: query.key2 || '',
                limit: query.pagesize || 10,
                pageIndex: query.p || 1,
                projectId: query.projectId || '',
                roleId: query.roleId || '',
                searchType1: query.searchType1 || '',
                searchType2: query.searchType2 || '',
                status: query.status || '',
                taskId: query.taskId || ''
            }
        }
        const r = await examineeInfoDao.getExamineeInfo(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },

    //查询导入日志
    async getImportLog(query = {}, accessToken = '') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                limit: query.pagesize || 10,
                pageIndex: query.p || 1,
                projectId: query.projectId || 0,
                taskId : query.taskId || 0
            }
        }
        const r = await examineeInfoDao.getImportLog(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },

    //获取帐号信息
    async getAccountInfo(query = {}, accessToken = '') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                projectId: query.projectId || 0,
                taskId: query.taskId || 0
            }
        }
        const r = await examineeInfoDao.getAccountInfo(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },

    //获取修改帐号信息
    async getEditAccountInfo(query = {}, accessToken = '',userId='') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                projectId: query.projectId || '',
                taskId: query.taskId || '',
                userId,
            }
        }
        const r = await examineeInfoDao.getEditAccountInfo(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },
    /**
        accessToken     string  @mock=
        pageReq     object
            limit   页大小 number  @mock=10
            pageIndex   当前页 number  @mock=1
            sortFields  排序字符串   string  toal_score asc, end_time asc@mock=11
            start       number  @mock=0
        request     object
            projectId   项目id    number  @mock=0
            taskId  任务id
    **/
    //数据管理
    async getDataManagement( accessToken = '',query = {}) {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken,
                limit: query.pagesize || 10,
                pageIndex: query.p || 1,
                sortFields: query.sortFields || 'end_time asc',
                start: query.start || 0,
                projectId: query.projectId || '',
                taskId: query.taskId || ''
            }
        }
        const r = await examineeInfoDao.getDataManagement(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    }
}

export default examineeInfoService
