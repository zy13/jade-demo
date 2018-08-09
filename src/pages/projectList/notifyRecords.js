/*
 * @Author: zyuan
 * @Date:   2016-12-11 13:54:52
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-13T21:24:55+08:00
 */

'use strict';

import '../../components/share/hfCommon'
import '../../components/commonTab/style.less'
import './notifyRecords.less'

import cui from 'c-ui'
import proDao from '../../dao/projectManagement/projectList'
import HandleCheckbox from '../../components/handle-checkbox/index'
import session from '../../dao/sessionContext'
import sendTip from '../../components/tips/deleteTip'
import SuccessTip from '../../components/tips/successTip'
import {
    FormOptions
} from '../../components/share/tools';
import * as tools from '../../components/share/tools'

const fo = new FormOptions();

import ph from '../../components/share/placeholder';

class ProjectList {
    constructor() {
        this.getSendFailNum();
        this.initCheckboxes();
        this.initSelectBoxes();
        this.handleResendEmail();
        this.handleResendSms();
        this.handleExport();
        this.handleSearch();
        this.handleDate();
        // this.handleCheckBox();
        ph();
    }
    getSendFailNum() {
        let self = this;
        session.customer().then((r) => {
            let opts = tools.pageHelper.urlContext();
            opts.accessToken = r.accessToken;
            return proDao.getSendFailNum(opts)
        }).then((r) => {
            self.failNum = r.response;
            self.handleCheckBox()
        }).catch((err) => {
            console.log(err)
        })
    }
    initCheckboxes() {
        this.checkboxes = Array.from($('.log-main .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
    }
    initSelectBoxes() {
        this.selectBoxes = Array.from($('.log-search .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
    }
    getSearch() {
        return {
            ids: this.handlecheck.store.all ? '' : this.handlecheck.store.ids,
            key: encodeURIComponent($('input[name=key]').val() || ''),
            projectId: this.selectBoxes[0].getValue() ? this.selectBoxes[0].getValue().value : $('#projectId').val(),
            roleId: $('.role a.cur').data('value') || '',
            searchType: this.selectBoxes[2].getValue() ? this.selectBoxes[2].getValue().value : $('.searchType').val(),
            sendDateBegin: $('.sendDateBegin').val() || '',
            sendDateEnd: $('.sendDateEnd').val() || '',
            sendStatus: $('.sendStatus a.cur').data('value') || '',
            taskId: this.selectBoxes[1].getValue() ? this.selectBoxes[1].getValue().value : $('#taskId').val()
        }
    }
    handleResendEmail() {
        let self = this;
        $('.resendEmail').on('click', () => {

            if (!self.handlecheck.store.all && !self.handlecheck.store.ids) {
                return cui.popTips.warn('请选择帐号')
            }
            let opts = self.getSearch()
            let fn = () => {
                session.customer().then((r) => {
                    opts.accessToken = r.accessToken
                    return proDao.handleReSendEmail(opts)
                }).then((r) => {
                    if (r && r.code == 0) {
                        self.handlecheck.destory()
                        new SuccessTip('发送成功', null, true, 800)
                    } else {
                        cui.popTips.error(r.message || '发送失败')
                    }
                }).catch((err) => {
                    cui.popTips.error('系统异常');
                    console.log(err)
                })
            }
            let data = {
                title: '发送提示',
                content: '请确认是否重新发送通知！',
                isAuto: false
            }

            new sendTip(fn, data, true);


        })
    }
    handleCheckBox() {
        if ($('#sendType').val() == '0') {
            this.handlecheck = new HandleCheckbox({
                name: 'emailNotify',
                $count: $('.log-main-action .seled span'),
                total: this.failNum || 0,
                checkboxes: this.checkboxes
            })
        } else {
            this.handlecheck = new HandleCheckbox({
                name: 'smsNotify',
                $count: $('.log-main-action .seled span'),
                total: this.failNum || 0,
                checkboxes: this.checkboxes
            })
        }
    }
    handleResendSms() {
        let self = this;
        $('.resendSms').on('click', () => {

            if (!self.handlecheck.store.all && !self.handlecheck.store.ids) {
                return cui.popTips.warn('请选择帐号')
            }
            let opts = self.getSearch()
            let fn = () => {
                session.customer().then((r) => {
                    opts.accessToken = r.accessToken
                    return proDao.handleReSendSms(opts)
                }).then((r) => {
                    if (r && r.code == 0) {
                        self.handlecheck.destory()
                        new SuccessTip('发送成功', null, true, 800)
                    } else {
                        cui.popTips.error(r.message || '发送失败')
                    }
                }).catch((err) => {
                    cui.popTips.error('系统异常');
                    console.log(err)
                })
            }
            let data = {
                title: '发送提示',
                content: '请确认是否重新发送通知！',
                isAuto: false
            }
            new sendTip(fn, data);

        })
    }
    handleExport() {
        $('.export').on('click', () => {
            session.customer().then((r) => {
                let opts = {
                    sendType: $('.sendType').val(),
                    accessToken: r.accessToken
                }
                return proDao.handleExport(opts);
            }).catch(() => {
                return cui.popTips.error('网络出错')
            })

        })
    }
    handleSearch() {
        $('.search-filter').on('click', '.btn', () => {
            this.handleCommonData();
        }).on('click', '#project .cui-options li', (e) => {
            $('#projectId').val($(e.currentTarget).data('value'));
            $('.projectName').text($(e.currentTarget).text());
            this.handleCommonData();
        }).on('click', '#task .cui-options li', (e) => {
            $('#taskId').val($(e.currentTarget).data('value'));
            this.handleCommonData();
        })
    }
    handleCommonData() {
        let searchModel = new Object();
        searchModel.projectName = encodeURIComponent($('.projectName').text() || '');
        searchModel.projectId = this.selectBoxes[0].getValue() ? this.selectBoxes[0].getValue().value : $('#projectId').val();
        searchModel.taskId = this.selectBoxes[1].getValue() ? this.selectBoxes[1].getValue().value : $('#taskId').val();
        searchModel.searchType = this.selectBoxes[2].getValue() ? this.selectBoxes[2].getValue().value : $('.searchType').val();
        searchModel.sendType = $('.sendType').val() || 0;
        searchModel.key = encodeURIComponent($('input[name=key]').val() || '');
        searchModel.roleId = $('.role a.cur').data('value') || '';
        searchModel.sendStatus = $('.sendStatus a.cur').data('value') || '';
        searchModel.sendDateBegin = $('.sendDateBegin').val() || '';
        searchModel.sendDateEnd = $('.sendDateEnd').val() || '';
        window.location.href = `/customer/projectList/notifyRecords?${fo.toPostString(searchModel)}`;
    }
    handleDate() {
        $('.addonRight').on('click', () => {
            $('.sendDate').focus();
        })
    }
}

$(() => {
    new ProjectList();

    $('.log-item .ctrHeight').each((i, v) => {
        let spanH = $(v).find('span').height();

        if (spanH > 63) {
            $(v).addClass('after')
        }
    })
})
