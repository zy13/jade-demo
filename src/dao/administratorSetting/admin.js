/*
 * @Author: zyuan
 * @Date:   2016-12-02 16:35:15
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-18T11:52:29+08:00
 */

'use strict';

import ajaxHelper from '../../util/ajaxHelper';
import q from 'q';

const adminDao = {
    createAdmin(formData) {
        return ajaxHelper.post({
            url: '/osadmin/admin',
            data: formData
        });
    },
    editAdmin(formData) {
        return ajaxHelper.put({
            url: `/osadmin/admin`,
            data: formData
        })
    },
    deleteAdmin(accessToken, id) {
        return ajaxHelper.delete({
            url: `/osadmin/admin?id=${id}&accessToken=${accessToken}`,
        })
    },
    setStatus(accessToken, ids, status) {
        return ajaxHelper.put({
            url: `/osadmin/admin/status`,
            data: {
                accessToken,
                ids,
                status
            }
        })
    },
    resetPwd(formData) {
        return ajaxHelper.put({
            url: `/osadmin/admin/password`,
            data: formData
        })
    },
    exportAdmins(accessToken, adminId) {
      /*  alert(accessToken);
        return ajaxHelper.get({
            url: `/osadmin/admin/export?accessToken=${accessToken}`
        })*/
        return ajaxHelper.download(`/osadmin/admin/export`,'get',`<input type='hidden' name='accessToken' value='${accessToken}'>`);
    },
    getDetail(accessToken, companyId, adminId) {
        return ajaxHelper.get({
            url: `/osadmin/admin/edit/${adminId}`,
            data: {
                accessToken,
                companyId
            }
        })
    },
    getOptionsList(accessToken) {
        return ajaxHelper.get({
            url: `/osadmin/roleAndGroup?accessToken=${accessToken}`
        })
    },
    getSubAdmin(accessToken){
        return ajaxHelper.get({
            url:`/osadmin/subordinate`,
            data:{
                accessToken
            }
        })
    },
    getExaminerList(accessToken){
        return ajaxHelper.get({
            url:'/osadmin/examiners',
            data:{
                accessToken
            }
        })
    }
}

export default adminDao
