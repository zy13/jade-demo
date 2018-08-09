/*
* @Author: sihui.cao
* @Date:   2016-12-16 14:13:17
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-01-11 00:10:55
*/

'use strict';

import http from '../../util/http';

const examListDao = {

    //第一步
    async getPaperDetail(paperUnicode,accessToken) {

        if (!accessToken || !paperUnicode) {
            return new Promise().reject('err:param error');
        }

        return http.get(`/ospaper/question/paper/${paperUnicode}`,{
            accessToken
        })
    },

    //第二步
    async getQuesDetail(paperUnicode,accessToken) {

        if (!accessToken || !paperUnicode) {
            return new Promise().reject('err:param error');
        }

        return http.get(`/ospaper/question/stem/${paperUnicode}`,{
            accessToken
        })
    },


    //第三步
    async getScore(paperUnicode,accessToken) {

        if (!paperUnicode || !accessToken) {
            return new Promise().reject('err:param error');
        }

        return http.get(`/ospaper/question/scores/${paperUnicode}`,{
            accessToken
        })
    },

    //第四步
    async getRemark(paperUnicode,accessToken) {

        if (!accessToken || !paperUnicode) {
            return new Promise().reject('err:param error');
        }

        return http.get(`/ospaper/question/remark/${paperUnicode}`,{
            accessToken
        })
    },

    async getPaperQueryList(opts) {

        if (!opts || typeof opts !== 'object') {
            return new Promise().reject('err:param error');
        }


        return http.post('/ospaper/question/papers/',opts.param)
    },

    //预览
    async getPreviewQueryList(opts) {

        if (!opts || typeof opts !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get(`/ospaper/question/paper/preview/${opts.param.paperUnicode}`,opts.param)
    }

}

export default examListDao
