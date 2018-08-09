/*
 * @Author: zyuan
 * @Date:   2016-11-29 15:28:30
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-23T11:59:57+08:00
 */

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import roleTpl from '../tpl/create_role.html';
import daoRole from '../../../dao/administratorSetting/role'
import SuccessTip from '../../../components/tips/successTip'
import session from '../../../dao/sessionContext'

class CreateRole {
    constructor() {
        this.getContext();
        this.initModal();
        this.initTextBox();
        this.confirm();
        this.cancel();
        this.handleInput();
    }
    getContext() {
        let self = this;
        session.customer().then((res) => {
            self.context = res;
        })
    }
    initModal() {
        let tplJuicer = juicer(roleTpl);
        // let tplHtml = tplJuicer.render({});

        let tmpHeader = $('<span>创建角色</span>');
        let tmpContent = $(roleTpl);
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
        this.textBoxes = Array.from($('.create .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
    }
    handleInput() {
        $('.create .cui-textBoxContainer input').on('keyup', (e) => {
            let $this = $(e.currentTarget);
            if($this.val().length>=50){
                let str = $this.val().slice(0, 50).replace(/\S{51,}/, '');
                $this.val(str);
            }

        })
    }
    confirm() {
        $('.confirm').on('click', () => {
            if (!this.context) {
                return cui.popTips.error('网络出错')
            }
            let validate = true;
            let opts = {
                accessToken: this.context.accessToken,
                name: this.textBoxes[0].getValue()
            }
            for (let i of this.textBoxes) {
                if (!i.getValidate()) {
                    $('.cui-textBoxContainer input').focus().blur();
                }
                validate = validate && i.getValidate();
            }
            if (validate) {

                daoRole.createRole(opts).then((res) => {
                    if (res.code == 0) {
                        let fn = () => this.modal.close();
                        new SuccessTip('创建成功', fn, true);
                    } else if (res.code == 28002007) {
                        this.textBoxes[0].setValidate(false, '角色名已存在');
                    } else if (res.code == 28002012) {
                        cui.popTips.error('不能写入系统默认角色！')
                    } else {
                        cui.popTips.error('系统异常！')
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000)
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
export default CreateRole
