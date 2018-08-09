/*
 * @Author: sihui.cao
 * @Date:   2016-12-01 18:29:17
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2016-12-06 16:12:40
 */

'use strict';
import http from '../../util/http';


const templateDao = {

    /**
    accessToken     string
    companyId       公司编号    number
    creator         创建人 string
    limit           每页记录数   number
    pageIndex       页码  number
    sortFields      排序字段    string
    **/
    async GetEailTemplates(data) {

        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.post('/osproject/mailTemplates',data.param)
    },

    /**
    accessToken     string
    companyId       公司编号    number
    creator         创建人 string
    limit           每页记录数   number
    pageIndex       页码  number
    sortFields      排序字段    string
    **/
    async GetSmsTemplates(data) {

        if (!data || typeof data !== 'object') {
            return new Promise().reject('err:param error');
        }

        return http.post('/osproject/smsTemplates', data.param)
    }
}

export default templateDao
