/*
 * @Author: zyuan
 * @Date:   2016-12-19 15:03:41
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-13T15:09:27+08:00
 */

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import resetTpl from '../tpl/reset_psw.html';
import SuccessTip from '../../../components/tips/successTip'

import session from '../../../dao/sessionContext';
import examineeInfoDao from '../../../dao/projectManagement/examineeInfo.js';
import {
    RandomString
} from '../../../components/share/tools.js';

const juicerTpl = juicer(resetTpl);
class ResetPsw {
    constructor(data) {
        this.data = data || '';
        this.initModal();
        this.handleConfirm();
    }
    initModal() {
        let tplHtml = $(juicerTpl.render()),
            tmpHeader = $(`<span>重置密码</span>`),
            modalPanel = new cui.Panel(tmpHeader, $(tplHtml)),
            modalBrocken = new cui.Brocken();

        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css({
            width: '610px'
        });

        this.modal.open();
        this.initControl();
        this.modal.on('modalClose', () => this.modal.$container.remove());

        $('.cancel').on('click', () => this.modal.$container.remove());
    }
    initControl() {
        this.resetPswTxt = Array.from($('.reset_psw .cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
        this.resetPswChk = Array.from($('.reset_psw .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)))
        this.resetPswTxt[0].$el.find('input').off('blur');
    }
    handleConfirm() {
        $('.reset_psw').on('click', '.confirm', () => {
            // let validate = true;
            // for (let i of this.resetPswTxt) {
            //     if (!i.getValidate()) {
            //         $('.reset_psw .cui-textBoxContainer input').focus().blur();
            //     }
            //     validate = validate && i.getValidate();
            // }
            let value = this.resetPswTxt[0].$el.find('input').val();
            if (!$.trim(value) && value.length < 6) {
                this.resetPswTxt[0].$el.find('input').focus();
                return cui.popTips.error('密码不能为空并不能小于6位');
            }

            let opts = {
                accessToken: this.data.accessToken,
                cmctStatus: this.data.cmctStatus,
                cmctWay: this.data.cmctWay,
                ids: this.data.ids,
                isRandom: this.resetPswChk[0].getValue(),
                key1: this.data.key1,
                key2: this.data.key2,
                newPassword: this.resetPswTxt[0].getValue() ? this.resetPswTxt[0].getValue() : '',
                projectId: this.data.projectId,
                searchType1: this.data.searchType1,
                searchType2: this.data.searchType2,
                status: this.data.status,
                taskId: this.data.taskId
            };

            examineeInfoDao.reSetPassword(opts).then((res) => {
                if (res && res.code == 0) {
                    new SuccessTip('设置成功', '', true)
                } else {
                    return cui.popTips.error(res.message)
                }
            }).catch((err) => {
                return cui.popTips.error('网络错误')
            })
        }).on('click', '.cui-checkboxContainer input[type=checkbox]', () => { //重置密码
            if (this.resetPswChk[0].getValue()) {
                const rdPwd = new RandomString().getTypeString(6, 6, 'number,letter,char');

                $('input[name=password]').attr('readonly', 'true').val(rdPwd)
            } else {
                $('input[name=password]').removeAttr('readonly').val('')
            }
        })
    }
}

export default ResetPsw
