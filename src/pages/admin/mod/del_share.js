/*
 * @Author: zyuan
 * @Date:   2016-12-02 20:10:34
 * @Last Modified by:   zyuan
 * @Last Modified time: 2017-01-10 11:56:34
 */

'use strict';

import $ from 'jquery'
import juicer from 'juicer'
import cui from 'c-ui'
import delTpl from '../tpl/del_share.html';
import SlideSwitch from '../../../components/slide-switch/index'
import daoGroup from '../../../dao/administratorSetting/group'
import daoRole from '../../../dao/administratorSetting/role'
import SuccessTip from '../../../components/tips/successTip'
import session from '../../../dao/sessionContext'

class DelRoleOrGroupOrAdmin {
    constructor(delId, type) {
        this.delId = delId;
        this.type = type;
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
        let tplJuicer = juicer('../tpl/edit_role.html');
        let tplHtml = tplJuicer.render({});

        let tmpHeader = $('<span>提示</span>');
        let tmpContent = $(delTpl);
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
        $('.confirm').on('click', () => {
            if (!this.context) {
                return cui.popTips.error('网络出错')
            }
            let opts = {
                accessToken: this.context.accessToken,
                delId: this.delId,
                type: this.type
            }



            if (opts.type == 0) {
                //分组管理
                daoGroup.deleteGroup(opts).then((res) => {
                    if (res.code == 0) {
                        if ($.isArray(this.delId)) {
                            for (let i of this.delId) {
                                let id = '#' + i;
                                let fn = () => $(id).remove();
                                new SuccessTip('删除成功', fn,true);
                                setTimeout(()=>{
                                    this.modal.$container.remove()
                                },2000)
                            }
                        } else {
                            let id = '#' + this.delId;
                            let fn = () => $(id).remove();
                            new SuccessTip('删除成功', fn,true);
                            setTimeout(()=>{
                                this.modal.$container.remove()
                            },2000)
                        }

                    } else {
                        cui.popTips.error(res.message)
                        setTimeout(()=>{
                            this.modal.$container.remove()
                        },2000)
                    }
                });
            }
            if (opts.type == 2) {
                //角色管理
                daoRole.deleteRole(opts).then((res) => {
                    if (res.code == 0) {
                        if ($.isArray(this.delId)) {
                            for (let i of this.delId) {
                                let id = '#' + i;
                                let fn = () => $(id).remove();
                                new SuccessTip('删除成功', fn,true);
                                setTimeout(()=>{
                                    this.modal.$container.remove()
                                },2000)
                            }
                        } else {
                            let id = '#' + this.delId;
                            let fn = () => $(id).remove();
                            new SuccessTip('删除成功',fn,true);
                            setTimeout(()=>{
                                this.modal.$container.remove()
                            },2000)
                        }

                    } else {
                        cui.popTips.error(res.message)
                        setTimeout(()=>{
                            this.modal.$container.remove()
                        },2000)
                    }
                });
            }
        })
    }
    cancel() {
        $('.cancel').on('click', () => {
            this.modal.$container.remove()
        })
    }
}
export default DelRoleOrGroupOrAdmin
