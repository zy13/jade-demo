/**
 * @Author: Jet.Chan
 * @Date:   2017-02-22T21:16:10+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-08T16:45:33+08:00
 */
import cui from 'c-ui';


export default {
    validateOfflineCode(r, _data = {}) {
        if (r.code > 1000 && (r.code == 29000001 || r.code == 29000002)) {
            if (r.code == 29000001){
                cui.popTips.error(`您的帐号于${r.message}在其他设备登录，如果这不是您的操作，请及时修改您的登录密码。`, 5000);
                // 登录页有根据token自动登录的功能，不清空token的话会死循环（登录失效-登录页-首页-登录失效）
                $.ajax({
                    type: 'post',
                    url: window.location.href.match(/\/exam\/|\/examM\//) ? '/exam/session/logout' : '/customer/session/logout',
                    data: {
                        accessToken: _data.accessToken
                    }
                })
            } else if (r.code == 29000002) {

                if (window.location.href.indexOf('/exam/') > -1 || window.location.href.indexOf('/examM/') > -1)
                    window.top.location.href = '/exam/session/logout'
                else
                    window.top.location.href = '/customer/user/logout'
                return true;
            }
            setTimeout(() => {
                if (window.location.href.indexOf('/exam/') > -1 || window.location.href.indexOf('/examM/') > -1)
                    window.top.location.href = '/exam/login'
                else
                    window.top.location.href = '/customer/login'
            }, 5000)
            return true;
        }
        return false;
    }
}
