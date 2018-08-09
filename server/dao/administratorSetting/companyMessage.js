/*
* @Author: sihui.cao
* @Date:   2016-12-06 15:54:29
* @Last Modified by:   sihui.cao
* @Last Modified time: 2016-12-06 16:52:54
*/

'use strict';
import http from '../../util/http';


const companyMessageDao = {

    /**
    accessToken     string
    companyId       公司编号    number
    **/
    async GetCompanyMessage(data) {

        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

       // return http.get('/osadmin/company/'+data.companyId, data.param)
       return http.get('/osadmin/company', data.param)
    }
}

export default companyMessageDao
