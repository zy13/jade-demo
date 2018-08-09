/*
* @Author: zyuan
* @Date:   2016-12-15 11:48:25
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-01-18 10:16:05
*/

'use strict';

import http from '../../util/http';

const examineeInfoDao = {

    async getExamineeInfo(data) {

        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get('/osexamer/examers/project',data.param)
    },

    async getImportLog(data) {

        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get('/osexamer/examer/importLog/query',data.param)
    },

    async getAccountInfo(data) {

        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get('/osexamer/examer/project/fields',data.param)
    },

    async getEditAccountInfo(data) {

        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get('/osexamer/examer/project/getAllTaskField/'+data.param.userId,data.param)
    },

    async getDataManagement(data) {
        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.get('/osproject/project/task/findTaskExAndDataManagement',data.param)
    }




}

export default examineeInfoDao
