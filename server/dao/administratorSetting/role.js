/*
* @Author: zyuan
* @Date:   2016-12-05 14:55:36
* @Last Modified by:   sihui.cao
* @Last Modified time: 2016-12-06 15:55:39
*/

'use strict';

import http from '../../util/http';

const RoleDao = {

    /**
     * 管理界面查询角色
     * @param  {accessToken} 用户token string
     * @return {companyId}   公司id   number
     */
    async getRoleQuery(data){
        if (!data || typeof data !== 'object') {
            let dfd = new Promise()
            dfd.reject('err:param error');
            return dfd;
        }
        return http.get('/osadmin/roles/queryByPage',data.param)
    }

}

export default RoleDao
