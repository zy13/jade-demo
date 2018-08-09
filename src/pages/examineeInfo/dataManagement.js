/*
 * @Author: sihui.cao
 * @Date:   2016-12-19 20:37:14
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-03-13T11:48:31+08:00
 */

'use strict';
import cui from 'c-ui'

import SuccessTip from '../../components/tips/successTip'
import WarmTip from '../../components/tips/warnTip'
import session from '../../dao/sessionContext'
import moment from 'moment'
import dalTemplate from '../../dao/projectManagement/template'
import dao from '../../dao/projectManagement/examineeInfo'
import '../../components/share/hfCommon'

import '../../components/commonTab/style.less'
import './dataManagement.less'
import {
    FormOptions
} from '../../components/share/tools';
import * as tools from '../../components/share/tools'
import ph from '../../components/share/placeholder';

const fo = new FormOptions();
class DataManagement {
    constructor() {
        this.watch();
        ph();
    }
    watch() {
        let sortCount = 0,
            getState = false;
        $('.temple-wrap').on('click', '#createdExportPaper', (e) => { //生成全部详细试卷
            if (getState)
                return;

            $('.cui-popTips').remove()
            if ($(e.target).is('.creating')) {
                if ($(e.target).data('message'))
                    return cui.popTips.error($(e.target).data('message'))
                return cui.popTips.warn($(e.target).data('message') || '正在生成中，请稍安勿躁')
            }

            $(e.target).addClass('creating')
            getState = true;
            session.customer().then((res) => {
                setTimeout(()=>{
                    if(getState)
                        new SuccessTip('请求中，请稍候');
                },800)

                dao.createdExportDetailPaper({
                    accessToken: res.accessToken,
                    taskId: $('#taskId').data('taskid'),
                    paperId: $('#paperId').data('paperid')
                }).then((res) => {
                    getState = false;
                    if (res && res.code == 0) {
                        new SuccessTip('正在生成中', null, true);
                    } else {
                        $(e.target).data('message', res.message)
                        return cui.popTips.error(res.message)
                    }

                }).catch((err) => {
                    $(e.target).removeClass('creating')
                    return cui.popTips.error('服务器繁忙，请稍后再试!')
                })
            }).catch((err) => {
                $(e.target).removeClass('creating')
                return cui.popTips.error('网络错误!')
            })
        }).on('click', '#exportPaper', (e) => { //导出全部详细试卷
            session.customer().then((res) => {
                dao.exportDetailPaper({
                    accessToken: res.accessToken,
                    taskId: $('#taskId').data('taskid')
                }).then().catch((err) => {
                    return cui.popTips.error('服务器繁忙，请稍后再试!')
                })
            }).catch((err) => {
                return cui.popTips.error('网络错误!')
            })
        }).on('click', '.time,.score', (e) => { //排序
            let sortFields = $(e.currentTarget).data('type');
            if ($(e.currentTarget).is('.time')) {
                let isSortas = false;
                if (sortFields.trim() == 'end_time asc'.trim() || !sortFields) {
                    isSortas = true;
                }
                if (sortFields.trim() == 'end_time desc'.trim()) {
                    isSortas = false;
                }
                sortFields = isSortas ? 'end_time desc' : 'end_time asc'
            }
            if ($(e.currentTarget).is('.score')) {
                let isSortas = false;
                if (sortFields.trim() == 'total_score asc'.trim() || !sortFields) {
                    isSortas = true;
                }
                if (sortFields.trim() == 'total_score desc'.trim()) {
                    isSortas = false;
                }
                sortFields = isSortas ? 'total_score desc' : 'total_score asc'
            }

            let searchModel = new Object(),
                pageSize = tools.pageHelper.urlContext()['pagesize']
            searchModel.projectId = $('#projectId').data('projectid');
            searchModel.taskId = $('#taskId').data('taskid');
            searchModel.projectName = encodeURIComponent($('.tpl-nav .projectName').data('pname'));
            searchModel.taskName = encodeURIComponent($('.tpl-nav .taskName').data('tname'));
            searchModel.sortFields = sortFields;
            if (pageSize)
                searchModel.pagesize = pageSize;

            window.location.href = '/customer/examineeInfo/dataManagement' + `?${fo.toPostString(searchModel)}`;
        })
    }

}

new DataManagement();
