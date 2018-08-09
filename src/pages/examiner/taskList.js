/*
* @Author: zyuan
* @Date:   2016-12-27 14:00:18
* @Last Modified by:   zyuan
* @Last Modified time: 2017-03-09 18:18:52
*/

'use strict';

import '../../components/share/hfCommon'
import './taskList.less'

$(()=>{
    if(($('.special-wrap').height()+100)>$(window).height()){
        $('#ex-footer').removeClass('fixed');
    }
})
