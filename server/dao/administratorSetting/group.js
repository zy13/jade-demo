/*
 * @Author: zyuan
 * @Date:   2016-12-05 14:55:29
 * @Last Modified by:   zyuan
 * @Last Modified time: 2016-12-05 15:08:12
 */

'use strict';

import http from '../../util/http';

const GroupDao = {

    /**
     * 查询分组
     * @param  {accessToken} 用户token string
     * @return {companyId}   公司id   number
     */
    async getGroupQuery(data) {

        if (!data || typeof data !== 'object') {
            let dfd = new Promise()
            dfd.reject('err:param error');
            return dfd;
        }

        return http.get('/osadmin/groups/query', {
            accessToken: data.accessToken || '',
            companyId: data.companyId || 1
        })
    }

}

export default GroupDao
