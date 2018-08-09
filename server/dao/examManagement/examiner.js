/*
* @Author: zyuan
* @Date:   2016-12-27 17:12:28
* @Last Modified by:   zyuan
* @Last Modified time: 2017-01-16 10:17:39
*/

'use strict';

import http from '../../util/http';

const examinerDao = {

    async getTaskList(opts) {

        if (!opts || typeof opts !== 'object') {
            return new Promise().reject('err:param error');
        }
        return http.get(`/osexamer/evaluate/taskList`,opts.param)
    },

    async getTaskDetailList(opts) {

        if (!opts || typeof opts !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get(`/osexamer/evaluate/taskDetail/${opts.param.taskId}`,opts.param)
    },

    async getPaperMarkList(opts) {

        if (!opts || typeof opts !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get(`/osexamer/evaluate/stem/markList`,opts.param)
    },

    async getExamerMarkList(opts) {

        if (!opts || typeof opts !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get(`/osexamer/evaluate/examer/markList`,opts.param)
    },

    async getUserTaskList(opts) {
        if (!opts || typeof opts !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get(`/osexamer/exam/examer/${opts.param.id}`,opts.param)
    }

}

export default examinerDao
