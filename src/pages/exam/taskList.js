/*
* @Author: sihui.cao
* @Date:   2017-02-07 17:32:18
* @Last Modified by:   zyuan
* @Last Modified time: 2017-03-08 21:02:17
*/

'use strict';
import '../../components/share/hfCommon'
import './taskList.less'

import cui from 'c-ui'
import juicer from 'juicer'
import session from '../../dao/sessionContext'
import tips from '../../components/tips/deleteTip'
import WarnTip from '../../components/tips/warnTip'
import SuccessTip from '../../components/tips/successTip'
import moment from 'moment'
import cookie from 'cookie_js'
import {
    FormOptions
} from '../../components/share/tools';

$(()=>{
    $('.todo').on('click',(e)=>{
        if($(e.target).is('.stop')){
            cui.popTips.warn($(e.target).data('tips'))
        }else{
            let taskId = $(e.target).data('taskid');
            let paperId = $(e.target).data('paperid');

            if(cookie.cookie.get('browserCurrentTime')){
                cookie.cookie.set('browserCurrentTime','')
            }

            window.location.href=`/exam/paper?taskId=${taskId}&paperId=${paperId}&pageNo=1&browserRequestTime=${moment()}`;
        }
    })
})
