/*
* @Author: zyuan
* @Date:   2017-01-12 17:48:47
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-02-13 16:43:49
*/

'use strict';

import http from '../../util/http';

const exerciseDao = {

    async getExerciseDetail(opts) {

        if (!opts ) {
            return new Promise().reject('err:param error');
        }

        return http.get(`/osexamer/exercise/item/${opts.param.taskId}/${opts.param.paperId}/${opts.param.seqNo}`,opts.param)
    },
    async getExerciseDetailPC(opts) {

        if (!opts ) {
            return new Promise().reject('err:param error');
        }

        return http.get(`/osexamer/exercise/itemForPC/${opts.param.taskId}/${opts.param.paperId}/${opts.param.pageNo}`,opts.param)
    }
}

export default exerciseDao
