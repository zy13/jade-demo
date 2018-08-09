/*
 * @Author: sihui.cao
 * @Date:   2016-12-07 19:07:37
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-08T15:16:56+08:00
 */

'use strict';
import cui from 'c-ui'
import _ from 'lodash'
import dalProjectList from '../../dao/projectManagement/projectList'
import dalAdmin from '../../dao/administratorSetting/admin'
import SuccessTip from '../../components/tips/successTip'
import WarnTip from '../../components/tips/warnTip'
import "../../components/ueditor"
import session from '../../dao/sessionContext'
import SelectAccount from '../../components/selectAccount/index'
import moment from 'moment'
import '../../components/share/hfCommon'
import './createProject.less'
import '../../components/commonTab/style.less'


//新建项目
class CreateFirst {
    constructor() {
        this.delAccountArr = []
        this.textBoxes = Array.from($('.create-wrap .cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
        this.checkBoxes = Array.from($('.create-wrap .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)))
        this.initEditor()
        this.initSelect()
        this.watch()
    }
    initSelect() {
        this.selectArr = Array.from($('.create-admin .account'), (v) => {
            return {
                account: $(v).data('id').replace(/&quot;/g,"\""),
                name: $(v).data('name').replace(/&quot;/g,"\"")
            }
        })
        return this.selectArr
    }
    getSelect() {
        var str = '',
            arr = this.initSelect();

        if (this.SelectAccount && this.SelectAccount.getValue()) {
            for (var v of this.SelectAccount.getValue()) {
                str += v.id + ','
            }
        } else if (arr) {
            for (let v of arr) {
                str += v.account + ','
            }
        }
        return str;
    }
    createEditor(elem) {
        var toolbars = [
            ['undo', 'redo', 'bold', 'italic', 'underline',
                'strikethrough', 'forecolor', 'backcolor', 'fontfamily',
                'fontsize', 'justifyleft', 'justifycenter', 'justifyright',
                'lineheight', 'removeformat', 'simpleupload', 'insertorderedlist',
                'insertunorderedlist', 'link', 'inserttable'
            ]
        ]
        var ue = UE.getEditor(elem, {
            initialFrameWidth: 640,
            initialFrameHeight: 120,
            autoHeightEnabled: false,
            toolbars: toolbars,
            elementPathEnabled: false,
            enableAutoSave: false,
            wordCount: false
        });
        return ue;
    }
    initEditor() {
        let self = this
        //---------实例化富文本编辑器--------
        this.projectContent = this.createEditor('projectContent')
        //渲染数据
        this.projectContent.ready(function() {
            let value = $('#projectCon').val() || '欢迎参加本次考试。以下是您需要完成的考试内容，请点击“开始答题”后，按系统提示作答。<br/>在此衷心感谢您的配合与支持！';
            self.projectContent.setContent(value)
        });

    }
    getValue() {
        return {
            name: $.trim(this.textBoxes[0].getValue()),
            description: $.trim(this.projectContent.getContent()),
            startDate: $.trim($('#startDateL').val()),
            endDate: $.trim($('#endDateL').val()),
            accountsStr: $.trim(this.getSelect()),
            scanEnable: $.trim(this.checkBoxes[0].getValue()),
            scanMax: $.trim(this.textBoxes[1].getValue()),
            scanStartDate: $.trim($('#scanStartDateL').val()),
            scanEndDate: $.trim($('#scanEndDateL').val())
        }
    }
    verify() {
        let self = this;
        let validate = true;
        for (let i = 0; i < self.textBoxes.length; i++) {
            if (!self.textBoxes[i].getValidate()) {
                self.textBoxes[i].$el.find('input').focus().blur();
                validate = false;
            }
        }
        return validate;
    }
    watch() {
        let self = this;

        let projectId = $('#projectId').val() || 0

        $('.selectAccount').on('click', () => {
            if (!self.SelectAccount) {
                session.customer().then((r)=>{
                    return dalProjectList.findRestAccounts(projectId, r.accessToken)
                }).then((res) => {
                    self.SelectAccount = new SelectAccount({
                        title: '选择管理员',
                        data: {
                            id: new Date().getTime(),
                            select: res.response.concat(this.delAccountArr),
                            selected: self.selectArr
                        }
                    })
                    self.SelectAccount.on('sure', () => {
                        var $html;
                        $('.create-admin .account').remove();
                        for (var v of self.SelectAccount.getValue()) {
                            $html = $('<a class="account cui-button c-preset-green" data-id="" data-name="">' +
                                        '<span></span>' + '<i class="cui-icon cpf-icon-thin-close"></i></a>');
                            $html.prependTo($('.create-admin'))
                            $html.data('id',v.id.replace(/\"/g,"&quot;")).data('name',v.name.replace(/\"/g,"&quot;"))
                            $html.find('span').text(v.name)
                        }
                    })
                }, (err) => {
                    cui.popTips.warn('查询失败')
                })

            } else {
                self.SelectAccount.open()
            }
        })
        $('#startDateL').on('click', () => { //项目起始时间
            let maxStartDate = $('#maxStartDate').val() ? moment($('#maxStartDate').val()).valueOf() : null
            let scanStartDate = $('#scanStartDateL').val() ? moment($('#scanStartDateL').val()).valueOf() : null

            if (maxStartDate && scanStartDate) {
                if (maxStartDate > scanStartDate)
                    maxStartDate = moment(parseInt(scanStartDate)).format('YYYY-MM-DD HH:mm:ss');
            } else if (scanStartDate) {
                maxStartDate = moment(parseInt(scanStartDate)).format('YYYY-MM-DD HH:mm:ss');
            } else {
                maxStartDate = maxStartDate ? moment(parseInt(maxStartDate)).format('YYYY-MM-DD HH:mm:ss') : null;
            }
            let config = {
                el: 'startDateL',
                dateFmt: 'yyyy-MM-dd HH:mm:ss'
            }
            if (maxStartDate) {
                config.maxDate = maxStartDate
            }

            WdatePicker_Open(config)
        })
        $('#endDateL').on('click', () => { //项目结束时间
            let minEndDate = $('#minEndDate').val() ? moment($('#minEndDate').val()).valueOf() : null
            let scanEndDate = $('#scanEndDateL').val() ? moment($('#scanEndDateL').val()).valueOf() : null

            if (minEndDate && scanEndDate) {
                if (minEndDate < scanEndDate)
                    minEndDate = moment(parseInt(scanEndDate)).format('YYYY-MM-DD HH:mm:ss');
            } else if (scanEndDate) {
                minEndDate = moment(parseInt(scanEndDate)).format('YYYY-MM-DD HH:mm:ss');
            } else {
                minEndDate = minEndDate ? moment(parseInt(minEndDate)).format('YYYY-MM-DD HH:mm:ss') : null;
            }
            let config = {
                el: 'endDateL',
                dateFmt: 'yyyy-MM-dd HH:mm:ss'
            }
            if (minEndDate) {
                config.minDate = minEndDate
            }
            WdatePicker_Open(config)
        })
        $('#scanStartDateL').on('click', (e) => { //扫码起始时间
            $(e.target).removeClass('failure')
            WdatePicker_Open({
                el: 'scanStartDateL',
                dateFmt: 'yyyy-MM-dd HH:mm:ss',
                maxDate: '#F{$dp.$D(\'endDateL\')}',
                minDate: '#F{$dp.$D(\'startDateL\')}',
                onpicked: function() {
                    var start = moment($('#scanStartDateL').val()).valueOf()
                    var end = moment($('#scanEndDateL').val()).valueOf()
                    if (start > end) {
                        if ($('#scanStartDateL').data('value'))
                            $('#scanStartDateL').val($('#scanStartDateL').data('value'))
                        else
                            $('#scanStartDateL').val($('#scanStartDateL').data('value')).addClass('failure')
                        new WarnTip($('#scanStartDateL').parent(), '开始时间不能大于结束时间', {
                            left: 0,
                            top: '32px'
                        })
                    } else {
                        $('#scanStartDateL').data('value', $('#scanStartDateL').val())
                    }
                }
            })
        })
        $('#scanEndDateL').on('click', (e) => { //扫码结束时间
            $(e.target).removeClass('failure')
            WdatePicker_Open({
                el: 'scanEndDateL',
                dateFmt: 'yyyy-MM-dd HH:mm:ss',
                maxDate: '#F{$dp.$D(\'endDateL\')}',
                minDate: '#F{$dp.$D(\'startDateL\')}',
                onpicked: function() {
                    var start = moment($('#scanStartDateL').val()).valueOf()
                    var end = moment($('#scanEndDateL').val()).valueOf()
                    if (start > end) {
                        if ($('#scanEndDateL').data('value'))
                            $('#scanEndDateL').val($('#scanEndDateL').data('value'))
                        else
                            $('#scanEndDateL').val($('#scanEndDateL').data('value')).addClass('failure')
                        new WarnTip($('#scanEndDateL').parent(), '结束时间不能小于开始时间', {
                            left: 0,
                            top: '32px'
                        })
                    } else {
                        $('#scanEndDateL').data('value', $('#scanEndDateL').val())
                    }
                }
            })
        })

        $('.create-admin').on('click', '.account i', (e) => { //删除管理员
            if (self.SelectAccount) {
                self.SelectAccount.update($(e.target).parent().data('id'))
                $(e.target).parent().remove()
            } else {
                this.delAccountArr.push({
                    account: $(e.target).parent().data('id'),
                    name: $(e.target).prev().text()
                })
                $(e.target).parent().remove()
                this.initSelect()
            }

        })

        $('.sure').on('click', (e) => {
            if (self.verify()) {

                var data = self.getValue()
                if (!$('#projectId').val()) {
                    session.customer().then((r)=>{
                        return dalProjectList.createProject(data, r.accessToken)
                    }).then((res) => {
                            if (res && res.code == 0) {
                                new SuccessTip('创建成功')
                                window.location.href = "/customer/projectList/selectPaper/" + res.response + "?createOredit=" + $('#createOredit').val();
                                // window.location.href = "/customer/projectList/selectPaper/" + res.response + "?createOredit=" + $('#createOredit').val() +`&startDate=${data.startDate}&endDate=${data.endDate}`;
                            } else {
                                cui.popTips.error(res.message)
                            }
                        }, (err) => {
                            console.log(err)
                            cui.popTips.error('出错啦')
                        })
                } else {
                    var projectId = $('#projectId').val()
                    session.customer().then((r)=>{
                        return dalProjectList.editProject(data, r.accessToken, projectId)
                    }).then((res) => {
                            if (res && res.code == 0) {
                                new SuccessTip('修改成功')
                                window.location.href = "/customer/projectList/selectPaper/" + projectId + '?createOredit=' + $('#createOredit').val();
                                // window.location.href = "/customer/projectList/selectPaper/" + projectId + '?createOredit=' + $('#createOredit').val() +`&startDate=${data.startDate}&endDate=${data.endDate}`;
                            } else {
                                cui.popTips.error(res.message)
                            }
                        }, (err) => {
                            console.log(err)
                            cui.popTips.error('出错啦')
                        })
                }

            }
        })


        $('.digits').on('focus', 'input', (e) => {
            $(e.target).removeClass('fail')
        }).on('keydown', 'input', (e) => { //限制输入的keyCode
            if (e.keyCode == 8 || e.keyCode == 37 || e.keyCode == 39 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                return true;
            }
            return false;
        }).on('keyup', 'input', (e) => { //限制格式
            let val = e.target.value;
            if (val != '') {
                let reg = new RegExp(/^\d+/)
                if (!reg.test(val)) {
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '请输入正整数', {
                        width: '127px',
                        'z-index': 10000
                    });
                }
            }
        }).on('blur', 'input', (e) => { //限制格式
            let val = e.target.value;
            if (val != '') {
                let reg = new RegExp(/^\d+/)
                if (!reg.test(val)) {
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '请输入正整数', {
                        width: '127px',
                        'z-index': 10000
                    });
                }
            }
        })

        // if (!$('.scanEnable>input').is('checked')) {
        //     $('.create-scan input[type=text]').after($('<div class="mask"></div>'));
        // }
        $('.scanEnable').on('change', 'input', (e) => {
            let enable = e.target.checked;
            if (!enable) {
                $('.create-scan input[type=text]').after($('<div class="mask"></div>'))
            } else {
                $('.create-scan .mask').remove()
            }
        })


        $('#downloadScan').on('click', (e) => {
            session.customer().then((r) => {
                let projectId = $('#projectId').val()
                dalProjectList.downloadScan(r.accessToken, projectId)
            })
        })
        $('#scanImg').on('click', () => {
            $('#downloadScan').click()
        })
    }
}
new CreateFirst()
