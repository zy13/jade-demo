/*
 * @Author: zyuan
 * @Date:   2016-12-05 14:59:21
 * @Last Modified by:   zyuan
 * @Last Modified time: 2016-12-09 14:10:15
 */

'use strict';

import ajaxHelper from '../../util/ajaxHelper';
import q from 'q';

const RoleDao = {

    editRoleName(opts) {
        return ajaxHelper.put({
            url: `/osadmin/role/name/${opts.roleId}`,
            data: {
                accessToken: opts.accessToken || '',
                newName: opts.newName || ''
            }
        })
    },

    deleteRole(opts) {
        return ajaxHelper.delete({
            url: `/osadmin/roles/delete?accessToken=${opts.accessToken}&delIdsStr=${opts.delId}`,
        })
    },

    createRole(opts) {
        return ajaxHelper.post({
            url: `/osadmin/role`,
            data: {
                accessToken: opts.accessToken || '',
                name: opts.name || ''
            }
        })
    },

    setRolePermission(opts) {
        return ajaxHelper.put({
            url: `/osadmin/role/permissions/${opts.roleId}`,
            data: {
                accessToken: opts.accessToken || '',
                permissionIdsStr: opts.permissionIdsStr || ''
            }
        })
    },

    getPermissionOfRole(opts) {
        return ajaxHelper.get({
            url: `/osadmin/role/permissionOfRole/${opts.roleId}`,
            data: {
                accessToken: opts.accessToken || ''
            }
        })
    }


}

export default RoleDao
