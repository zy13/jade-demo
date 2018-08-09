/*
* @Author: zyuan
* @Date:   2016-12-23 09:14:57
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-03-06 19:44:46
*/

'use strict';

import '../../components/share/hfCommon'
import './findPassword.less'

import $ from 'jquery'
import cui from 'c-ui'
import loginDao from '../../dao/user/login'
import loading from '../../components/loading/index'

class FindPswDemo {
    constructor(){
        this.init();
    }
    init(){
        this.textBox = Array.from($('.cui-container .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.initCode = $('.vcode').data('token');
        this.handleInput();
    }
    handleInput(){

        $('.cui-container').on('click','.next',(e)=>{
            let validate = true;
            let validateCode;
            //validate
            this.textBox.map((i, v) => {
                if (!i.getValue()) {
                    $('.cui-container .cui-textBoxContainer').find('input').focus().blur();
                }else{
                    if(v == 1){
                        if(!i.getValidate()){
                            i.setValidate(false, '邮箱格式错误！');
                        }
                    }
                    if (v == 2) {
                        validateCode = i.getValue();
                        /*if (i.getValue().toUpperCase() != this.initCode.toUpperCase()) {
                            i.setValidate(false, '验证码错误！');
                            validate = false;
                        }*/
                    }
                }
                validate = validate && i.getValidate();
            })

            if(validate) {
                loading.open()
                $.ajax({
                    type: 'post',
                    url: '/customer/user/findPassword/validateValidateCode',
                    data: {
                        validateCode: validateCode
                    }
                }).done((res) => {
                    if (res && res.status) {
                        if (!res.isValidate) {
                            loading.close()
                            //self.textBox[2].setValidate(false, '验证码错误！');
                            $('.findPsValidateCode').val("");
                            $('.change').click();
                            return cui.popTips.error(res.message)
                        } else {
                            let opts = {
                                account: this.textBox[0].getValue(),
                                email: this.textBox[1].getValue()
                            }
                            loginDao.finsPassword(opts).then((res)=>{
                                if(res&&res.code==0){
                                    if(res.bizError){
                                        loading.close()
                                        return cui.popTips.warn(res.message)
                                    }else{
                                        location.href = '/customer/user/findPassword/finish'
                                    }
                                }else{
                                    loading.close()
                                    if(res && (res.code=="27003003" || res && res.code=="27003005")){
                                        $('.findPsAccount').val("");
                                        $('.findPsEmail').val("");
                                        $('.findPsValidateCode').val("");
                                        $('.change').click();
                                    }
                                    return cui.popTips.error(res.message)
                                }
                            })
                        }
                    } else {
                        loading.close()
                        return cui.popTips.error(res.message || '网络错误！')
                    }
                })

            }

        })
        /*.on('click','.change',()=>{//获取图片二维码
            this.handleChangeCkcode();
        })*/
    }
    handleChangeCkcode() {
        loginDao.getValidateCode().then((res) => {
            if (res && res.code == 0) {
                this.initCode = res.response.code;
            } else {
                return cui.popTips.error(res.message)
            }
        }).catch((err) => {
            return cui.popTips.console.error('网络错误！')
        })
    }

}
let  findpswIns = new FindPswDemo();
