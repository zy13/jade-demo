/*
* @Author: sihui.cao
* @Date:   2017-02-07 15:47:49
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-05-04 13:56:03
*/

'use strict';
import '../../components/share/hfCommon'
import './userInfo.less'

import cui from 'c-ui'
import session from '../../dao/sessionContext'
import examDao from '../../dao/projectManagement/examineeInfo'
import moment from 'moment'
import loading from '../../components/loading/index'
class UserInfo {
    constructor() {
        this.init();
    }
    init() {

        this.textBoxs = Array.from($('.cui-textBoxContainer'), (v) => new cui.TextBox($(v))) || ''; //输入框
        this.radios = Array.from($('.cui-radioGroupContainer'), (v) => new cui.RadioGroup($(v))) || ''; //gender
        this.selectBoxes = Array.from($('.cui-selectBoxContainer'), (v) => new cui.SelectBox($(v))) || '';//下拉框
        this.initField();
        this.handleEvents();
    }
    verity(){
        let validate = true;
        this.textBoxs.map((i, v) => {
            let _validate = i.getValidate() && !i.$el.find('input').is('failure')
            if (!_validate) {
                i.$el.find('input').focus().blur();
                validate = validate && _validate;
            }
        })
        return validate
    }
    initField(){
        $('.item .field').each((i,v)=>{
            if($(v).height()>44){
                $(v).addClass('ellipsis')
            }
        })
    }
    handleEvents() {
        $('.confirm').on('click', '.cui-button', () => {
            if(!this.verity()){
                return;
            }
            let validate = true,
                sjsonStr = '{';
            //处理输入框
            if (this.textBoxs!=undefined && this.textBoxs.length) {
                this.textBoxs.map((i, v) => {
                    if (i.getValue()) {
                        sjsonStr += "\"" + i.$el.find('input').attr('name') + "\":";
                        sjsonStr += "\"" + i.getValue() + "\",";
                    }
                    if (!i.getValidate()) {
                        i.setValidate(false,i.$el.data('tips'));
                    }
                    validate = validate && i.getValidate();
                });
            }
            //处理下拉框
            if(this.selectBoxes!=undefined && this.selectBoxes.length){

                this.selectBoxes.map((i, v) => {
                    let value = (i.getValue()&&i.getValue().value)||i.$el.find('.result').text()
                    if(value){
                         sjsonStr += "\"" + i.$el.data('name') + "\":";
                         sjsonStr += "\"" + value + "\",";
                    }else{
                        if (i.$el.data('ismandatory') == 1) { //必填项
                            validate = false;
                            let fieldName = i.$el.data('fieldname')
                            cui.popTips.warn(`请选择${fieldName}`);
                            return;
                        }
                    }
                })
            }

            //处理radio
            if (this.radios!=undefined && this.radios.length) {
                if (this.radios[0].getValue()) {
                    sjsonStr += "gender:";
                    sjsonStr += "\"" + this.radios[0].getValue() + "\",";
                } else {
                    if (this.radios[0].$el.data('ismandatory') == 1) { //必填项
                        validate = false;
                        cui.popTips.warn(`请选择性别`);
                        return;
                    }
                }
            }
            if (!validate){
                return;
            }
            loading.open()
            session.user().then((res) => {
                sjsonStr += "id:";
                sjsonStr += "\"" + res.userId + "\",";
                sjsonStr += "companyId:";
                sjsonStr += "\"" + res.companyId + "\",";
                sjsonStr = sjsonStr.substring(0, sjsonStr.length - 1) + "}";

                let opts = {
                    accessToken: res.accessToken,
                    userId: res.userId,
                    jsonStr: sjsonStr
                }

                examDao.editUserInfo(opts).then((res) => {
                    loading.close()
                    if (res && res.code == 0) {
                        $.ajax({
                            type: 'post',
                            url: '/exam/session/update',
                            data: {
                                name: $('input[name=name]').val()
                            }
                        }).done((res)=>{
                            window.location.href = '/exam/taskList'
                        })

                    } else {
                        return cui.popTips.warn(res.message)
                    }
                }).catch((err)=>{
                    loading.close()
                    return cui.popTips.warn('网络错误！')
                })
            })
        })

    }
}

let unserInfoIns = new UserInfo();
