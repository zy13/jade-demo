/*
* @Author: zyuan
* @Date:   2017-01-04 16:29:19
* @Last Modified by:   zyuan
* @Last Modified time: 2017-01-05 10:25:11
*/

'use strict';

import http from '../../util/http';

const statisticsDao = {

    async getPayQuery(data){
        if (!data || typeof data !== 'object') {
            let dfd = new Promise()
            dfd.reject('err:param error');
            return dfd;
        }
        return http.post('/osconsumption/consumecenter/getPays',data.param)
    },

    async getConsumesQuery(data){
        if (!data || typeof data !== 'object') {
            let dfd = new Promise()
            dfd.reject('err:param error');
            return dfd;
        }
        return http.post('/osconsumption/consumecenter/getConsumes',data.param)
    }
}

export default statisticsDao
