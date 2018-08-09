/*
 * @Author: zyuan
 * @Date:   2016-12-21 18:59:07
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-09T11:56:58+08:00
 */

'use strict';

import $ from 'jquery'
import cui from 'c-ui'

import '../../components/share/hfCommon'
import './login.less'

class LoginDemo {
    constructor() {
        this.init();
    }
    init() {
        this.textBox = Array.from($('.cui-container .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));

        // if (navigator.userAgent.indexOf('MSIE 7.0') > 0 || navigator.userAgent.indexOf('MSIE 8.0') > 0) {
        //     $('.isIE').removeClass('dis');
        // }

        this.handleLogin();
    }
    handleLogin() {
        $('.login-wrap').on('click', '.login-content .cui-botton a', (e) => {
            let self = this;
            let validate = true;

            //validate
            self.textBox.map((i, v) => {
                if (i.$el.is('.validateCode')) {
                    if (this.isRequiredValidateCode){
                        $('.login-content .cui-textBoxContainer').find('input').focus().blur();
                        validate = validate && i.getValidate();
                    }
                }
                else if (!i.getValue()) {
                    $('.login-content .cui-textBoxContainer').find('input').focus().blur();
                    validate = validate && i.getValidate();
                }
            });
            location.href = '/customer/examiner/taskList';
            // if (validate) {
            //     $.ajax({
            //         type: 'post',
            //         url: '/customer/session/login',
            //         data: {
            //             account: self.textBox[0].getValue(),
            //             password: self.textBox[1].getValue(),
            //             validateCode: self.textBox[2].getValue()
            //         }
            //     }).done((res) => {
            //         debugger
            //         if (res && res.status) {
            //             if (!res.isValidate) {
            //                 self.textBox[2].setValidate(false, '验证码错误！');
            //                 $('.loginValidateCode').val("");
            //                 $('.change').click();
            //                 return false;
            //             } else {
            //                 if (res.customer && res.customer.permission &&
            //                     res.customer.permission.includes('c5_1')) { //后台管理员登陆
            //                     location.href = '/customer/home';
            //                 } else if (res.customer && res.customer.permission &&
            //                     res.customer.permission.includes('c4_1')) { //考官登陆
            //                     location.href = '/customer/examiner/taskList';
            //                 } else {
            //                     cui.popTips.warn(res.message);
            //                     $('.change').click();
            //                     return false;
            //                 }
            //             }
            //         } else {
            //             if (res && (res.code == "27003001" || res.code == "27003003")) {
            //                 this.isRequiredValidateCode = res.isRequiredValidateCode;
            //                 if (this.isRequiredValidateCode) {
            //                     $('.cui-textBoxContainer.validateCode').show();
            //                 }
            //                 $('.loginName').val('');
            //                 $('.loginPassWord').val('');
            //                 $('.loginValidateCode').val('');
            //                 $('.cui-container .ie-placeholder').show();
            //                 $('.change').click();
            //             }
            //             return cui.popTips.error(res.message || '网络错误！')
            //         }
            //     })
            // }
        }).on('keydown', '.cui-textBoxContainer', (e) => { //回车登录
            let $this = $(e.currentTarget);

            if (e.keyCode == 13) {
                $this.blur();
                $('.login-content .cui-botton a').click();
            }
        })
    }
}
let loginIns = new LoginDemo();
