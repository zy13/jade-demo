/*
* @Author: zyuan
* @Date:   2017-01-12 17:53:35
* @Last Modified by:   zyuan
* @Last Modified time: 2017-03-03 17:28:01
*/

'use strict';

import exerciseDao from "../../dao/examManagement/exercise";

import CommonResult from "../../util/commonResult";

const cr = new CommonResult();

const exerciseServices = {
    async getExerciseDetail(query = {}, accessToken = '') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                taskId: query.taskId,
                paperId: query.paperId,
                seqNo: query.seqNo || '1',
                accessToken,
                clientRequestStartTime: query.clientRequestStartTime,
                type: 0
            }
        }

        const r = await exerciseDao.getExerciseDetail(opts);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }else{
            return cr.errorData(opts, r.message)
        }

        return cr.errorData(opts, '数据查询失败，请稍后重试');
    },


    //pc端拿题
    async getExerciseDetailPC(query = {}, accessToken = '') {
        if (!query || !accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                taskId: query.taskId,
                paperId: query.paperId,
                pageNo: query.pageNo || '1',
                accessToken,
                clientRequestStartTime: query.clientRequestStartTime,
            }
        }
        const r = await exerciseDao.getExerciseDetailPC(opts);

        if(r){
            if (r.code==0) {
                opts.response = r.response
                return cr.successData(opts)
            }else if(r.code == 27002007){
                return cr.errorData(opts, '您已交卷' ,27002007)
            }else{
                return cr.errorData(opts, r.message)
            }
        }


        return cr.errorData(opts, '数据查询失败，请稍后重试');
    }
}

export default exerciseServices
