/*
* @Author: sihui.cao
* @Date:   2017-02-07 14:29:01
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-02-27 15:43:25
*/

'use strict';
import '../../components/share/hfCommon'
import './warnTip.less'

import cui from 'c-ui'

import session from '../../dao/sessionContext'


$(()=>{
    $('input[type=radio],input[type=checkbox]').each((i,v)=>{
        v.checked = false;
    })
    let checkboxes = Array.from($('.cui-checkboxContainer'),(v)=>new cui.Checkbox($(v)));

    $('.confirm').on('click','.cui-button',()=>{
        if(!checkboxes[0].getValue()){
            cui.popTips.warn('请阅读温馨提示')
            return;
        }
        location.href='/exam/userInfo';
    })
})
