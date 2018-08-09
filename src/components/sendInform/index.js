/*
* @Author: sihui.cao
* @Date:   2016-12-13 11:22:37
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-03-13 19:11:40
*/

'use strict';
import juicer from 'juicer'
import cui from 'c-ui'
import _ from 'lodash'
import WarnTip from '../tips/warnTip'
import '../ueditor/index'
import SuccessTips from '../tips/successTip'
import EditEmailTem from '../tem-email-addtem/index'
import EditMessTem from '../tem-mes-addtem/index'
import PreviewEmail from '../tem-email-detail/index'
import PreviewMess from '../tem-mes-detail/index'
import session from '../../dao/sessionContext/index'
import dalTemplate from '../../dao/projectManagement/template'
import loading from '../loading/index'
import './style.less'

class SendInform{
    constructor(setting){
        this.config = setting;
        this.type = 'email';
        this.requestInformList()
    }
    requestInformList(){    //获取数据
        let self = this;
        session.customer()
            .then((res)=>{
                if(self.config.type != 'examinee')
                    return dalTemplate.getSendInformExaminer({taskId:self.config.taskId,accessToken:res.accessToken})
                else
                    return dalTemplate.getSendInformExaminee(_.extend(this.config,{accessToken:res.accessToken}))
            })
            .then((res)=>{
                if(res&&res.code == 0){
                    self.data = res.response;
                    self.data.type = self.config.type;
                    self.checkNoNull();
                }else{
                    cui.popTips.error(res.message)
                }
            },(err)=>{
                // console.log(err)
                cui.popTips.error('网络错误')
            })

    }
    checkNoNull(){
        let self = this;
        //判断显示哪个tab--发送邮件-发送短信
        //判断所选的发送人是否有邮箱和手机
        let emailCount = parseInt(self.data.emailCount) || 0
        let smsCount = parseInt(self.data.smsCount) || 0
        if(self.config.type == 'examiner'){       //examinee考生examiner考官
            if(!parseInt(self.data.totalCount)){         //NaN或者人数为0
                cui.popTips.error('没有要发送的评卷人');
                return;
            }
            self.initModal()
        }else{
            if(!emailCount&&!smsCount){             //邮箱和手机人数均为0
                cui.popTips.error(`您已选择${self.data.totalCount}个帐号，其中0个有邮箱，0个有手机，请先补充帐号信息`);
                return;
            }else if(!emailCount){          //邮箱数为0
                this.type = 'mess';
            }
            self.initModal()
        }
    }
    initModal() {
        let tpljuicer = juicer(require('./tpl/index.html'));
        let html = tpljuicer.render(this.data)
        let tmpHeader = $('<span>发送通知</span>');
        let tmpContent = $(html);
        let modalPanel = new cui.Panel(tmpHeader, tmpContent);
        let modalBrocken = new cui.Brocken();
        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
        modalPanel.getPanel().css({
            height: $(window).height()*0.9+'px',
            width: '810px'
        });
        this.modal.$el.find('.cui-panel-content').height($(window).height()*0.9-50)
        this.modal.open();
        this.modal.$broken.off('click')
        $('body').css('overflow','hidden')
        this.getHtml()
    }
    getHtml(){          //实例化组件
        this.subBlock = {
            eEmail:new EditEmailTem({
                type:'merge',
                accessToken:this.config.accessToken,
                reuse:{
                    obj:$('#sendInform .editEmail'),
                    data:this.data,
                    time:new Date().getTime()
                }
            }),
            eMess:new EditMessTem({
                type:'merge',
                accessToken:this.config.accessToken,
                reuse:{
                    obj:$('#sendInform .editMess'),
                    data:this.data,
                    time:new Date().getTime()
                }
            }),
            eBoth:{
                 eEmail:new EditEmailTem({
                    type:'merge',
                    accessToken:this.config.accessToken,
                    reuse:{
                        obj:$('#sendInform .editBoth'),
                        data:this.data,
                        time:new Date().getTime()
                    }
                }),
                eMess:new EditMessTem({
                    type:'merge',
                    accessToken:this.config.accessToken,
                    reuse:{
                        obj:$('#sendInform .editBoth'),
                        data:this.data,
                        time:new Date().getTime()
                    }
                })
            }
        }
        this.radioGroup = Array.from($('#sendInform .cui-radioGroupContainer'),(v)=>$(v))

        this.watch()
    }
    noExaminer($obj){
        $obj.text('无收件人');
        $('.win-action .send  ,.win-action .preview').addClass('vaild')
    }
    watch(){
        var self = this;
        this.modal.on('modalClose',()=>{
            $('body').css('overflow','auto')
            self.subBlock.eEmail.emailContent.destroy()
            self.subBlock.eEmail.emailSign.destroy()
            self.subBlock.eBoth.eEmail.emailContent.destroy()
            self.subBlock.eBoth.eEmail.emailSign.destroy()
            self.modal.$container.remove()
            // console.log(self.modal)
        })


        $('#sendInform').on('click','.examiner .account i',(e)=>{   //删除发件人
            var $parent = $(e.target).parent()
            if($parent.parent().find('.account').length == 1){
                this.noExaminer($parent.parent())
            }
            $parent.remove()

        }).on('click','.win-action .send',(e)=>{  //发送通知
            if($(e.target).hasClass('vaild'))
                return;
            var _data = {},email = {},mess = {},sendType,ids;


            //发送邮件
            if($('.editEmail').hasClass('active')){
                ids =( Array.from($('.editEmail .examiner .account'),(v)=>{
                        return $(v).data('account')
                    })).join()

                if(!this.subBlock.eEmail.verify()){
                    return;
                }
                email = this.subBlock.eEmail.getSendValue()
                _data = _.extend(_data,email)
                sendType = 0;
            }

            //发送短信
            if($('.editMess').hasClass('active')){
                ids = (Array.from($('.editMess .examiner .account'),(v)=>{
                        return $(v).data('account')
                    })).join()
                if(!this.subBlock.eMess.verify()){
                    return;
                }
                mess = this.subBlock.eMess.getSendValue()
                _data = _.extend(_data,mess)
                sendType = 1;
            }

            //发送邮件和短信
            if($('.editBoth').hasClass('active')){
                ids = (Array.from($('.editBoth .examiner .account'),(v)=>{
                        return $(v).data('account')
                    })).join()
                if(!this.subBlock.eBoth.eEmail.verify()){
                    return;
                }
                if(!this.subBlock.eBoth.eMess.verify()){
                    return;
                }
                email = this.subBlock.eBoth.eEmail.getSendValue()
                _data = _.extend(_data,email)
                mess = this.subBlock.eBoth.eMess.getSendValue()
                _data = _.extend(_data,mess)
                sendType = 2;
            }
            _data = _.extend({
                ids:ids,
                projectId:this.config.projectId,
                projectIds:this.config.projectId,
                projectName:this.config.projectName,
                sendType:sendType,
                taskId:this.config.taskId,
                taskIds:this.config.taskId,
                taskName:this.config.taskName,
                emailContent:'',
                newMailName:'',
                newSmsName:'',
                sendSubject:'',
                smsContent:'',
                whetherDefaultMail: false,
                whetherDefaultSms: false,
                whetherSaveMail: false,
                whetherSaveSms:false
            },_data)
            if(self.config.type == 'examinee'){
                _data = _.extend(_data,self.config)
                var dao = dalTemplate.sendInformToExaminee
            }else{
                var dao = dalTemplate.sendInformToExaminer
            }
            loading.open()
            session.customer().then((r)=>{
                _data.accessToken = r.accessToken
                return dao(_data)
            }).then((res)=>{
                loading.close()
                if(res.code == 0){
                    this.modal.close()
                    new SuccessTips('发送成功',null);
                }else{
                    cui.popTips.error(res.message)
                }
            })



        }).on('click','.win-action .preview',(e)=>{    //预览
            if($(e.target).hasClass('vaild'))
                return;
            var data = {
                accessToken:this.config.accessToken,
                pageIndex:1,
                taskId:this.config.taskId,
                taskIds:this.config.taskId,
                sendType:self.type == 'email' ? 0 : self.type == 'mess' ? 1 : 2
            }

            //预览-发送邮件或发送邮件和短信
            if(self.type == 'email' || self.type == 'both'){
                if(self.config.type == 'examiner'){          //考官
                    var account = self.type == 'email'?'.editEmail .examiner .account':'.editBoth .examiner .account';
                    var ids =( Array.from($(account),(v)=>{
                            return $(v).data('account')
                        })).join()
                    data.ids = ids || '';
                }else{                                         //考生
                    data.ids = self.config.ids || '';
                }

                data.sign = self.type == 'email'?this.subBlock.eEmail.getSendValue().sign:this.subBlock.eBoth.eEmail.getSendValue().sign;
                data.smsContent = self.type == 'email'?this.subBlock.eMess.getSendValue().smsContent:this.subBlock.eBoth.eMess.getSendValue().smsContent;
                data.subject = self.type == 'email'?this.subBlock.eEmail.getSendValue().sendSubject:this.subBlock.eBoth.eEmail.getSendValue().sendSubject;
                data.emailContent = self.type == 'email'?this.subBlock.eEmail.getSendValue().emailContent:this.subBlock.eBoth.eEmail.getSendValue().emailContent;

                let previewEmail = new PreviewEmail({
                    type:'merge',
                    both:self.type == 'both',
                    obj:$('#sendInform .previewEmail'),
                    url:self.config.type != 'examinee'?dalTemplate.previewInformExaminer:dalTemplate.previewInformExaminee,
                    smsUrl:self.config.type != 'examinee'?dalTemplate.previewInformExaminer:dalTemplate.previewInformExaminee,
                    data:self.config.type != 'examinee'?data:_.extend(self.config,data)
                })
                previewEmail.on('remove',()=>{
                    if(self.type == 'both')
                        $('#sendInform .editBoth,#sendInform .win-action').addClass('active')
                    else
                        $('#sendInform .editEmail,#sendInform .win-action').addClass('active')
                })

            //预览-发送短信
            }else if(self.type == 'mess'){
                if(self.config.type == 'examiner'){          //考官
                    var ids = (Array.from($('.editMess .examiner .account'),(v)=>{
                        return $(v).data('account')
                    })).join()
                    data.ids = ids || '';
                }else{                                         //考生
                    data.ids = self.config.ids || '';
                }
                data.smsContent = this.subBlock.eMess.getSendValue().smsContent;
                let previewMess = new PreviewMess({
                    type:'merge',
                    obj:$('#sendInform .previewMess'),
                    url:self.config.type != 'examinee'?dalTemplate.previewInformExaminer:dalTemplate.previewInformExaminee,
                    data:self.config.type != 'examinee'?data:_.extend(self.config,data)
                })
                previewMess.on('remove',()=>{
                    $('#sendInform .editMess,#sendInform .win-action').addClass('active')
                })
            }
        }).on('click','.win-action .cancel',()=>{
            self.modal.close()
        }).on('click',(e)=>{
            if($(e.target).parents('.cui-options').length==0 && $('#sendInform').find('.cui-selectBoxContainer').hasClass('active')){
                $('#sendInform').find('.cui-selectBoxContainer').removeClass('active').find('.cui-options').hide()
            }
        })

        for(let v of self.radioGroup){   //切换tab

            v.on('click','.cui-radioContainer',(e)=>{
                if($(e.currentTarget).find('label').hasClass('readOnly')){
                    return;
                }
                let name = $(e.currentTarget).find('input').attr('name'),
                    _i = name == 'email'?0:name == 'mess'?1:2,
                    $el;
                self.type = $(e.currentTarget).find('input').val();

                if(self.type == 'email'){
                    $el = $('#sendInform>.editEmail')
                    $('#sendInform>.editEmail').addClass('active');
                    $('#sendInform>.editBoth,#sendInform>.editMess').removeClass('active');
                }else if(self.type == 'mess'){
                    $el = $('#sendInform>.editMess')
                    $('#sendInform>.editMess').addClass('active').removeClass('bor');
                    $('#sendInform>.editBoth,#sendInform>.editEmail').removeClass('active');
                }else{
                    $el = $('#sendInform>.editBoth')
                    $('#sendInform>.editBoth').addClass('active');
                    $('#sendInform>.editBoth .win-main:eq(2)').addClass('active bor');
                    $('#sendInform>.editEmail,#sendInform>.editMess').removeClass('active bor');
                }
                if(self.config.type == 'examiner'){
                    if($el.find('.examiner .account').length>0){
                        $('.win-action .send  ,.win-action .preview').removeClass('vaild')
                    }
                    else{
                        $('.win-action .send  ,.win-action .preview').addClass('vaild')
                    }
                }

            })
        }
    }
}
export default SendInform
