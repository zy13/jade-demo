/*
* @Author: zyuan
* @Date:   2016-11-30 17:34:07
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-09T16:57:14+08:00
*/

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import addTpl from '../tpl/add_group.html';
import SuccessTip from '../../../components/tips/successTip'
import daoGroup from '../../../dao/administratorSetting/group'
import session from '../../../dao/sessionContext'

class AddGroup {
    constructor(data){
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
    initModal(){
        let tplJuicer = juicer(addTpl);
        // let tplHtml = tplJuicer.render({}); 没有数据渲染

        let tmpHeader = $('<span></span>').text('新建分组('+this.data.groupName+')');
        let tmpContent = $(addTpl);
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
    initTextBox(){
        this.textBoxes = Array.from($('.add-group .cui-textBoxContainer'), (v)=> new cui.TextBox($(v)))
    }
    handleInput(){
        $('.add-group .cui-textBoxContainer input').on('keyup',(e)=>{
            let $this = $(e.currentTarget);
            if($this.val().length>=50){
                let str = $this.val().slice(0,50).replace(/\S{51,}/,'');
                $this.val(str);
            }
        })
    }
    confirm(){
        $('.confirm').on('click',()=>{
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
                    accessToken: this.context.accessToken,
                    name: this.textBoxes[0].getValue(),
                    parentId: this.data.parentId
                }
                $('.m-item .group-name').map((index,i) => {
                    if ($(i).text() == opts.name) {
                        isRepeat = true;
                    }
                });
                if (!isRepeat) {
                    daoGroup.addGroup(opts).then((res) => {
                        if (res.code == 0) {
                            let fn = () => this.modal.close();
                            new SuccessTip('添加成功', fn, true);
                        } else {
                            cui.popTips.error(res.message)
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000)
                        }
                    });
                }else{
                    $('.cui-panel-content .add-group .cui-textBoxContainer')
                    .attr('data-tips','分组名称已存在')
                    .find('input')
                    .attr('placeholder',opts.name)
                    .val('').focus().blur();
                }

            }
        })
    }
    cancel(){
        $('.cancel').on('click',()=>{
            this.modal.$container.remove()
        })
    }
}
export default AddGroup
