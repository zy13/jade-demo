/*
* @Author: zyuan
* @Date:   2016-11-29 17:49:46
* @Last Modified by:   zyuan
* @Last Modified time: 2016-12-05 17:16:18
*/

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import addTpl from '../tpl/add_role.html';
import SlideSwitch from '../../../components/slide-switch/index'

class AddAcount {
    constructor(){
        this.initModal();
        this.confirm();
        this.cancel();
    }
    initModal(){
        let tplJuicer = juicer(addTpl);
        // let tplHtml = tplJuicer.render({}); 没有数据渲染

        let tmpHeader = $('<span>添加帐号</span>');
        let tmpContent = $(addTpl);
        let modalPanel = new cui.Panel(tmpHeader, tmpContent);
        let modalBrocken = new cui.Brocken();

        this.slideList = Array.from($('.add .slideBtn'),(elem)=>new SlideSwitch(elem))
        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css({
            height: '615px',
            width: '610px'
        });

        this.modal.open();
        this.modal.on('modalClose', () => {
            this.modal.$container.remove()
        })
    }
    confirm(){
        $('.confirm').on('click',()=>{
            this.modal.close()
        })
    }
    cancel(){

        $('.cancel').on('click',()=>{
            this.modal.$container.remove()
        })
    }
}
export default AddAcount
