/*
 * @Author: zyuan
 * @Date:   2016-11-30 14:37:48
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-03-08 17:53:43
 */

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import editTpl from '../tpl/edit_group.html';
import daoGroup from '../../../dao/administratorSetting/group'
import SuccessTip from '../../../components/tips/successTip'
import session from '../../../dao/sessionContext'

class EditGroup {
    constructor(data) {
        this.data = data;
        this.getContext();
        this.initModal();
        this.initTextBox();
        this.handleInput();
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
            groupName: this.data.groupName
        }
        let tplJuicer = juicer(editTpl);
        let tplHtml = $(tplJuicer.render(data));

        let tmpHeader = $('<span>修改分组</span>');
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
        this.textBoxes = Array.from($('.edit-group .cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
    }
    handleInput(){
        $('.edit-group .cui-textBoxContainer input').on('keyup',(e)=>{
            let $this = $(e.currentTarget);
            if($this.val().length>=50){
                let str = $this.val().slice(0,50).replace(/\S{51,}/,'');
                $this.val(str);
            }
        })
    }
    confirm() {
        $('.confirm').on('click', () => {
            let validate = true;
            for (let i of this.textBoxes) {
                if (!i.getValidate()) {
                    $('.cui-textBoxContainer input').focus().blur();
                }
                validate = validate && i.getValidate();
            }
            if (!this.context) {
                return cui.popTips.error('网络出错')
            }
            if (validate) {
                let isRepeat = false;
                let opts = {
                    groupId: this.data.groupId,
                    accessToken: this.context.accessToken,
                    newName: this.textBoxes[0].getValue()
                }
                // for (let i of $('.m-item .group-name')) {
                //     if ($(i).text() == opts.newName) {
                //         let groupId = $(i).closest(".m-item").attr("id")
                //         alert('groupId is ' + groupId + 'name is ' + $(i).text())
                //         alert('groupId is ' + opts.groupId + 'name is ' + opts.newName)
                //         if(opts.groupId == groupId){
                //             $('.cui-panel-content .edit-group .cui-textBoxContainer')
                //                 .attr('data-tips', '组名没修改')
                //                 .find('input')
                //                 .attr('placeholder', opts.newName)
                //                 .val('').focus().blur();
                //             return;
                //         }else{
                //             isRepeat = true;
                //         }
                //     }
                // }
                if (!isRepeat) {
                    daoGroup.editGroupName(opts).then((res) => {
                        if (res.code == 0) {
                            let fn = () => this.modal.close();
                            new SuccessTip('修改成功', fn, true);
                        } else {
                            $('.cui-panel-content .edit-group .cui-textBoxContainer')
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
                } else {
                    $('.cui-panel-content .edit-group .cui-textBoxContainer')
                        .attr('data-tips', '分组名称已存在')
                        .find('input')
                        .attr('placeholder', opts.newName)
                        .val('').focus().blur();
                }

            }
        })
    }
    cancel() {
        $('.cancel').on('click', () => {
            this.modal.$container.remove()
        })
    }
}
export default EditGroup
