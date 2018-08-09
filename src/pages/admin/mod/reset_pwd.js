/**
 * @Author: Jet.Chan
 * @Date:   2016-12-07T16:51:06+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-13T21:03:49+08:00
 */



import juicer from 'juicer'
import cui from 'c-ui'
import resetPwdTpl from '../tpl/reset_pwd.html';
import SuccessTip from '../../../components/tips/successTip'

import session from '../../../dao/sessionContext';
import adminDao from '../../../dao/administratorSetting/admin.js';

import {
    RandomString,
    FormOptions
} from '../../../components/share/tools.js';

const juicerTpl = juicer(resetPwdTpl);

class ResetPwd {
    constructor(conf) {
        this.conf = Object.assign({
            title: '重置密码',
            ids: ''
        }, conf);
        this.initModal();
    }
    initModal() {
        let tplHtml = $(juicerTpl.render(this.conf)),
            tmpHeader = $(`<span>${this.conf.title}</span>`),
            modalPanel = new cui.Panel(tmpHeader, $(tplHtml)),
            modalBrocken = new cui.Brocken();

        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css({
            height: '300px',
            width: '610px'
        });
        this.modal.open();
        this.modal.on('modalClose', () => {
            this.modal.$container.remove()
        })
        $('.cancel').on('click', () => {
            this.modal.$container.remove();
        })

        this.textBoxes = Array.from($('.create .cui-textBoxContainer.valtextbox'), (v) => new cui.TextBox($(v)));
        this.checkboxes = new cui.Checkbox($('.create .cui-checkboxContainer'));
        this.textBoxes[0].$el.find('input, textarea').off('focus').off('blur');;
        $('.create .cui-checkboxContainer input').on('click', (e) => {
            if (this.checkboxes.getValue()) {
                const rdPwd = new RandomString().getTypeString(6, 6, 'number,letter,char');
                $('input[name=password]').attr('readonly', 'true').val(rdPwd).siblings('.ie-placeholder').hide();
            } else {
                $('input[name=password]').removeAttr('readonly').val('').siblings('.ie-placeholder').show();
            }
        })


        $('.create .confirm').on('click', () => {
            let validate = true;
            for (let i of this.textBoxes) {
                if (!i.getValidate()) {
                    cui.popTips.error('请输入密码');
                    i.$el.find('input').focus();
                }
                validate = validate && i.getValidate();
            }
            if (validate) {
                let model = {
                    ids: this.conf.ids,
                    password: $('input[name=password]').val()
                }
                session.customer().then((customer) => {
                    model.accessToken = customer.accessToken;
                    return adminDao.resetPwd(model)
                }).then((r) => {
                    if (r.code == 0) {
                        let fn = () => this.modal.close();
                        new SuccessTip('操作成功', fn);
                    } else {
                        //cui.popTips.error('系统异常！');
                        if (r.code > 0)
                            cui.popTips.error(r.message);
                        else
                            cui.popTips.error('系统异常！');
                    }
                }).catch((err) => {
                    cui.popTips.error('系统异常！');
                    console.log(err);
                })
            }
        })
    }

}

export default ResetPwd
