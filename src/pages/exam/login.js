/*
* @Author: sihui.cao
* @Date:   2017-02-07 11:46:35
* @Last Modified by:   zyuan
* @Last Modified time: 2017-03-13 13:49:20
*/

'use strict';
import '../../components/share/hfCommon'
import './login.less'

import cui from 'c-ui'
import session from '../../dao/sessionContext'
import WarnTip from '../../components/tips/warnTip'
import SuccessTip from '../../components/tips/successTip'


import loginDao from '../../dao/user/login'

class LoginDemo {
    constructor() {
        this.init();
    }
    init() {
        this.textBox = Array.from($('.cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        // if (navigator.userAgent.indexOf('MSIE 7.0') > 0 || navigator.userAgent.indexOf('MSIE 8.0') > 0) {
        //     $('.download').show();
        // }
        $('.ie-placeholder').css({
            'top':'50%',
            'margin-top': '-9px'
        })
        $('.go-to-bottom,.go-to-top').remove()
        this.handleEvents();
    }
    handleEvents() {
        let getSmsRes = {};

        $('.login-wrap').on('click', '.confirm .cui-button', () => { //登录
            let validate = true;
            this.textBox.map((i, v) => {
                if (i.$el.parent().is('.validateCode')) {
                    if (this.isRequiredValidateCode){
                        $('.login-wrap .cui-textBoxContainer').find('input').focus().blur();
                        validate = validate && i.getValidate();
                    }
                }
                else if (!i.getValue()) {
                    $('.login-wrap .cui-textBoxContainer').find('input').focus().blur();
                    validate = validate && i.getValidate();
                }
            })


            let self = this;
            if (validate) {
                $.ajax({
                    type: 'post',
                    url: '/exam/session/login',
                    data: {
                        account: self.textBox[0].getValue(),
                        password: self.textBox[1].getValue(),
                        validateCode: self.textBox[2].getValue(),
                        isQrCodeLogin: 0
                    }
                }).done((res) => {
                    if (res && res.status) {
                        if (!res.isValidate) {
                            self.textBox[2].setValidate(false, '验证码错误！');
                            $('.loginValidateCode').val("");
                            $('.change').click();
                            return false;
                        } else {
                            if (res && res.status && res.user) {
                                location.href = '/exam/warnTip';
                            } else {
                                cui.popTips.warn(res.message);
                                $('.loginName').val("");
                                $('.loginPassWord').val("");
                                $('.loginValidateCode').val("");
                                $('.change').click();
                                return false;
                            }
                        }
                    } else {
                        this.isRequiredValidateCode = res.isRequiredValidateCode;
                        if (this.isRequiredValidateCode) {
                            $('.code.validateCode').show();
                        }
                        $('.loginName').val("");
                        $('.loginPassWord').val("");
                        $('.loginValidateCode').val("");
                        $('.change').click();
                        return cui.popTips.error(res.message)
                    }
                })
            }
        }).on('keydown', '.cui-textBoxContainer input', (e) => { //回车登录
            let $this = $(e.target);

            if (e.keyCode == 13) {
                $this.blur();
                $('.confirm .cui-button').click();
            }
        })
    }
}
let loginIns = new LoginDemo();
