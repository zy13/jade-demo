/*
 * @Author: zyuan
 * @Date:   2016-12-07 11:38:30
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-03T16:29:15+08:00
 */

'use strict';

import ajaxHelper from '../../util/ajaxHelper';

const ProjectListDao = {

    //删除任务
    deleteTask(opts) {
        return ajaxHelper.delete({
            url: `/osproject/task/${opts.taskId}?accessToken=${opts.accessToken}`,
            data: {
                accessToken: opts.accessToken
            }
        })
    },

    //删除项目
    deleteProject(opts) {
        return ajaxHelper.delete({
            url: `/osproject/project/${opts.projectId}?accessToken=${opts.accessToken}`,
            data: {
                accessToken: opts.accessToken
            }
        })
    },

    //修改项目状态
    handleProjectStatus(opts) {
        return ajaxHelper.put({
            url: `/osproject/project/status/${opts.projectId}`,
            data: {
                accessToken: opts.accessToken,
                newStatus: opts.newStatus
            }
        });
    },

    //下载二维码
    downloadScan(accessToken,projectId){
        return ajaxHelper.download(`/osproject/project/exportImage/${projectId}`,"get",`<input type="text" name='accessToken' value='${accessToken}' />`);
    },

    //新建项目
    createProject(data, accessToken) {
        return ajaxHelper.post({
            url: '/osproject/project',
            data: {
                accessToken,
                accountsStr: data.accountsStr || '',
                description: data.description || '',
                endDateStr: data.endDate || '',
                name: data.name || '',
                scanEnable: data.scanEnable,
                scanEndDateStr: data.scanEndDate || '',
                scanMax: data.scanMax || '',
                scanStartDateStr: data.scanStartDate || '',
                startDateStr: data.startDate
            }
        })
    },

    //修改项目
    editProject(data, accessToken, projectId) {
        return ajaxHelper.put({
            url: '/osproject/project/' + projectId,
            data: {
                accessToken,
                accountsStr: data.accountsStr || '',
                description: data.description || '',
                endDateStr: data.endDate || '',
                name: data.name || '',
                scanEnable: data.scanEnable,
                scanEndDateStr: data.scanEndDate || '',
                scanMax: data.scanMax || '',
                scanStartDateStr: data.scanStartDate || '',
                startDateStr: data.startDate
            }
        })
    },


    //修改任务状态
    handleTaskStatus(opts) {
        return ajaxHelper.put({
            url: `/osproject/task/status/${opts.taskId}`,
            data: {
                accessToken: opts.accessToken,
                newStatus: opts.newStatus
            }
        })
    },

    //导出-通知日志
    handleExport(opts) {
        ajaxHelper.download(`/osproject/notifyRecord/export/${opts.sendType}`,'get',`<input type='hidden' name='accessToken' value='${opts.accessToken}'>`);
    },

    //获取已选试卷
    getSelectedPaperList(projectId, accessToken){
        return ajaxHelper.get({
            url: `/osproject/project/tasks/${projectId}?accessToken=${accessToken}`
        })
    },

    handleReSendEmail(opts) {
        return ajaxHelper.post({
            url: `/osproject/notify/reSend/email`,
            data: {
                accessToken: opts.accessToken,
                ids: opts.ids,
                key: opts.key,
                projectId: opts.projectId,
                roleId: opts.roleId,
                searchType: opts.searchType,
                sendDateBegin: opts.sendDateBegin,
                sendDateEnd: opts.sendDateEnd,
                sendStatus: opts.sendStatus,
                taskId: opts.taskId
            }
        })
    },
    handleReSendSms(opts) {
        return ajaxHelper.post({
            url: `/osproject/notify/reSend/sms`,
            data: {
                accessToken: opts.accessToken,
                ids: opts.ids,
                key: opts.key,
                projectId: opts.projectId,
                roleId: opts.roleId,
                searchType: opts.searchType,
                sendDateBegin: opts.sendDateBegin,
                sendDateEnd: opts.sendDateEnd,
                sendStatus: opts.sendStatus,
                taskId: opts.taskId
            }
        })
    },

    getSendFailNum(opts){
        return ajaxHelper.post({
            url: `/osproject/notifyRecord/getFailCount`,
            data: {
                accessToken:opts.accessToken,
                companyId: opts.companyId ||'',
                key: opts.key || '',
                limit: opts.pagesize || 10,
                pageIndex: opts.p || 1,
                projectId: opts.projectId || '',
                roleId: opts.roleId || '',
                searchType: opts.searchType || '',
                sendDateBegin: opts.sendDateBegin || '',
                sendDateEnd: opts.sendDateEnd || '',
                sendStatus: opts.sendStatus || '',
                sendType: opts.sendType || '0',
                sortFields: opts.sortFields || '',
                taskId: opts.taskId || '',
            }
        })
    },

    //创建/修改项目第二步
    saveSelectedPaperList(projectId,accessToken,jsonStr){
        return ajaxHelper.put({
            url:'/osproject/project/tasks/'+projectId,
            data:{
                accessToken,
                jsonStr
            }
        })
    },

    //复制项目
    copyProject(opts){
        return ajaxHelper.post({
            url: `/osproject/project/copy`,
            data: {
                accessToken: opts.accessToken,
                name: opts.name,
                sourceProjectId: opts.sourceProjectId
            }
        })
    },

    //查询项目未选用的管理员
    findRestAccounts(projectId=0, accessToken){
        return ajaxHelper.get({
            url: `/osproject/project/admins/rest`,
            data: {
                accessToken,
                projectId
            }
        })
    },

    //项目下查询试卷列表
    getPaperList(opts) {
        return ajaxHelper.get({
            url: `/osproject/project/tasks/papers/` + opts.projectId,
            data: {
                limit:opts.limit,
                pageIndex: opts.pageIndex,
                accessToken: opts.accessToken
            }
        })
    },

    //更新试卷版本引用
    updatePaperReference(taskId, accessToken) {
        return ajaxHelper.put({
            url: '/osproject/project/task/paper/' + taskId,
            data: {
                accessToken
            }
        })
    }

}

export default ProjectListDao
