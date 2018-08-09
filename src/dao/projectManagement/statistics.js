/*
* @Author: zyuan
* @Date:   2017-01-04 17:34:52
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-18T11:54:16+08:00
*/

'use strict';

import ajaxHelper from '../../util/ajaxHelper';

const StaticDao = {


    //导出消费记录
    exportConsume(accessToken) {
        ajaxHelper.download(`/osconsumption/consumecenter/exportConsume`,'get',`<input type='hidden' name='accessToken' value='${accessToken}'>`);
    },

    //导出充值记录
    exportPays(accessToken) {
        ajaxHelper.download(`/osconsumption/consumecenter/exportPays`,'get',`<input type='hidden' name='accessToken' value='${accessToken}'>`);
    }
}

export default StaticDao
