/*
* @Author: sihui.cao
* @Date:   2016-12-02 14:51:30
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-03-05 14:24:13
*/

'use strict';
import juicer from 'juicer'
import cui from 'c-ui'
import _ from 'lodash'
import session from '../../dao/sessionContext/index'
import dalTemplate from '../../dao/projectManagement/template'
import moment from 'moment'
import loading from '../loading/index'
import PreviewMess from '../tem-mes-detail/index'
import './style.less'

class EmailDetail{
    constructor(setting){
        this.config = setting;
        if(this.config.type == 'merge')
            this.sendRequset()
        else
            this.init()
    }
    sendRequset(){  //获取数据
        loading.open()
        session.customer().then((r)=>{
            this.config.data.accessToken = r.accessToken
            return this.config.url(this.config.data)
        }).then((res)=>{
            loading.close()
            if(res.code == 0){
                this.renderEmail(res.response)
            }else{
                cui.popTips.error(res.messge)
            }
        },(err)=>{
            loading.close()
            cui.popTips.error('请求失败')
            console.log(err)
        })
    }
    renderMess(data){         //实例化短信预览
        new PreviewMess({
            type:'merge',
            both:true,
            obj:this.$el.find('.btns'),
            // url:this.config.smsUrl,
            data:data
        })
    }
    renderEmail(data){          //渲染数据
        let tpljuicer = juicer(require('./tpl/index.html'));
        let html = tpljuicer.render({
            email:{
                back:true,
                type:'more',
                subject:data.subject,
                date:moment().format('YYYY-MM-DD HH:mm:ss'),
                receiver:data.emailReceiver,
                content:data.emailContent,
                sign:data.sign,
                hasNext:data.hasNext,
                hasPrevious:data.hasPrevious
            }
        });

        this.config.obj.parent().children().removeClass('active')     //隐藏其他编辑和预览div
        this.$el = $(html)
        this.config.obj.addClass('active').html('')
        this.$el.appendTo(this.config.obj)
        if(this.config.both)
            this.renderMess(data)
        this.watch()
    }
    init(){
        let tpljuicer = juicer(require('./tpl/index.html'));
        let html = tpljuicer.render(this.config.data);

        let tmpHeader = $('<span>' + this.config.title + '</span>');
        let tmpContent = $(html);
        let modalPanel = new cui.Panel(tmpHeader, tmpContent);
        let modalBrocken = new cui.Brocken();
        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
        this.modal.$container.find('.cui-panel-content').css({
            height:'570px',
            overflow:'auto'
        })
        modalPanel.getPanel().css({
            height: '620px',
            width: '810px'
        });
        this.modal.open();
        this.watch()
    }
    watch() {
        //弹窗关闭
        // console.log(this.modal)
        let self = this;
        if(this.modal){
            this.modal.on('modalClose', () => {
                self.modal.$container.remove()
            })
        }else{
            this.$el.on('click','.prev',()=>{
                self.config.data.pageIndex = self.config.data.pageIndex-1
                this.sendRequset()
            }).on('click','.next',()=>{
                self.config.data.pageIndex = self.config.data.pageIndex+1
                this.sendRequset()
            }).on('click','.back',()=>{
                self.emit('remove')
                self.config.obj.removeClass('active').html('')
            })
        }
    }
    emit(event){
        this.eventList[event]()
    }
    on(event,fn){
        if(!this.eventList){
            this.eventList={}
        }
        this.eventList[event]=fn;
    }
}

export default EmailDetail




