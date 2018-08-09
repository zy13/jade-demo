/*
 * @Author: zyuan
 * @Date:   2016-12-05 14:59:13
 * @Last Modified by:   zyuan
 * @Last Modified time: 2016-12-05 15:05:15
 */

'use strict';

import ajaxHelper from '../../util/ajaxHelper';
import q from 'q';


const GroupDao = {

    deleteGroup(opts) {
        let dfd = q.defer();
        ajaxHelper.delete({
            url: '/osadmin/groups/delete?accessToken='+opts.accessToken+'&delIdsStr='+opts.delId,
            /*data: {
                //accessToken: opts.accessToken || 'aaa',
                accessToken: 'aaa',
                //delIdsStr: opts.delIdsStr || '42'
                delIdsStr: '42'
            }*/
        }).then((res) => {
            dfd.resolve(res);
        });
        return dfd.promise;
    },

    editGroupName(opts) {
        let dfd = q.defer();
        ajaxHelper.put({
            url: '/osadmin/group/name/' + opts.groupId,
            data: {
                accessToken: opts.accessToken || '',
                newName: opts.newName || ''
            }
        }).then((res) => {
            dfd.resolve(res);
        });
        return dfd.promise;
    },

    addGroup(opts) {
        let dfd = q.defer();
        ajaxHelper.post({
            url: '/osadmin/group',
            data: {
                accessToken: opts.accessToken || '',
                name: opts.name || '',
                parentId: opts.parentId || ''
            }
        }).then((res) => {
            dfd.resolve(res);
        });
        return dfd.promise;
    }

}

export default GroupDao
