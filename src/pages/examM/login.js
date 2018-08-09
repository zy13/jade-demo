/*
 * @Author: zyuan
 * @Date:   2017-01-05 13:58:36
 * @Last Modified by:   zyuan
 * @Last Modified time: 2017-02-28 11:37:32
 */

'use strict';

import '../../components/share/layoutM'
import './login.less'

import $ from 'jquery'
import cui from 'c-ui'
import loginDao from '../../dao/user/login'

class LoginDemo {
    constructor() {
        this.init();
    }
    init() {
        this.textBox = Array.from($('.cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.handleEvents();
    }
    handleEvents() {
        let getSmsRes = {};

        $('.exam-content .div-group').on('click', '.loginType2 .exp .addonRight', (e) => { //获取验证码
            let phoneNumber = this.textBox[0].getValue();
            let projectId = $('#projectId').val();
            let $this = $(e.currentTarget);
            let countdown = 60;

            if(this.textBox[0].getValidate()){
                loginDao.getSmsValidateCode(phoneNumber,projectId).then((res) => {
                    if (res && res.code == 0) {
                        getSmsRes = res;
                        this.setTimeLimit(countdown, $this);
                    } else {
                        cui.popTips.warn(res.message)
                    }
                }).catch((err) => {
                    return cui.popTips.warn('服务器繁忙,请稍后再试！')
                });
            }else{
                $('.cui-textBoxContainer').find('input[name=mobile]').focus().blur();
            }
        }).on('click', '.div-body .a-button', () => { //登录
            let validate = true;
            let loginType = $('#loginType').val();

            this.textBox.map((i, v) => {
                if (i.$el.is('.validateCode')) {
                    if (this.isRequiredValidateCode){
                        $('.cui-textBoxContainer').find('input').focus().blur();
                        validate = validate && i.getValidate();
                    }
                } else if (!i.getValue()) {
                    $('.cui-textBoxContainer').find('input').focus().blur();
                    validate = validate && i.getValidate();
                }

            })
            if (loginType == '1') { //测评前端帐号密码登录
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
                                $('.cui-textBoxContainer.validateCode').show();
                            }
                            $('.loginName').val("");
                            $('.loginPassWord').val("");
                            $('.loginValidateCode').val("");
                            $('.change').click();
                            return cui.popTips.error(res.message)
                        }
                    })
                }
            }

            if (loginType == '2') { //扫码登录
                if (validate) {
                    let self = this;

                    if (getSmsRes && getSmsRes.code == 0) {
                        $.ajax({
                            type: 'post',
                            url: '/exam/session/login',
                            data: {
                                mobile: self.textBox[0].getValue(),
                                verificationCode: self.textBox[1].getValue(),
                                isQrCodeLogin: 1,
                                projectId: $('#projectId').val()
                            }
                        }).done((res) => {
                            if (res && res.status && res.user) {
                                location.href = '/exam/warnTip';
                            } else {
                                return cui.popTips.warn(res.message)
                            }
                        })
                    } else {
                        return self.textBox[1].setValidate(false, '验证码错误！');
                    }
                }
            }
        })
    }
    setTimeLimit(countdown, $this) {
        let intervalid;
        let regStr = /秒/;

        if (regStr.test($this.find('span').text())) {
            return;
        } else {
            intervalid = setInterval(() => {

                if (countdown > 0) {
                    $this.find('span').text(`${countdown--}秒`);
                } else {
                    clearInterval(intervalid);

                    $this.removeAttr('disabled');
                    countdown = true;
                    $this.find('span').text('再次获取');
                }
            }, 1000);
        }
    }
}
let loginIns = new LoginDemo();
