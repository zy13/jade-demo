/*
 * @Author: zyuan
 * @Date:   2017-01-05 20:40:27
 * @Last Modified by:   zyuan
 * @Last Modified time: 2017-03-16 11:57:25
 */

'use strict';

import '../../components/share/layoutM'
import './warnTip.less'

import $ from 'jquery'
import cui from 'c-ui'
import session from '../../dao/sessionContext'

class WarnTip {
    constructor() {
        this.init()
    }
    init() {
        $('input[type=checkbox]').each((i,v)=>{
            v.checked = false;
        })
        this.ckBox = Array.from($('.p-group .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
        this.handleEvents();
    }
    handleEvents() {
        $('.div-body .a-button').on('click', () => {
            session.user().then((res) => {
                if (res && res.accessToken) {
                    if (this.ckBox[0].getValue()) {
                        window.location.href = '/exam/userInfo?isEditUserInfo=true'
                    }else{
                        cui.popTips.warn('请阅读温馨提示')
                    }
                } else {
                    return cui.popTips.warn('网络错误！');
                }
            });
        });
    }
}
let warnTipIns = new WarnTip();
