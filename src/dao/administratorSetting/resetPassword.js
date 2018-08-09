/*
* @Author: sihui.cao
* @Date:   2016-12-07 10:41:28
* @Last Modified by:   sihui.cao
* @Last Modified time: 2016-12-07 19:27:36
*/

'use strict';
import aj from '../../util/ajaxHelper';

const ResetPasswordDao = {

    /**
     * 修改密码信息
     * @param  {accessToken}    用户token string
     * @param  {oldPassword}    旧密码 string
     * @param  {password}       新密码 string
     */
    resetPassword(accessToken,data){
        return aj.put({
            url: '/osadmin/company',
            data: {
                accessToken,
                oldPassword: data.oldPassword,
                password: data.password
            }
        })

    }


}

export default ResetPasswordDao
