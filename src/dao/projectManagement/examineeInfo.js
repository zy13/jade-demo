/*
 * @Author: zyuan
 * @Date:   2016-12-16 10:44:49
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-18T11:53:26+08:00
 */

'use strict';

import ajaxHelper from '../../util/ajaxHelper';
import ajaxFileUpload from '../../components/ajaxFileUpload/index'
const ExamineeInfoDao = {
    //判断账号是否存在
    repeatAccount(opts){
        return ajaxHelper.get({
            url: `/osexamer/examer/project/userAccount`,
            data: {
                accessToken: opts.accessToken || '',
                projectId: opts.projectId || '',
                account: opts.account || '',
                taskId: opts.taskId || ''
            }
        })
    },
    //修改帐号
    editAccount(opts) {
        return ajaxHelper.get({
            url: `/osexamer/examer/project/modifyField`,
            data: {
                accessToken: opts.accessToken || '',
                projectId: opts.projectId || '',
                taskId: opts.taskId || '',
                userId: opts.userId || ''
            }
        })
    },

    //保存帐号设定信息
    saveSettedAccount(opts) {
        return ajaxHelper.post({
            url: `/osexamer/examer/project/saveAll`,
            data: {
                accessToken: opts.accessToken || '',
                projectId: opts.projectId || '',
                requiredKey: opts.requiredKey || '',
                showKey: opts.showKey || '',
                taskId: opts.taskId || '',
                uniqueKey: opts.uniqueKey || ''
            }
        })
    },

    //删除
    deleteAccount(opts) {
        /**
        return ajaxHelper.delete({
            url: `/osexamer/examer/project/del`,
            data: {
                accessToken: opts.accessToken ||'',
                cmctStatus: opts.cmctStatus ||'',
                cmctWay: opts.cmctWay ||'',
                ids: opts.ids ||'',
                key1Begin: opts.key1Begin ||'',
                key1End: opts.key1End ||'',
                key2: opts.key2 ||'',
                projectId: opts.projectId ||'',
                searchType1: opts.searchType1 || '',
                searchType2: opts.searchType2 || '',
                status: opts.status || '',
                taskId: opts.taskId ||''
            }
        })**/
        return ajaxHelper.post({
            url: `/osexamer/examer/project/del`,
            data: {
                accessToken: opts.accessToken || '',
                cmctStatus: opts.cmctStatus || '',
                cmctWay: opts.cmctWay || '',
                ids: opts.ids || '',
                key1Begin: opts.key1Begin || '',
                key1End: opts.key1End || '',
                key2: opts.key2 || '',
                projectId: opts.projectId || '',
                searchType1: opts.searchType1 || '',
                searchType2: opts.searchType2 || '',
                status: opts.status || '',
                taskId: opts.taskId || ''
            }
        })
    },

    //重置密码
    reSetPassword(opts) {
        return ajaxHelper.post({
            url: `/osexamer/examer/project/reSetPassword`,
            data: {
                accessToken: opts.accessToken || '',
                cmctStatus: opts.cmctStatus || '',
                cmctWay: opts.cmctWay || '',
                ids: opts.ids || '',
                isRandom: opts.isRandom || '',
                key1: opts.key1 || '',
                key2: opts.key2 || '',
                newPassword: opts.newPassword || '',
                projectId: opts.projectId || '',
                searchType1: opts.searchType1 || '',
                searchType2: opts.searchType2 || '',
                status: opts.status || '',
                taskId: opts.taskId || ''
            }
        })
    },

    //导入全部帐号
    exportAllAccounts(opts) {
        let $html = `<input type='hidden' name='accessToken' value='${opts.accessToken}'>
                     <input type='hidden' name='cmctStatus' value='${opts.cmctStatus}'>
                     <input type='hidden' name='cmctWay' value='${opts.cmctWay}'>
                     <input type='hidden' name='key1Begin' value='${opts.key1Begin}'>
                     <input type='hidden' name='key1End' value='${opts.key1End}'>
                     <input type='hidden' name='key2' value='${opts.key2}'>
                     <input type='hidden' name='projectId' value='${opts.projectId}'>
                     <input type='hidden' name='searchType1' value='${opts.searchType1}'>
                     <input type='hidden' name='searchType2' value='${opts.searchType2}'>
                     <input type='hidden' name='status' value='${opts.status}'>
                     <input type='hidden' name='taskId' value='${opts.taskId}'>
                    `;
        return ajaxHelper.download(`/osexamer/examer/project/export/all`, 'get', $html)
    },

    //错误日志导出
    exportErrorLog(opts) {
        return ajaxHelper.download(`/osexamer/examer/failLog/export`, 'get', `<input type='hidden' name='accessToken' value='${opts.accessToken}'><input type='hidden' name='projectId' value='${opts.projectId}'><input type='hidden' name='taskId' value='${opts.taskId}'>`);
    },

    //创建单个帐号
    createOneAccount(opts) {
        return ajaxHelper.post({
            url: `/osexamer/examer`,
            data: {
                accessToken: opts.accessToken,
                jsonStr: opts.jsonStr,
                obj: opts.obj,
                projectId: opts.projectId,
                taskId: opts.taskId
            }
        })
    },

    //创建多个帐号
    createMutiAccount(opts) {
        return ajaxHelper.post({
            url: `/osexamer/examers`,
            data: {
                accessToken: opts.accessToken,
                accountPre: opts.accountPre,
                amount: opts.amount,
                endNum: opts.endNum,
                password: opts.password,
                projectId: opts.projectId,
                startNum: opts.startNum,
                taskId: opts.taskId
            }
        })
    },

    //导入模板下载
    importMDownload(opts) {
        return ajaxHelper.download(`/osexamer/examer/demo/download`, 'get', `<input type='hidden' name='accessToken' value='${opts.accessToken}'><input type='hidden' name='projectId' value='${opts.projectId}'><input type='hidden' name='taskId' value='${opts.taskId}'>`, "");
    },

    //导入考生帐号
    importAccount(url,fileId,opts) {
        return ajaxHelper.ajaxForMultipartFile(url,fileId,opts);
    },

    //获取创建帐号(单个)字段显示列表
    getNewField(opts) {
        return ajaxHelper.get({
            url: `/osexamer/examer/project/newField`,
            data: {
                accessToken: opts.accessToken,
                projectId: opts.projectId,
                taskId: opts.taskId
            }
        })
    },

    //编辑单个帐号-保存修改后的帐号
    editOneAccount(opts) {
        return ajaxHelper.put({
            url: `/osexamer/examer/${opts.userId}`,
            data: {
                accessToken: opts.accessToken,
                jsonStr: opts.jsonStr,
                obj: opts.obj,
                projectId: opts.projectId,
                taskId: opts.taskId
            }
        })
    },

    //修改考生资料（用于登录后完善个人信息）
    editUserInfo(opts) {
        return ajaxHelper.post({
            url: `/osexamer/examer/modifyUserForPerfect`,
            data: {
                accessToken: opts.accessToken,
                userId: opts.userId,
                jsonStr: opts.jsonStr
            }
        })
    },

    //考生修改密码
    resetUserPassword(opts) {
        return ajaxHelper.post({
            url: `/osexamer/examer/updateUserPassword`,
            data: {
                accessToken: opts.accessToken,
                newPassword: opts.newPassword,
                oldPassword: opts.oldPassword
            }
        })
    },

    //导出全部详细试卷
    exportDetailPaper(opts) {
        let $html = `<input type='hidden' name='accessToken' value='${opts.accessToken}'>
                     <input type='hidden' name='taskId' value='${opts.taskId}'>
                    `
        return ajaxHelper.download(`/osexamer/question/paper/download/${opts.taskId}`,'get',$html)

    },
    //生成全部详细试卷
    createdExportDetailPaper(opts) {
        return ajaxHelper.get({
            url: `/osexamer/question/paper/created/${opts.taskId}/${opts.paperId}?accessToken=${opts.accessToken}`
        })
    },

    //查询任务信息和考生信息
    getTaskandExamineeInfos(opts) {
        return ajaxHelper.get({
            url: `/osproject/project/task/findTaskExAndDataManagement`,
            data: {
                accessToken: opts.accessToken,
                limit: opts.limit,
                pageIndex: opts.pageIndex,
                projectId: opts.projectId,
                sortFields: opts.sortFields,
                start: opts.start,
                taskId: opts.taskId
            }
        })
    }
}

export default ExamineeInfoDao
