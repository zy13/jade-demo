/**
 * @Author: Jet.Chan
 * @Date:   2016-12-05T14:55:57+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-12-07T19:09:50+08:00
 */



import http from "../../util/http"

const adminListDao = {
    // 获取管理员列表
    async getAdminList(opts) {

        if (!(opts instanceof Object)) {
            return Promise.reject('param "opts" error');
        }

        return http.get(`/osadmin/admins`, opts.param)
    }
}

export default adminListDao
