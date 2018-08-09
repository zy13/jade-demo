/*
 * @Author: zyuan
 * @Date:   2016-12-14 16:14:12
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-13T11:54:30+08:00
 */

'use strict';

import '../../components/share/hfCommon'
import '../../components/commonTab/style.less'
import './accountManagement.less'
import loading from '../../components/loading/index'
import cui from 'c-ui'
import session from '../../dao/sessionContext'
import EditAccount from './mod/edit_account'
import CreateAccount from './mod/create_account'
import AddSelectBox from './mod/add_selectBox'
import RestPsw from './mod/reset_psw'
import SendInform from '../../components/sendInform/index'
import HandleCheckbox from '../../components/handle-checkbox/index'
import examineeInfoDao from '../../dao/projectManagement/examineeInfo'
import setGlobalDao from '../../dao/projectManagement/setGlobalAccount'
import SuccessTip from '../../components/tips/successTip'
import WarnTip from '../../components/tips/warnTip'
import Del from '../../components/tips/deleteTip'
import {
    FormOptions
} from '../../components/share/tools';
import * as tools from '../../components/share/tools';
const fo = new FormOptions();
import ph from '../../components/share/placeholder';

class AccountManagement {
    constructor() {
        this.count = 1;
        this.localStatus = true;
        this.init();
        ph();
    }
    init() {
        this.maintxtBox = Array.from($('.search-ent .cui-checkboxContainer'), (v) => new cui.TextBox($(v)));
        this.checkboxes = Array.from($('.main-action .cui-checkboxContainer,.mainInfo .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
        this.selectBoxes = Array.from($('.search-filter .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
        this.handlecheckbox = new HandleCheckbox({
            name: 'examinee',
            $count: $('.seled span'),
            total: parseInt($('#total').val()) || 0,
            checkboxes: this.checkboxes
        });

        this.getContext();
        this.handleEvents();
    }
    getContext() {
        let self = this;
        session.customer().then((res) => {
            self.context = res;
        })
    }
    handleEvents() {
        $('.wrap').on('click', '.search-ent .st .addonRight', () => { //模拟失焦事件
            $('.search-ent .startDate').focus().blur();
        }).on('click', '.search-ent .en .addonRight', (e) => {
            $('.search-ent .endDate').focus().blur();
        }).on('click', '.item .edit-account', (e) => { //编辑帐号
            let $this = $(e.currentTarget);

            loading.open();
            if (!this.context) {
                return cui.popTips.error('网络出错')
            } else {
                let data = {
                    accessToken: this.context.accessToken,
                    projectId: $('#projectId').data('id'),
                    taskId: $('#taskId').data('id'),
                    userId: parseInt($(e.currentTarget).closest('.item').find('.cui-checkboxContainer').attr('id'), 10)
                }
                new EditAccount(data)
            }
        }).on('click', '.btn.create-account', (e) => { //创建帐号
            let $this = $(e.currentTarget);

            loading.open();
            this.commonSwitch(2, $this);
            if (!this.context) {
                return cui.popTips.error('网络出错')
            } else {
                let data = {
                    accessToken: this.context.accessToken,
                    projectId: $('#projectId').data('id'),
                    taskId: $('#taskId').data('id')
                }
                new CreateAccount(data)
            }
        }).on('click', '.search-ent .btn', () => { //搜索
            this.commonSearch();
        }).on('click', '.common-status .status a', (e) => { //状态搜索

            let $this = $(e.currentTarget);

            if ($this.data('value')) {
                if (!$this.is('.cur')) {
                    $this.addClass('cur');
                } else {
                    $this.removeClass('cur');
                }
            } else {
                $this.addClass('cur').siblings('a').removeClass('cur');
            }
            this.commonSearch();

        }).on('click', '.cmctWay a', (e) => { //通信方式搜索
            let $this = $(e.currentTarget);

            if ($this.data('value')) {
                if (!$this.is('.cur')) {
                    $this.addClass('cur');
                } else {
                    $this.removeClass('cur');
                }
            } else {
                $this.addClass('cur').siblings('a').removeClass('cur');
            }
            this.commonSearch();

        }).on('click', '.cmctStatus a', (e) => { //通信状态搜索
            let $this = $(e.currentTarget);

            if ($this.data('value')) {
                if (!$this.is('.cur')) {
                    $this.addClass('cur');
                } else {
                    $this.removeClass('cur');
                }
            } else {
                $this.addClass('cur').siblings('a').removeClass('cur');
            }
            this.commonSearch();

        }).on('click', '.btn.seta', (e) => { //帐号信息设定
            let $this = $(e.currentTarget);
            this.localStatus = true;
            this.commonSwitch(1, $this);
            this.handleAccountInfo();
        }).on('click', '.btn.remove-acount', (e) => { //移除帐号
            let $this = $(e.currentTarget);
            let delData = this.getSearch();

            this.commonSwitch(2, $this);

            if (!this.context) {
                return cui.popTips.error('网络出错')
            } else {
                /**
                let selected = false;
                for (let v of this.checkboxes) {
                    if (v.getValue())
                        selected = true;
                }
                if (!selected) {
                    cui.popTips.warn('请选择考生')
                    return;
                }**/
                //有删除考生才弹框
                let num = this.getSelectAccountNum();
                if (num == 0) {
                    cui.popTips.warn('请选择考生')
                    return;
                }
                let opts = {
                    accessToken: this.context.accessToken,
                    cmctStatus: delData.cmctStatusStr,
                    cmctWay: delData.cmctWayStr,
                    ids: delData.ids,
                    key1Begin: delData.key1Begin,
                    key1End: delData.key1End,
                    key2: delData.key2,
                    projectId: $('#projectId').data('id'),
                    searchType1: 'createTime',
                    searchType2: delData.searchType2,
                    status: delData.statusStr,
                    taskId: $('#taskId').data('id')
                }
                let fn = () => {
                    examineeInfoDao.deleteAccount(opts).then((res) => {
                        if (res && res.code == 0) {
                            this.handlecheckbox.delete(opts.ids)
                            new SuccessTip('删除成功', '', true, 1000)
                        } else {
                            return cui.popTips.error(res.message)
                        }
                    })
                }
                let data = {
                    isReload: true,
                    isAuto: false
                }
                new Del(fn, data)
            }

        }).on('click', '.btn.reset-psw', (e) => { //重置密码
            let $this = $(e.currentTarget);
            let resetData = this.getSearch();

            this.commonSwitch(2, $this);

            if (!this.context) {
                return cui.popTips.error('网络出错')
            } else {
                /**
                let selected = false;
                for (let v of this.checkboxes) {
                    if (v.getValue())
                        selected = true;
                }
                if (!selected) {
                    cui.popTips.warn('请选择考生')
                    return;
                }**/
                //有考生才弹框
                let num = this.getSelectAccountNum();
                if (num == 0) {
                    cui.popTips.warn('请选择考生')
                    return;
                }
                let opts = {
                    accessToken: this.context.accessToken,
                    cmctStatus: resetData.cmctStatusStr,
                    cmctWay: resetData.cmctWayStr,
                    ids: resetData.ids,
                    key1Begin: resetData.key1Begin,
                    key1End: resetData.key1End,
                    key2: resetData.key2,
                    projectId: $('#projectId').data('id'),
                    searchType1: 'createTime',
                    searchType2: resetData.searchType2,
                    status: resetData.statusStr,
                    taskId: $('#taskId').data('id')
                }
                new RestPsw(opts);
            }
        }).on('click', '.btn.export-acount', (e) => { //导出全部帐号
            let $this = $(e.currentTarget);
            let exportData = this.getSearch();

            this.commonSwitch(2, $this);

            if (!this.context) {
                return cui.popTips.error('网络出错')
            } else {
                if (this.btn_disabled) return false;
                else this.btn_disabled = true;
                let opts = {
                    accessToken: this.context.accessToken,
                    cmctStatus: exportData.cmctStatusStr,
                    cmctWay: exportData.cmctWayStr,
                    key1Begin: exportData.key1Begin,
                    key1End: exportData.key1End,
                    key2: exportData.key2,
                    projectId: $('#projectId').data('id'),
                    searchType1: 'createTime',
                    searchType2: exportData.searchType2,
                    status: exportData.statusStr,
                    taskId: $('#taskId').data('id')
                };

                examineeInfoDao.exportAllAccounts(opts).then(() => {}).catch((err) => {
                    return cui.popTips.error('网络错误')
                })

                $this.addClass('btn-disabled').removeClass('cur')
                setTimeout(() => {
                    $this.removeClass('btn-disabled');
                    this.btn_disabled = false;
                }, 2500)
            }
        }).on('click', '.btn.send-notice', (e) => {
            let $this = $(e.currentTarget)

            this.commonSwitch(2, $this);
            this.sendInform();
        })
    }
    handleAccountInfo() {
        this.ckboxesBySelf = Array.from($('.setAccountInfo .byself .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
        this.ckboxesByMust = Array.from($('.setAccountInfo .must .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
        this.ckboxesByUnique = Array.from($('.setAccountInfo .unique .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));

        $('.setAccountInfo').on('click', '.byself .cui-checkboxContainer .delField', (e) => { //删除
            e.stopPropagation();
            let fieldKey = $(e.target).data('value');
            //弹出确认框
            new Del(() => {
                loading.open()
                session.customer().then((r) => {
                    return setGlobalDao.deleteGlobalSelectedInfo({
                        fieldKey,
                        accessToken: r.accessToken
                    })
                }).then((r) => {
                    loading.close()
                    if (r && r.code == 0) {
                        $(e.target).parent().remove();
                        $(`.must .cui-checkboxContainer input[name=${fieldKey}]`).parent().remove();
                        new SuccessTip('删除成功', null, false, 100)
                        // setTimeout(() => {
                        //     window.location.reload();
                        // }, 800)
                    } else {
                        return cui.popTips.error(r.message)
                    }

                })
            }, {
                isAuto: false
            })
        }).on('click', '.button .preset-blue', (e) => { //保存修改
            if (this.localStatus) {
                if (!this.context) {
                    return cui.popTips.error('网络出错')
                } else {
                    setTimeout(() => {
                        if ($('.setAccountInfo .byself-inputs .cui-textBoxContainer').length > 0) {
                            cui.popTips.warn('请先保存添加的字段');
                            return false;
                        }
                        let requiredKey = [],
                            showKey = [],
                            uniqueKey = [];
                        $('.item.byself .byself-inputs .cui-checkboxContainer>input[type=checkbox]:checked').map((i, v) => {
                            showKey.push($(v).attr('name'));
                        })

                        $('.item.must .inputs .cui-checkboxContainer>input[type=checkbox]:checked').map((i, v) => {
                            requiredKey.push($(v).attr('name'));
                        })
                        $('.item.unique .cui-checkboxContainer>input[type=checkbox]:checked').map((i, v) => {
                            uniqueKey.push($(v).attr('name'));
                        })

                        let opts = {
                            accessToken: this.context.accessToken,
                            requiredKey: requiredKey.join(','),
                            showKey: showKey.join(','),
                            uniqueKey: uniqueKey.join(','),
                            projectId: $('#projectId').data('id'),
                            taskId: $('#taskId').data('id')
                        }
                        /**
                        setGlobalDao.saveSettedAccount(opts).then((res) => {
                            if (res && res.code == 0) {
                                new SuccessTip('保存成功！')
                            } else {
                                return cui.popTips.error(res.message)
                            }
                        })**/
                        loading.open()
                        examineeInfoDao.saveSettedAccount(opts).then((res) => {
                            loading.close()
                            if (res && res.code == 0) {
                                new SuccessTip('保存成功！', null, true, 100)
                            } else {
                                return cui.popTips.error(res.message)
                            }

                        })
                    }, 500)
                }
            }
        }).on('click', '.button .cancel', () => { //取消
            window.location.reload();
        }).on('click', '.byself .cui-checkboxContainer input', (e) => { //添加测评者必填属性
            this.handleByselfCheckbox(e);
        }).on('click', '.item .selector', (e) => { //添加下拉框
            if ($('#isextension').data('value') == 20) {
                return cui.popTips.error('自定义属性不能超过20个')
            }
            new AddSelectBox('3');
        })

        this.handleByselfInput('.selected', 'tempInput', '1'); //可选信息-添加输入框
        this.handleByselfInput('.calendate', 'tempInput', '2'); //可选信息-添加日历
    }
    handleByselfCheckbox(e) {
        let $this = $(e.currentTarget);
        let txt = $this.closest('.cui-checkboxContainer').find('label span').text();
        let $html = $(`<div class="cui-checkboxContainer inline" title="">
                                            <input type='checkbox' name ="${$this.attr('name')}"/>
                                            <label>
                                                <i></i>
                                                <span></span>
                                            </label>
                                        </div>`);

        if ($this[0].checked) {
            $('.must .inputs .cui-checkboxContainer label span').each((i, v) => {
                if ($(v).text() == txt) {
                    $('.must .cui-checkboxContainer').eq(i).remove();
                }
            });
            $('.must .inputs').append($html);
            $html.attr('title', txt).find('label span').text(txt)
            this.ckboxesByMust.push(new cui.Checkbox($(`.must input[name=${$this.attr('name')}]`).parent()));

        } else {
            $('.must .cui-checkboxContainer label span').each((i, v) => {
                if ($(v).text() == txt) {
                    $('.must .cui-checkboxContainer').eq(i).remove();
                }
            });
        }
    }
    handleByselfInput($el, $id, type) {
        $($el).on('click', (e) => {
            if ($('#isextension').data('value') == 20) {
                return cui.popTips.error('自定义属性不能超过20个')
            }
            if ($('#' + $id).length) {
                $('#' + $id).focus().blur();
                return false;
            } else {
                let $ids = '#' + $id;
                let $idTarget = '.setAccountInfo ' + $ids;
                let $html = `<div class="cui-textBoxContainer inline" data-rule="required" id=${$id} data-tips='请输入名称'>
                                <input type="text" placeholder="请输入名称" value="" />
                                <span class='addonRight'>x</span>
                            </div>`;
                //插入输入框
                $('.byself .byself-inputs').append($html);
                this.txtboxesByMust = Array.from($('.setAccountInfo .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));

                //处理输入框
                $($idTarget).find('input[type=text]')
                    .focus().blur((e) => {
                        let tempInputText = $($idTarget).find('input[type=text]').val();
                        const _ = this;
                        if (tempInputText) {
                            let validate = true;
                            for (let i of this.ckboxesBySelf) {
                                let txt = i.$el[0].innerText;
                                if (tempInputText == txt || tempInputText == '账号') {
                                    validate = false;
                                }
                            }
                            if (validate) {
                                session.customer().then((r) => {
                                    return setGlobalDao.addSelectedInfo({
                                        accessToken: r.accessToken,
                                        fieldName: tempInputText,
                                        selectValue: '',
                                        type
                                    })
                                }).then((r) => {
                                    if (r.code == 0 && !r.bizError) {
                                        /**
                                        if (process.env.NODE_ENV == 'development')
                                            r.response = r.response + (_.count++);
                                         **/
                                        let $html = $(_.handleHtml(type, tempInputText, r.response))
                                        $('.byself .byself-inputs').append($html);
                                        $html.attr('title', tempInputText).find('label span').text(tempInputText)
                                        _.ckboxesBySelf.push(new cui.Checkbox($(`input[name=${r.response}]`).parent()));
                                        $($idTarget).remove();
                                        this.localStatus = true;
                                    } else {
                                        cui.popTips.error(r.message);
                                        this.localStatus = false;
                                        return false;
                                    }
                                })

                            } else {
                                this.txtboxesByMust[0].setValidate(false, '名称已存在')
                            }
                        }
                    })

                //删除输入框
                $($idTarget).on('click', '.addonRight', () => {
                    $($ids).remove();
                })
            }

        })
    }
    handleHtml(type, txt, name) {
        return `<div class='cui-checkboxContainer inline' title="">
                        <input type='checkbox' name='${name}' data-type='${type}'/>
                        <label>
                            <i></i>
                            <span></span>
                        </label>
                        <span class='delField' data-value='${name}'>x</span>
                    </div>`;
    }
    sendInform() {
        /**
        var selected = false;
        for (var v of this.checkboxes) {
            if (v.getValue())
                selected = true;
        }
        if (!selected) {
            cui.popTips.warn('请选择考生')
            return;
        }**/
        //有考生才弹框
        let num = this.getSelectAccountNum();
        if (num == 0) {
            cui.popTips.warn('请选择考生')
            return;
        }
        let data = this.getSearch()
        let config = {
            type: 'examinee',
            taskId: $('#taskId').data('id') || '',
            taskName: $('#taskName').val() || '',
            projectId: $('#projectId').data('id') || '',
            projectName: $('#projectName').val() || '',
            cmctStatus: data.cmctStatusStr,
            cmctWay: data.cmctWayStr,
            ids: data.ids || '',
            key1Begin: data.key1Begin,
            key1End: data.key1End,
            key2: data.key2,
            searchType1: data.searchType1,
            searchType2: data.searchType2,
            status: data.statusStr
        }

        new SendInform(config)
    }
    commonSwitch(type, $this) {
        if (type == 1) {
            $this.addClass('cur')
                .siblings('.btn').removeClass('cur');

            $('.setAccountInfo').removeClass('dis')
                .siblings('.mainInfo').addClass('dis');

            $('.pagination').addClass('dis');
        }
        if (type == 2 && !$this.is('.btn-disabled')) {
            $this.addClass('cur')
                .siblings('.btn').removeClass('cur');

            $('.mainInfo').removeClass('dis')
                .siblings('.setAccountInfo').addClass('dis');
            $('.pagination').removeClass('dis');
        }
    }
    getSearch() {
        let data = {},
            idsArr = [],
            cmctStatusStr = [],
            cmctWayStr = [],
            statusStr = []
        if (!this.checkboxes[1].getValue()) { //所有页没有勾选
            idsArr = this.handlecheckbox.getValue().split(',');
            // this.checkboxes.slice(2, this.checkboxes.length).forEach((item) => {
            //     if (item.val) {
            //         idsArr.push(item.$el[0].id)
            //     }
            // });
        }
        $('.cmctStatus .status a').each((i, v) => {
            if ($(v).is('.cur') && $(v).data('value')) {
                cmctStatusStr.push($(v).data('value'))
            }
        });
        $('.cmctWay a').each((i, v) => {
            if ($(v).is('.cur') && $(v).data('value')) {
                cmctWayStr.push($(v).data('value'))
            }
        });
        $('.common-status a').each((i, v) => {
            if ($(v).is('.cur') && $(v).data('value')) {
                statusStr.push($(v).data('value'))
            }
        });
        return data = {
            ids: idsArr.join(','),
            cmctStatusStr: cmctStatusStr.join(','),
            cmctWayStr: cmctWayStr.join(','),
            statusStr: statusStr.join(','),
            //key1Begin: Date.parse($('input[name=beginDate]').val()) || '',
            //key1End: Date.parse($('input[name=endDate]').val()) || '',
            key1Begin: $('input[name=beginDate]').val() || '',
            key1End: $('input[name=endDate]').val() || '',
            key2: $('.search-filter .key2').val() || '',
            searchType1: 'createTime',
            searchType2: this.selectBoxes[0].getValue() ? this.selectBoxes[0].getValue().value : $('.searchType2').val()
        };
    }
    commonSearch() {
        let searchData = this.getSearch();
        let searchModel = new Object();
        let projectName = $('.projectName').text();
        let taskName = $('.taskName').text();

        searchModel.key1Begin = searchData.key1Begin;
        searchModel.key1End = searchData.key1End;
        searchModel.key2 = encodeURIComponent(searchData.key2);
        searchModel.searchType1 = searchData.searchType1;
        searchModel.searchType2 = searchData.searchType2;
        searchModel.cmctStatus = searchData.cmctStatusStr;
        searchModel.cmctWay = searchData.cmctWayStr;
        searchModel.status = searchData.statusStr;
        searchModel.taskId = $('#taskId').data('id') || '';
        searchModel.projectId = $('#projectId').data('id') || '';
        searchModel.pagesize = tools.pageHelper.urlContext()['pagesize'] || 20;
        searchModel.projectName = encodeURIComponent(projectName||'');
        searchModel.taskName = encodeURIComponent(taskName||'');
        window.location.href = `/customer/examineeInfo/accountManagement?${fo.toPostString(searchModel)}`;
    }
    getSelectAccountNum() {
        const itemChk = this.checkboxes.slice(2, this.checkboxes.length);
        let slcCount = 0;
        itemChk.map((item) => item.getValue() ? slcCount++ : 0);
        return slcCount;
    }
}
let accountManagementIns = new AccountManagement();
