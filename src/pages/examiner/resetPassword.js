/*
* @Author: zyuan
* @Date:   2017-01-22 13:35:28
* @Last Modified by:   zyuan
* @Last Modified time: 2017-02-23 11:24:47
*/

'use strict';

import '../../components/share/hfCommon'
import './resetPassword.less'

import cui from 'c-ui'
import $ from 'jquery'
import session from '../../dao/sessionContext'
import adminDao from '../../dao/administratorSetting/admin'
import SuccessTip from '../../components/tips/successTip'

class ResetPswDemo{
    constructor(){
        this.init();
    }
    init(){
        this.txtBox = Array.from($('.cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.handleEvents();
    }
    handleEvents() {
        $('.cui-button.preset-blue').on('click', () => { //保存密码
            session.customer().then((res) => {
                if (res && res.accessToken) {
                    let validate = true;

                    //validate
                    this.txtBox.map((i,v)=>{
                        if(!i.getValue()){
                            i.$el.find('input').focus().blur();
                            validate = false;
                        }else{
                            if(v > 0 && i.getValidate()){
                                // let reg = /([0-9]+[a-z,A-Z]+)|([a-z,A-Z]+[0-9]+)|/g;
                                let reg = /^(?![^a-zA-Z]+$)(?!\d+$)(?![^;:'",_`~@#%&\{\}\[\]\|\\\<\>\?\/\.\-\+\=\!\$\^\*\(\)]+$).{6,}$/g;
                                if(!reg.test(i.getValue())){
                                    i.setValidate(false,'必须包含数字字母以及特殊字符');
                                    validate = false;
                                }
                            }

                            if(v==2 && this.txtBox[1].getValue()!=i.getValue()){
                                i.setValidate(false,'与新密码不一致');
                                this.txtBox[1].setValue('');
                                this.txtBox[2].setValue('');
                                validate = false;
                            }
                        }
                    })

                    if(validate){
                        let opts = {
                            accessToken: res.accessToken,
                            password: this.txtBox[1].getValue(),
                            oldPassword: this.txtBox[0].getValue(),
                            id: res.userId
                        }
                        adminDao.resetPwd(opts).then((res)=>{
                            if(res && res.code==0){
                                new SuccessTip('修改成功！')
                                setTimeout(()=>{
                                    window.location.href='/customer/login';
                                },2000)
                            }else{
                                if(res.code == 28002003){
                                    this.txtBox[0].setValue('');
                                    this.txtBox[1].setValue('');
                                    this.txtBox[2].setValue('');
                                }
                                return cui.popTips.warn(res.message)
                            }
                        }).catch((err)=>{
                            return cui.popTips.error('服务器错误')
                        })
                    }
                } else {
                    return cui.popTips.warn('登录失效！');
                    setTimeout(()=>{
                        window.location.href='/customer/login'
                    },3000)
                }
            });
        });
    }
}
let resetPswDemoIns = new ResetPswDemo();
