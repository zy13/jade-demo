/*
* @Author: zyuan
* @Date:   2016-12-29 15:12:11
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-04-28 15:30:19
*/

'use strict';

import ajaxHelper from '../../util/ajaxHelper';

const ExaminerDao = {

    //保存试卷分数
    savePaperScore(opts){
        return ajaxHelper.post({
            url: `/osexamer/exam/score/save`,
            data: {
                accessToken: opts.accessToken,
                jsonStr:opts.jsonStr ||'',
                paperId:opts.paperId,
                taskId: opts.taskId,
                evaluate:opts.evaluate
            }
        })
    },

    //检查是否能保存打分
    checkPaperScore(opts){
        return ajaxHelper.post({
            url: `/osexamer/exam/score/check`,
            data: {
                accessToken: opts.accessToken,
                jsonStr:opts.jsonStr ||'',
                paperId:opts.paperId,
                taskId: opts.taskId,
                evaluate:opts.evaluate
            }
        })
    },

    //按试卷评分-局部刷新
    getListFromPaper(opts){
        return ajaxHelper.get({
            url:`/osexamer/evaluate/stem/markList`,
            data:{
                accessToken: opts.accessToken,
                buttonType: opts.buttonType,
                number: opts.number,
                paperId: opts.paperId,
                showType: opts.showType,
                taskId: opts.taskId,
                pageIndex: opts.pageIndex || 1,
                limit: opts.pagelimit || 50
            }
        })
    }

}

export default ExaminerDao
