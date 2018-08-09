/*
 * @Author: zyuan
 * @Date:   2016-12-07 11:39:14
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-03T16:27:04+08:00
 */

'use strict';

import http from '../../util/http';

const projectListDao = {

    //根据数据权限获取自己可见的项目列表
    async getProjectList(data) {

        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get('/osproject/projects', data.param)
    },

    //项目编辑界面查询
    async getProjectDetail(projectId, accessToken) {
        if (!projectId || !accessToken) {
            return new Promise().reject('err:param error');
        }

        return http.get('/osproject/project/edit/' + projectId, {
            accessToken
        })
    },

    //获取通知日志数据
    async getNotifyRecords(opts) {
        if (!(opts instanceof Object)) {
            return Promise.reject('param "opts" error');
        }
        console.log(opts)
        return http.post('/osproject/notifyRecords', opts.param)
    },

    //项目产品信息下拉框
    async getProSelect(opts) {
        if (!(opts instanceof Object)) {
            return Promise.reject('param "opts" error');
        }

        return http.get('/osproject/notifyRecord/select', opts.param)
    },

    //导出日志
    async exportNotifyRecord(opts) {
        if (!(opts instanceof Object)) {
            return Promise.reject('param "opts" error');
        }

        return http.get(`/osproject/notifyRecord/export/${sendType}`, opts.param)
    },

    //任务查询
    async getTaskList(projectId) {
        if (!projectId) {
            return Promise.reject('param projectId error');
        }
        return http.get('/osproject/osproject/project/tasks/' + projectId)
    },

    async getAccount(companyId, accessToken) {
        return http.get("/osconsumption/consumecenter/qureyAccount/" + companyId, {
            accessToken
        })
    },

    async getPapers(projectId, accessToken) {
        return http.get('/osproject/project/tasks/papers/' + projectId, {
            accessToken
        })
    }
}

export default projectListDao
