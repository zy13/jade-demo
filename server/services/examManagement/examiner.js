/*
 * @Author: zyuan
 * @Date:   2016-12-27 18:43:01
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-04-28 15:27:57
 */

'use strict';

import examinerDao from "../../dao/examManagement/examiner";
import CommonResult from "../../util/commonResult";

const cr = new CommonResult();
const examinerServices = {

    //评卷人任务列表查询
    async getTaskList(query = {}, accessToken = '') {
        if (!query || !accessToken) {

            return cr.errorData('参数错误');
        }

        let opts = {
            param: {
                accessToken,
                limit: query.pagesize || query.limit || 10,
                pageIndex: query.pageIndex || query.p || 1
            }
        }
        const r = await examinerDao.getTaskList(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },

    //试卷评卷详情查询
    async getTaskDetailList(query = {}, accessToken = '') {
        if (!query || !accessToken) {

            return cr.errorData('参数错误');
        }

        let opts = {
            param: {
                accessToken,
                limit: query.pagesize || query.limit || 100,
                pageIndex: query.pageIndex || query.p || 1,
                taskId: query.taskId
            }
        }
        const r = await examinerDao.getTaskDetailList(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },

    //按考生评卷
    async getExamerMarkList(query = {}, accessToken = '') {
        if (!query || !accessToken) {

            return cr.errorData('参数错误');
        }

        let opts = {
            param: {
                accessToken,
                buttonType: query.buttonType,
                number: query.number,
                paperId: query.paperId,
                showType: query.showType,
                taskId: query.taskId,
                userId: query.userId
            }
        }
        const r = await examinerDao.getExamerMarkList(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },

    //按试题评卷
    async getPaperMarkList(query = {}, accessToken = '') {
        if (!query || !accessToken) {

            return cr.errorData('参数错误');
        }

        let opts = {
            param: {
                accessToken,
                buttonType: query.buttonType,
                number: query.number,
                paperId: query.paperId,
                showType: query.showType,
                taskId: query.taskId,
                pageIndex: query.pageIndex || 1,
                limit: query.pagelimit || 50
            }
        }
        const r = await examinerDao.getPaperMarkList(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },

    //考生任务列表
    async getUserTaskList(id = '', accessToken = '') {
        if (!id) {
            return cr.errorData('参数错误');
        }

        let opts = {
            param: {
                id,
                accessToken
            }
        }

        const r = await examinerDao.getUserTaskList(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    }
}

export default examinerServices
