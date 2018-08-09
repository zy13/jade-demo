/*
 * @Author: zyuan
 * @Date:   2016-12-05 17:39:37
 * @Last Modified by:   zyuan
 * @Last Modified time: 2016-12-06 09:27:40
 */

'use strict';

import groupDao from "../../dao/administratorSetting/group";

import CommonResult from "../../util/commonResult";

const cr = new CommonResult();

const groupServices = {

    async getGroupQuery(query = {}, accessToken = '', companyId = '') {
        if (!query || !accessToken || !companyId) {
            return cr.errorData('参数错误');
        }
        const opts = {
                accessToken,
                limit: query.limit || 10,
                pageIndex: query.pageIndex || 1,
            companyId
        }

        const r = await groupDao.getGroupQuery(opts);
        console.log(r)
/*        r.response = [{
            "hasSon": true,
            "id": 1,
            "memberNum": 0,
            "name": "xx集团",
            "orgCode": "1_"
        }, {
            "hasSon": false,
            "id": 2,
            "memberNum": 2,
            "name": "分部1",
            "orgCode": "1_2_"
        }, {
            "hasSon": true,
            "id": 3,
            "memberNum": 3,
            "name": "分部2",
            "orgCode": "1_3_"
        }, {
            "hasSon": false,
            "id": 4,
            "memberNum": 4,
            "name": "部门2",
            "orgCode": "1_3_4_"
        }];*/

        if (r && r.code == 0) {
            opts.response = r.response
            opts.permission = r.permission
            return cr.successData(opts)
        }
        return cr.errorData(opts, '数据查询失败，请稍后重试');
    }
}

export default groupServices
