/*
* @Author: sihui.cao
* @Date:   2017-01-19 14:41:16
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-02-07 17:29:58
*/

'use strict';
import './logout.less'

$(()=>{
    let count = 3,
        timer = null;

    timer = setInterval(()=>{
        count--
        $('.count span').text(count)
        if(count==0){
            clearInterval(timer)
            let path = $('#path').val()?$('#path').val():"/customer/login"
            window.location.href=path
        }
    },1000)
})
