/*
* @Author: sihui.cao
* @Date:   2016-12-08 16:49:08
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-03-10 18:33:56
*/

'use strict';
import cui from 'c-ui'
import './style.less'
import juicer from 'juicer'

class SelectAccount{
    constructor(setting){
        this.config = setting
        this.sure = false;
        this.init()
    }
    handleChar(){
        if(this.config.data.selected){
            this.config.data.selected = Array.from(this.config.data.selected,(v)=>{
                return {
                    account:v.account.replace(/\"/g,"&quot;"),
                    name:v.name
                }
            })
        }
        if(this.config.data.select) {
            this.config.data.select = Array.from(this.config.data.select, (v) => {
                return {
                    account: v.account.replace(/\"/g, "&quot;"),
                    name: v.name
                }
            })
        }
    }
    init(){
        this.handleChar()
        let tpljuicer = juicer(require('./tpl/index.html'));
        let html = tpljuicer.render(this.config.data);

        let tmpHeader = $('<span>' + this.config.title + '</span>');
        let tmpContent = $(html);
        let modalPanel = new cui.Panel(tmpHeader, tmpContent);
        let modalBrocken = new cui.Brocken();
        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css({
            height: '620px',
            width: '630px'
        });

        this.modal.open();
        this.watch()
    }
    open(){
        this.modal.open()
    }
    getValue(){
        return Array.from(this.modal.$el.find('.select-win-main .scroll2 .item'),(v)=>{
            return{
                id:$(v).data('id').replace(/&quot;/g,"\""),
                name:$(v).text()
            }
        })
    }
    on(event,fn){
        if(!this.eventList)
            this.eventList = {}
        this.eventList[event] = fn;
    }
    emit(event){
        if(this.eventList[event])
            this.eventList[event]()
    }
    watch(){
        var self = this;
        self.modal.$el.on('click','.win-scroll .item',(e)=>{
            if($(e.target).hasClass('active')){
                $(e.target).removeClass('active')
            }else{
                $(e.target).addClass('active')
            }
        }).on('click','.toright',()=>{
            self.modal.$el.find('.select-win-main .scroll1 .item.active').removeClass('active').appendTo(self.modal.$el.find('.select-win-main .scroll2 ul'))
        }).on('click','.toleft',()=>{
            self.modal.$el.find('.select-win-main .scroll2 .item.active').removeClass('active').appendTo(self.modal.$el.find('.select-win-main .scroll1 ul'))
        }).on('click','.sure',()=>{
            self.sure = true;
            self.emit('sure')
            self.modal.close()
        }).on('click','.cancle',()=>{
            self.modal.close()
        })
        self.modal.on('modalClose',()=>{
            if(!self.sure){
                let tpljuicer = juicer(require('./tpl/index.html'));
                let html = tpljuicer.render(self.config.data);
                self.modal.$el.find('.cui-panel-content').html(html)
            }
        })
    }
    update(id){
        for(let [i,v] of this.config.data.selected.entries()){
            if(v.account == id){
                this.config.data.select.push(this.config.data.selected[i])
                this.config.data.selected.splice(i,1)
            }
        }
        this.modal.$el.find('.select-win-main .scroll2 .item[data-id="'+id+'"]').addClass('active')
        this.modal.$el.find('.toleft').click()
    }
}
export default SelectAccount



