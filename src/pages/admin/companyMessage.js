/*
* @Author: sihui.cao
* @Date:   2016-12-06 14:18:10
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-03-05 15:32:49
*/

'use strict';


import cui from 'c-ui'
import dalCompanyMessage from '../../dao/administratorSetting/companyMessage'
import SuccessTip from '../../components/tips/successTip'
import Loading from '../../components/loading/index'
import session from '../../dao/sessionContext'
import ajaxFileUpload from '../../components/ajaxFileUpload/index'
import '../../components/share/hfCommon'

import '../../components/commonTab/style.less'
import './companyMessage.less'



class CompanyMessage {
    constructor(){
        this.textboxes = Array.from($('.cui-textBoxContainer'), (v) => new cui.TextBox($(v)) )
        this.selectBoxes = Array.from($('.cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)) )
        this.watch()
    }

    getValue(){
        var data = {
            file:'companyLogo',
            companyName: $.trim(this.textboxes[0].getValue()),
            industryId: $.trim(this.selectBoxes[0].getValue() != null?this.selectBoxes[0].getValue().value:$('.btns .sure').data('id')),
            industryName: $.trim(this.selectBoxes[0].getValue() != null?this.selectBoxes[0].getValue().text:$('.btns .sure').data('name'))
        }
        return data;
    }
    verity(){
        var self = this , validate = true;
        for (var i = 0; i < self.textboxes.length; i++) {
            if (!self.textboxes[i].getValidate()) {
                self.textboxes[i].$el.find('input').focus().blur();
                validate = false;
            }
        }
        return validate;
    }
    watch(){
        var self = this;
        $('.btns .sure').on('click',()=>{
            if(this.verity()){
                session.customer().then((r)=>{
                    let data = self.getValue();
                    data.accessToken = r.accessToken;
                    return dalCompanyMessage.editCompanyMessage('companyLogo',data)
                }).then((res) => {
                    if(res.code == 0){
                        new SuccessTip('修改成功',null,true);
                    }
                    else{
                        cui.popTips.error(res.message)
                        setTimeout(()=>{
                            window.location.reload();
                        },1000)
                    }
                }).catch((err) => {
                    $('.file-name').val('')
                    console.log('出错啦')
                    setTimeout(()=>{
                        window.location.reload();
                    },1000)
                })
            }
        })


        $(".file").on("change",(e)=>{
            if($(e.target).val()){
                var file = e.target.files?e.target.files[0]:$(e.target).val();
                var fileName = e.target.files?file.name:file.slice(file.lastIndexOf("\\")+1);
                $(".file-name").val(fileName);
            }else{
                $(".file-name").val('');
            }

        })
    }
}

new CompanyMessage()
