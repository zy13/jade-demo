/*
* @Author: zyuan
* @Date:   2016-12-27 19:33:41
* @Last Modified by:   zyuan
* @Last Modified time: 2017-03-09 17:51:30
*/

'use strict';

import '../../components/share/hfCommon'
import './taskDetail.less'
import loading from '../../components/loading'
import {
    FormOptions
} from '../../components/share/tools';

const fo = new FormOptions();

$(()=>{

    if(($('.special-wrap').height()+100)>$(window).height()){
        $('#ex-footer').removeClass('fixed');
    }

    $('.div-loadm a').on('click',()=>{
        loading.open();
        let searchModel = new Object();
        searchModel.taskId = $('#taskId').data('value');
        searchModel.pagesize = parseInt($('#loadm').data('value'), 10)+100;
        window.location.href = `/customer/examiner/taskDetail?${fo.toPostString(searchModel)}`;
    });
})
