/**
 * @Author: Jet.Chan
 * @Date:   2016-12-06T10:31:18+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-15T11:24:03+08:00
 */



import ah from '../../util/ajaxHelper';
import cui from 'c-ui'
import moment from 'moment';

const session = {
    customer() {
        return new Promise((r, rj) => {
            if (window.customer) {
                if (window.customer.ExpiresTime && moment(window.customer.ExpiresTime) < moment()) {
                    cui.popTips.error('登录超时，请重新登录', 2000);
                    setTimeout(() => {
                        window.top.location.href = '/customer/login'
                    }, 2000)
                    return r({});
                }
                return r(window.customer);
            }
            $.ajax({
                url: '/customer/session/getContext',
                type: 'get',
                dataType: 'json',
                cache: false,
                success(res) {
                    if (res.code == 999) {
                        window.top.location.href = '/customer/user/logout'
                        return;
                    }
                    window.customer = res.data;
                    r(window.customer)
                },
                error(error) {
                    rj(error)
                }
            })
        });
    },
    user() {
        return new Promise((r, rj) => {
            if (window.customer) {
                return r(window.customer);
            }
            $.ajax({
                url: '/exam/session/getContext',
                type: 'get',
                dataType: 'json',
                cache: false,
                success(res) {
                    if (res.code == 999) {
                        cui.popTips.error('登录超时');
                        setTimeout(() => {
                            window.location.href = '/exam/login'
                        }, 500)
                        return;
                    }
                    window.customer = res.data;
                    r(window.customer)
                },
                error(error) {
                    rj(error)
                }
            })
        });
    }
}

export default session
