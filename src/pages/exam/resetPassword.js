/*
 * @Author: sihui.cao
 * @Date:   2017-02-07 15:10:59
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-03-20 14:12:08
 */

'use strict';
import '../../components/share/hfCommon'
import './resetPassword.less'

import cui from 'c-ui'
import session from '../../dao/sessionContext'
import userDao from '../../dao/projectManagement/examineeInfo'
import SuccessTip from '../../components/tips/successTip'
import WarnTip from '../../components/tips/warnTip'

class ResetPassword {
    constructor() {
        this.init()
    }
    init() {
            this.watch();
        }
        // 密码不能为空
    validate_null($el) {
            if (!$el[0].value) {
                $el.addClass('failure')
                new WarnTip($el.parent(), '密码不能为空', { left: 0, top: '40px' }, 1200, true)
                return false;
            }
            return true;
        }
        // 密码长度不能少于6位
    validate_length($el, len = 6) {
            if (!$el[0].value)
                return false;
            if ($el[0].value.length < len) {
                $el.addClass('failure')
                new WarnTip($el.parent(), `密码长度不能少于${len}位`, { left: 0, top: '40px' })
                return false;
            }
            return true;
        }
        // 密码是否相同
    validate_same($old, $new) {
            if ($old.val() && ($old.val() == $new.val())) {
                return true;
            }
            return false;
        }
        // 必须包含数字字母特殊字符
    validate_role($el) {
            let reg = /^(?![^a-zA-Z]+$)(?!\d+$)(?![^;:'",_`~@#%&\{\}\[\]\|\\\<\>\?\/\.\-\+\=\!\$\^\*\(\)\s]+$).{6,}$/g;
            if (!reg.test($el.val())) {
                $el.addClass('failure')
                new WarnTip($el.parent(), '必须包含数字字母以及特殊字符', { left: 0, top: '40px' })
                return false;
            }
            return true;
        }
        //旧密码
    validate_old() {
            let $el = $('.cui-textBoxContainer:eq(0) input')
            if (!this.validate_null($el))
                return false;
            if (!this.validate_length($el))
                return false;
            if ($('.cui-textBoxContainer:eq(1) input').val() && this.validate_same($('.cui-textBoxContainer:eq(1) input'), $el)) {
                new WarnTip($el.parent(), '新旧密码不能相同', { left: 0, top: '40px' })
                new WarnTip($('.cui-textBoxContainer:eq(1)'), '新旧密码不能相同', { left: 0, top: '40px' })
                $('.cui-textBoxContainer:lt(2) input').val('').addClass('failure')
                return false;
            }
            return true;
        }
        //新密码
    validate_new() {
            let $el = $('.cui-textBoxContainer:eq(1) input')
            if (!this.validate_null($el))
                return false;
            if (!this.validate_length($el))
                return false;
            if ($('.cui-textBoxContainer:eq(0) input').val() && this.validate_same($('.cui-textBoxContainer:eq(0) input'), $el)) {

                new WarnTip($el.parent(), '新旧密码不能相同', { left: 0, top: '40px' })
                new WarnTip($('.cui-textBoxContainer:eq(0)'), '新旧密码不能相同', { left: 0, top: '40px' })
                $('.cui-textBoxContainer:lt(2) input').val('').addClass('failure')
                return false;

            } else if ($('.cui-textBoxContainer:eq(0) input').val().length >= 6 && $('.cui-textBoxContainer:eq(0) input').is('.failure')) {
                $('.cui-textBoxContainer:eq(0) input').removeClass('failure')

            }
            if ($('.cui-textBoxContainer:eq(2) input').val() && !this.validate_same($('.cui-textBoxContainer:eq(2) input'), $el)) {

                new WarnTip($el.parent(), '两次密码不一致', { left: 0, top: '40px' })
                new WarnTip($('.cui-textBoxContainer:eq(2)'), '两次密码不一致', { left: 0, top: '40px' })
                $('.cui-textBoxContainer:gt(0) input').val('').addClass('failure')
                return false;

            }
            if (!this.validate_role($el))
                return false;
            return true;
        }
        //确认密码
    validate_sure(e) {
        let $el = $('.cui-textBoxContainer:eq(2) input')
        if (!this.validate_null($el))
            return false;
        if (!this.validate_length($el))
            return false;
        if ($('.cui-textBoxContainer:eq(1) input').val() && !this.validate_same($('.cui-textBoxContainer:eq(1) input'), $el)) {
            new WarnTip($el.parent(), '两次密码不一致', { left: 0, top: '40px' })
            new WarnTip($('.cui-textBoxContainer:eq(1)'), '两次密码不一致', { left: 0, top: '40px' })
            $('.cui-textBoxContainer:gt(0) input').val('').addClass('failure')
            return false;
        }
        return true;
    }
    verity() {
        let validate = true;
        if (!this.validate_old())
            validate = false;
        if (!this.validate_new())
            validate = false;
        if (!this.validate_sure())
            validate = false;
        return validate;
    }
    getValue() {
        var data = {
            oldPassword: $.trim($('.cui-textBoxContainer:eq(0) input').val()),
            newPassword: $.trim($('.cui-textBoxContainer:eq(1) input').val())
        }
        return data;
    }
    watch() {
        $('.cui-textBoxContainer').on('focus', 'input', (e) => {
                $(e.target).removeClass('failure').addClass('hold')
            }).on('blur', 'input', (e) => {
                $(e.target).removeClass('hold')
            })
            // 原密码
        $('.cui-textBoxContainer:eq(0)').on('blur', 'input', (e) => {
            this.validate_old(e)
        })

        //新密码
        $('.cui-textBoxContainer:eq(1)').on('blur', 'input', (e) => {
            this.validate_new(e)
        })

        //确认密码
        $('.cui-textBoxContainer:eq(2)').on('blur', 'input', (e) => {
            this.validate_sure(e)
        })
        $('.confirm').on('click', '.cui-button.preset-blue', () => { //保存密码
            if (this.verity()) {
                let opts = this.getValue()
                session.user().then((res) => {
                    opts.accessToken = res.accessToken;
                    opts.userId = res.userId;
                    return userDao.resetUserPassword(opts)
                }).then((res) => {
                    if (res && res.code == 0) {
                        new SuccessTip('修改成功', null, false)
                        setTimeout(() => {
                            $('.logout').click()
                        }, 1500)
                    } else {
                        if (res.code == 27003001) {
                            $('.cui-textBoxContainer input').val('').removeClass('success')
                            return cui.popTips.error('旧密码错误');
                        } else {
                            return cui.popTips.warn(res.message)
                        }
                    }
                }).catch((err) => {
                    return cui.popTips.error('网络错误！')
                })
            }
        });
    }
}
let resetPassword = new ResetPassword();
