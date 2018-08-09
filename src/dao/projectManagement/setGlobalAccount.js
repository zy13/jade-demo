/*
* @Author: zyuan
* @Date:   2016-12-19 10:57:04
* @Last Modified by:   zyuan
* @Last Modified time: 2016-12-19 12:44:55
*/

'use strict';

import ajaxHelper from '../../util/ajaxHelper';

const SetGlobalAccountDao = {

    //保存帐号设定信息
    saveSettedAccount(opts) {
        return ajaxHelper.post({
            url: `/osexamer/examer/saveGlobalAll`,
            data: {
                accessToken: opts.accessToken ||'',
                requiredKey: opts.requiredKey || '',
                showKey: opts.showKey || '',
                uniqueKey: opts.uniqueKey ||''
            }
        })
    },

    //删除全局可选字段信息
    deleteGlobalSelectedInfo(opts){
       /* return ajaxHelper.post({
            url: `/osexamer/examer/del`,
            data: {
                accessToken: opts.accessToken ||'',
                fieldKey: opts.fieldKey || ''
            }
        })*/

        return ajaxHelper.delete({
            url: `/osexamer/examer/del?accessToken=${opts.accessToken}&fieldKey=${opts.fieldKey}`,
            data: {
                accessToken: opts.accessToken ||'',
                fieldKey: opts.fieldKey || ''
            }
        })
    },

    //添加可选信息
    addSelectedInfo(opts){
        return ajaxHelper.post({
            url: `/osexamer/examer/add`,
            data: {
                accessToken: opts.accessToken ||'',
                fieldName: opts.fieldName || '',
                selectValue: opts.selectValue || '',
                type: opts.type || ''
            }
        })
    }
}

export default SetGlobalAccountDao
