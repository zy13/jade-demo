/*
* @Author: zyuan
* @Date:   2016-12-19 16:43:46
* @Last Modified by:   zyuan
* @Last Modified time: 2016-12-19 19:24:54
*/

'use strict';

import '../../components/share/hfCommon'
import '../../components/commonTab/style.less'
import './importLog.less'

import cui from 'c-ui'
import session from '../../dao/sessionContext'

import examineeInfoDao from '../../dao/projectManagement/examineeInfo'

class ImportLog {
    constructor(){
        this.getContext();
        this.handleErrorLog();
    }
    getContext() {
        let self = this;
        session.customer().then((res) => {
            self.context = res;
        })
    }
    handleErrorLog(){
        $('.btn.import-notice').on('click',()=>{
            if(!this.context){
                return cui.popTips.error('网路错误')
            }else{
                let opts={
                    accessToken: this.context.accessToken,
                    projectId: $('#projectId').data('projectid'),
                    taskId: $('#taskId').data('taskid')
                }
                examineeInfoDao.exportErrorLog(opts)
            }
        })
    }
}

let impotLogIns = new ImportLog();
