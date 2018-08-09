/*
 * @Author: zyuan
 * @Date:   2016-11-29 18:38:46
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-03-06 13:48:27
 */

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import editTpl from '../tpl/edit_role.html';
import daoRole from '../../../dao/administratorSetting/role'
import SuccessTip from '../../../components/tips/successTip'
import session from '../../../dao/sessionContext'

class EditRole {
    constructor(data) {
        this.data = data;
        this.getContext();
        this.initModal();
        this.initTextBox();
        this.confirm();
        this.cancel();
    }
    getContext() {
        let self = this;
        session.customer().then((res) => {
            self.context = res;
        })
    }
    initModal() {
        let data = {
            roleName: this.data.roleName
        };
        let tplJuicer = juicer(editTpl);
        let tplHtml = $(tplJuicer.render(data));

        let tmpHeader = $('<span>修改角色</span>');
        let tmpContent = $(tplHtml);
        let modalPanel = new cui.Panel(tmpHeader, tmpContent);
        let modalBrocken = new cui.Brocken();


        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css({
            height: '290px',
            width: '610px'
        });

        this.modal.open();
        this.modal.on('modalClose', () => {
            this.modal.$container.remove()
        })
    }
    initTextBox() {
        this.textBoxes = Array.from($('.edit .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
    }

    confirm() {
        $('.edit .confirm').on('click', () => {
            let validate = true;
            for (let i of this.textBoxes) {
                if (!i.getValidate()) {
                    $('.edit .cui-textBoxContainer input').focus().blur();
                }
                validate = validate && i.getValidate();
            }
            if (!this.context) {
                return cui.popTips.error('网络出错')
            }
            if (validate) {
                let isRepeat = false;
                let opts = {
                    roleId: this.data.roleId,
                    accessToken: this.context.accessToken,
                    newName: this.textBoxes[0].getValue()
                }
                // for (let i of $('.m-item .role-name')) {
                //     if ($(i).text() == opts.newName) {
                //         isRepeat = true;
                //     }
                // }
                if (!isRepeat) {
                    daoRole.editRoleName(opts).then((res) => {
                        if (res.code == 0) {
                            let fn = () => this.modal.close();
                            new SuccessTip('修改成功', fn, true);
                        } else {
                            $('.cui-panel-content .edit .cui-textBoxContainer')
                                .attr('data-tips', res.message)
                                .find('input')
                                .attr('placeholder', opts.newName)
                                .val('').focus().blur();
                            // cui.popTips.error(res.message)
                            // setTimeout(() => {
                            //     window.location.reload();
                            // }, 2000)
                        }
                    });
                }else{
                    $('.cui-panel-content .edit .cui-textBoxContainer')
                    .attr('data-tips','角色名已存在')
                    .find('input')
                    .attr('placeholder',opts.newName)
                    .val('').focus().blur();
                }

            }
        })
    }
    cancel() {
        $('.cancel').on('click', () => {
            this.modal.$container.remove();
        })
    }
}
export default EditRole
