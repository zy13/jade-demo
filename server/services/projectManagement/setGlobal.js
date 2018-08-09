/*
* @Author: zyuan
* @Date:   2016-12-19 11:06:42
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-11T13:57:46+08:00
*/

'use strict';

import CommonResult from "../../util/commonResult";
import setGlobaltDao from "../../dao/projectManagement/setGlobal";

const cr = new CommonResult();

const setGlobalAccountService = {

    //获取帐号管理列表
    async getExamineeInfo(accessToken = '') {
        if (!accessToken) {
            return cr.errorData('参数错误');
        }
        const opts = {
            param: {
                accessToken
            }
        }
        const r = await setGlobaltDao.setGlobalAccount(accessToken);

        if (r && r.code == 0) {
            opts.response = r.response
            return cr.successData(opts)
        }
        return cr.errorData(opts,'数据查询失败，请稍后重试');
    }
}

export default setGlobalAccountService
