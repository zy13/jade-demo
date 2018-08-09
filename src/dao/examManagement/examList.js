/*
 * @Author: sihui.cao
 * @Date:   2016-12-16 13:35:17
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-18T11:52:35+08:00
 */

'use strict';

import ajaxHelper from '../../util/ajaxHelper';

const ExamListDao = {

    //创建-卷首-题目
    createQuestion(opts) {
        return ajaxHelper.post({
            url: `/ospaper/question/stem/${opts.paperUnicode}`,
            data: {
                accessToken: opts.accessToken,
                jsonStr: opts.jsonStr,
                subject: opts.subject
            }
        })
    },

    //修改-卷首-结束语-题目
    editQuestion(opts) {
        return ajaxHelper.put({
            url: `/ospaper/question/stem/${opts.paperUnicode}`,
            data: {
                accessToken: opts.accessToken,
                flush: opts.flush,
                jsonStr: opts.jsonStr,
                subject: opts.subject,
                unicode: opts.unicode
            }
        })
    },

    //完成-第一步-第三步-第四步
    setQuestionFlush(opts) {
        return ajaxHelper.post({
            url: `/ospaper/question/flush/${opts.paperUnicode}/${opts.stepNo}`,
            data: {
                accessToken: opts.accessToken,
                jsonStr: opts.jsonStr
            }
        })
    },

    copyPaper(opts) {
        return ajaxHelper.post({
            url: `/ospaper/question/paper/copy/${opts.paperId}`,
            data: {
                accessToken: opts.accessToken,
                paperUnicode: opts.paperUnicode,
                newName: opts.newName || '',

            }
        })
    },

    exportPaper(opts) {
        ajaxHelper.download(`/ospaper/question/paper/export/${opts.paperId}`, 'get', `<input type='hidden' name='accessToken' value='${opts.accessToken}'>`);
    },

    deletePaper(opts) {
        return ajaxHelper.post({
            url: `/ospaper/question/paper/del/${opts.paperId}`,
            data: {
                accessToken: opts.accessToken,
            }
        })
    },

    changeStatus(opts) {
        return ajaxHelper.put({
            url: `/ospaper/question/paper/status/${opts.paperId}`,
            data: {
                accessToken: opts.accessToken,
                status: opts.status
            }
        })
    },

    //试卷分数-第三步-下一步
    savePaperScore(paperUnicode, accessToken, jsonStr) {
        return ajaxHelper.post({
            url: `/ospaper/question/scores/${paperUnicode}`,
            data: {
                accessToken,
                jsonStr
            }
        })
    },

    //删除结束语
    deleteRemark(paperUnicode, accessToken) {
        return ajaxHelper.delete({
            url: `/ospaper/question/item/remark/${paperUnicode}?accessToken=${accessToken}`
        })
    },

    //检测试卷导出状态
    checkExportPaperStatus(paperUnicode, accessToken) {
        return ajaxHelper.get({
            url: `/ospaper/question/paper/mode/${paperUnicode}?accessToken=${accessToken}`
        });
    },


    //判断试卷名是否重复
    checkPaperNameUnique(opts){
        return ajaxHelper.post({
            url: `/ospaper/question/paper/checkName/${opts.paperId}`,
            data:{
                accessToken:opts.accessToken,
                newName:opts.newName
            }
        });
    }
}

export default ExamListDao
