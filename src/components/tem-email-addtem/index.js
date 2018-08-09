/*
 * @Author: sihui.cao
 * @Date:   2016-11-28 18:33:35
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-01-19T16:28:27+08:00
 */

'use strict';
import juicer from 'juicer'
import cui from 'c-ui'
import _ from 'lodash'
import WarnTip from '../tips/warnTip'
import SuccessTips from '../tips/successTip'
import dalTemplate from '../../dao/projectManagement/template'
import SlideSwitch from '../slide-switch/index'
import loading from '../loading';
import session from '../../dao/sessionContext'
import './style.less'


class AddEamilTem {
    constructor(setting) {
        var def_config = {
            title: '模板',
            reuse: {
                obj: '',
                data: []
            },
            type: 'add',
            data: {
                email: {
                    id: 0,
                    whetherDefault: 0,
                    name: '',
                    subject: '',
                    content: '',
                    sign: ''
                }
            },
            check: true
        }
        this.maximumWords = 500;
        this.contextMaximumWords = 10000;
        this.config = _.extend(def_config, setting || {})

        if (this.config.type == 'add' || this.config.type == 'edit')
            this.initModal();
        else
            this.initHtml();
    }
    initHtml() {
        //初始化下拉框
        let opts = []
        this.emailArr = this.config.reuse.data.emailList;
        for (var [i, v] of this.emailArr.entries()) {
            opts.push({
                value: i,
                text: v.name
            })
        }
        //获取dom
        let tpljuicer = juicer(require('./tpl/index.html'));
        let html = tpljuicer.render({
            email: {
                reuse: true,
                contentId: 'emailContent' + this.config.reuse.time,
                signId: 'emailSign' + this.config.reuse.time,
                opts: JSON.stringify(opts),
                defaultValue: opts.length > 0 ? opts[0].text : ''
            }
        })
        this.$el = $(html);
        this.$el.appendTo(this.config.reuse.obj)

        this.selectBox = Array.from(this.$el.find('.cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)))
        this.checkBoxes = Array.from(this.$el.find('.cui-checkboxContainer'), (v) => new cui.Checkbox($(v)))
        this.textBoxes = Array.from(this.$el.find('.cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
        this.slideList = Array.from(this.$el.find('.slideBtn'), (v) => new SlideSwitch(v))

        this.initEditor()
        this.setData({
            subject: this.emailArr.length > 0 ? this.emailArr[0].subject : '',
            whetherdefault: this.emailArr.length > 0 ? this.emailArr[0].whetherdefault : ''
        })

    }
    setData(data) {
        if (data) {
            this.textBoxes[0].setValue(data.subject);
            this.slideList[0].set(data.whetherdefault == 1 ? true : false);
            if (data.content != undefined)
                this.emailContent.setContent(data.content);
            if (data.sign != undefined)
                this.emailSign.setContent(data.sign);
        }
        this.checkBoxes[0].setValue(false)
        this.textBoxes[1].setValue('');
        this.textBoxes[1].$el.find('input').attr('disabled', 'disabled').val('').removeClass('success fail')
    }
    createEditor(elem, type = 1) {
        let self = this;

        if (type == 1) {
            var toolbars = [
                    ['undo', 'redo', 'bold', 'italic', 'underline',
                        'strikethrough', 'forecolor', 'backcolor', 'fontfamily',
                        'fontsize', 'justifyleft', 'justifycenter', 'justifyright',
                        'lineheight', 'removeformat', 'simpleupload'
                    ]
                ]
                // config.maximumWords = 100
        } else {
            var toolbars = [
                ['undo', 'redo', 'bold', 'italic', 'underline',
                    'strikethrough', 'forecolor', 'backcolor', 'fontfamily',
                    'fontsize', 'justifyleft', 'justifycenter', 'justifyright',
                    'lineheight', 'removeformat', 'insertorderedlist',
                    'insertunorderedlist', 'link', 'replaceword'
                ]
            ]
        }
        let config = {
            initialFrameWidth: 620,
            initialFrameHeight: 120,
            toolbars: toolbars,
            elementPathEnabled: false,
            autoHeightEnabled: false,
            enableAutoSave: false,
            wordCount: false,
            zIndex: 10000
        }
        if (type == 1) {
            config.wordCount = true;
            config.maximumWords = self.maximumWords
        } else {
            config.wordCount = true;
            config.contextMaximumWords = self.contextMaximumWords
            config.initialFrameHeight = 380;
        }
        let ue = UE.getEditor(elem, config);
        ue.commands['replaceword'] = {
            execCommand: function(e) {
                var $list = $(`<div class="replaceword">
                                <div class="repacewordItem">$$帐号$$</div>
                                <div class="repacewordItem">$$姓名$$</div>
                                <div class="repacewordItem">$$密码$$</div>
                                <div class="repacewordItem">$$先生/女士$$</div>
                                <div class="repacewordItem">$$考试地址$$</div>
                                <div class="repacewordItem">$$评卷地址$$</div>
                                <div class="repacewordItem">$$任务数量$$</div>
                                <div class="repacewordItem">$$任务列表$$</div>
                            </div>`)

                if ($('.edui-for-replaceword .replaceword').length > 0)
                    $('.edui-for-replaceword .replaceword').remove();

                if (self.modal) {
                    $('#emailContent .edui-for-replaceword').css('overflow', 'visible').parent().css('overflow', 'visible')
                    $list.appendTo($('#emailContent .edui-for-replaceword'));
                } else {
                    let $target = self.$el.find(`#emailContent${self.config.reuse.time} .edui-for-replaceword`)
                    $target.css('overflow', 'visible').parent().css('overflow', 'visible')
                    $list.appendTo($target);
                }

                $list.find('div').map((index, i) => {
                    $(i).on('click', (e) => {
                        var value = $(e.target).text()
                        $list.remove()
                        let contentText = ue.getContentTxt();
                        if ((contentText.length + value.length) > 10000) {
                            cui.popTips.warn('请先适当删减内容后再添加')
                        } else {
                            ue.execCommand('insertHtml', value)
                        }
                    })
                })
                var listen = (e) => {
                    if (!$(e.target).hasClass('replaceword') && !$(e.target).hasClass('repacewordItem') && $(e.target).parents('.edui-for-replaceword').length == 0) {
                        $list.remove()
                        if (self.modal)
                            self.modal.$el.off('click', listen)
                        else
                            self.config.reuse.obj.off('click', listen)
                    }
                }

                if (self.modal)
                    self.modal.$el.on('click', listen)
                else
                    self.config.reuse.obj.on('click', listen)

                let $move = $('#sendInform').length > 0 ? $('#sendInform') : $('.cui-panel-content')
                $move.one('scroll', () => {
                    $('.replaceword').remove();
                })

                ue.addListener("focus", function(type, event) {
                    if ($('.edui-for-replaceword .replaceword').length > 0) {
                        $('.edui-for-replaceword .replaceword').remove();
                        ue.removeListener("focus");
                    }
                });

            },
            queryCommandState: function(e) {}
        }
        ue.addListener("keyup", function(type, event) {
            let contentText = ue.getContentTxt();
            if (contentText.length > 10000) {
                ue.setContent(contentText.substr(0, 10000));
            }

        })
        return ue;
    }
    initEditor() {
        let self = this
            //---------实例化富文本编辑器--------
        var content = self.config.reuse.time ? 'emailContent' + self.config.reuse.time : 'emailContent';
        var sign = self.config.reuse.time ? 'emailSign' + self.config.reuse.time : 'emailSign';
        this.emailContent = this.createEditor(content, 0)
        this.emailSign = this.createEditor(sign)
            //渲染数据
        this.emailContent.ready(function() {
            self.emailContent.$el = $(`#${content}`)
            self.emailContent.ready_signal = true;
            if (self.config.type == 'merge' && self.emailArr[0].content) {
                self.emailContent.setContent(self.emailArr[0].content)
            } else if (self.config.data.email.content) {
                self.emailContent.setContent(self.config.data.email.content)
            }
        });
        this.emailSign.ready(function() {
            self.emailSign.$el = $(`#${sign}`)
            self.emailSign.ready_signal = true;
            if (self.config.type == 'merge' && self.emailArr[0].sign) {
                self.emailSign.setContent(self.emailArr[0].sign)
            } else if (self.config.data.email.sign) {
                self.emailSign.setContent(self.config.data.email.sign)
            }
        });
        this.watch();
    }
    initModal() {
        let tpljuicer = juicer(require('./tpl/index.html'));
        let html = tpljuicer.render(this.config.data);

        let tmpHeader = $('<span>' + this.config.title + '</span>');
        let tmpContent = $(html);
        let modalPanel = new cui.Panel(tmpHeader, tmpContent);
        let modalBrocken = new cui.Brocken();
        let modalH = parseInt($(window).height() * 0.9, 10)

        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
        this.modal.$container.find('.cui-panel-content').css({
            height: modalH - 50,
            overflow: 'auto'
        })
        modalPanel.getPanel().css({
            height: modalH,
            width: '810px'
        });
        this.modal.$broken.off('click')
        this.modal.open();
        this.textBoxes = Array.from($('.win-main .cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
        this.slideList = Array.from($('.win-main .slideBtn'), (v) => new SlideSwitch(v))
            // console.log(this.textBoxes)
        this.initEditor();
        this.$el = this.modal.$el;
    }
    getValue() {
        return {
            id: this.config.data.email.id || 0,
            whetherDefault: this.slideList[0].get() ? 1 : 0,
            name: $.trim(this.textBoxes[0].getValue()),
            subject: $.trim(this.textBoxes[1].getValue()),
            content: $.trim(this.emailContent.getContent()),
            sign: $.trim(this.emailSign.getContent())
        }
    }
    getHtml(ue) { //为了兼容outlook以及去除浏览器默认样式---表示要吐了
        let html,
            $el = $(`<div class="demoHtml" style="display:none;">` + ue.getContent() + `</div>`)

        $el.appendTo($('body')).find('p').css({
            margin: 0
        }).parents().find('ul').css({
            'margin-top': 0,
            'margin-bottom': 0
        }).parents().find('ol').css({
            'margin-top': 0,
            'margin-bottom': 0
        })
        html = $el.html()
        $el.remove()
        return html
    }
    getSendValue() {
        return {
            emailContent: this.getHtml(this.emailContent),
            sendSubject: $.trim(this.textBoxes[0].getValue()),
            sign: this.getHtml(this.emailSign),
            newMailName: $.trim(this.textBoxes[1].getValue()),
            whetherDefaultMail: this.slideList[0].get(),
            whetherSaveMail: this.checkBoxes[0].getValue()
        }
    }
    verify() {
        var self = this;
        var validate = true;
        for (var i = 0; i < self.textBoxes.length; i++) {
            if (!self.textBoxes[i].getValidate() && self.textBoxes[i].$el.find('input:disabled').length == 0) {
                self.textBoxes[i].$el.find('input').focus().blur();
                validate = false;
                continue;
            }
            if (i == 0 && self.config.check == false) {
                validate = false;
                new WarnTip(self.textBoxes[0].$el, '模板名称已存在', {
                    top: '37px',
                    left: 0
                })
                self.textBoxes[0].$el.find('input').addClass('fail')
            }
        }
        if ($.trim(self.emailContent.getContent()) == '') {
            validate = false;
            new WarnTip(self.emailContent.$el, '请输入邮件内容', {
                top: '157px',
                'z-index': 100000,
                left: 0
            })
        }

        if ($.trim(self.emailSign.getContentTxt()).length > self.maximumWords) {
            validate = false;
            new WarnTip(self.emailSign.$el, `邮件签名字数不能多于${self.maximumWords}`, {
                top: '182px',
                'z-index': 100000,
                left: 0
            })
        }
        if ($.trim(self.emailContent.getContentTxt()).length > self.contextMaximumWords) {
            validate = false;
            new WarnTip(self.emailContent.$el, `邮件内容字数不能多于${self.contextMaximumWords}`, {
                top: '182px',
                'z-index': 100000,
                left: 0
            })
        }

        return validate;
    }
    checkUnique(e) {
        var self = this,
            $el = $(e.target);
        if ($.trim($el.val()) == "")
            return;
        this.config.check = null;
        session.customer().then((r) => {
            let opts = {
                accessToken: r.accessToken,
                companyId: r.companyId,
                name: $el.val() || '',
                id: self.config.data.email.id
            }
            return dalTemplate.checkMailTemplateName(opts)
        }).then((res) => {
            if (this.config.type == 'add' || this.config.type == 'edit') {
                // $('#sendInform').scrollTop(0)
                this.$el.find('.cui-panel-content').scrollTop(0)
            }

            if (res.code == 0) {
                this.config.check = true;
                $el.addClass('succ')
            } else {
                this.config.check = false;
                new WarnTip($el.parent(), '模板名称已存在', {
                    top: '37px',
                    left: 0
                })
                $el.addClass('fail')
            }
        }, (err) => {
            this.config.check = true;
            cui.popTips.error(err.message || '网络错误')
        })
    }
    watch() {
        let self = this;
        if (self.config.type != 'merge') {

            self.textBoxes[0].$el.on('focus', 'input', (e) => {
                $(e.target).removeClass('fail succ')
            }).on('keyup', 'input', (e) => {
                var $el = $(e.target)
                self.config.check = false;
            }).on('blur', 'input', (e) => {
                self.checkUnique(e)
            })

            this.modal.on('modalClose', () => {
                self.modal.$container.remove()
                if (self.emailContent.ready_signal)
                    self.emailContent.destroy()
                if (self.emailSign.ready_signal)
                    self.emailSign.destroy()
            })
            for (let v of self.slideList) {
                v.$el.on('click', (e) => {
                    v.toggleClass(false)
                })
            }
            this.modal.$el.on('click', '.sure', (e) => {
                let validate = true;
                if (!self.verify()) {
                    validate = false;
                    return;
                }
                if (self.config.check == null) {
                    validate = false;
                    cui.popTips.warn('模板名称唯一性检查中，请稍后')
                    return;
                }

                var data = self.getValue()
                    //----请求接口---添加模板
                if (self.config.type == 'add') {
                    loading.open()
                    session.customer().then((r) => {
                        data.accessToken = r.accessToken;
                        return dalTemplate.addMailTemplate(data)
                    }).then((res) => {
                        loading.close()
                        if (res.code == 0) {
                            self.modal.close();
                            new SuccessTips('新建成功', null, true, 800)
                        } else {
                            cui.popTips.error(res.message);
                        }
                    }, (err) => {
                        loading.close()
                        cui.popTips.error('请稍后重试');
                    })
                } else {
                    loading.open()
                    session.customer().then((r) => {
                        data.accessToken = r.accessToken;
                        return dalTemplate.editMailTemplate(data)
                    }).then((res) => {
                        loading.close()
                        if (res.code == 0) {
                            self.modal.close();
                            new SuccessTips('修改成功', null, true, 800)
                        } else {
                            cui.popTips.error(res.message);
                        }
                    }, (err) => {
                        loading.close()
                        cui.popTips.error('请稍后重试');
                    })
                }

            }).on('click', '.cancel', () => {
                self.modal.close();
            })
        } else {
            //下拉
            self.selectBox[0].$el.on('click', '.cui-optionsWrapper', () => {
                var _i = self.selectBox[0].getValue().value;
                self.setData(self.emailArr[_i])
            })
            self.checkBoxes[0].$el.on('change', 'input', () => {
                if (self.checkBoxes[0].$el.find('input')[0].checked) {
                    self.textBoxes[1].$el.find('input').removeAttr('disabled')
                        //状态切换
                    for (let v of self.slideList) {
                        v.$el.on('click', (e) => {
                            v.toggleClass(false)
                        })
                    }
                } else {
                    self.textBoxes[1].$el.find('input').attr('disabled', 'disabled').val('').removeClass('success fail failure')
                    for (let v of self.slideList) {
                        v.set(false);
                        v.$el.on('click', (e) => {
                            // v.toggleClass(true)
                            v.set(!v.judge());
                        })
                    }
                }
            })
            self.textBoxes[1].$el.on('blur', 'input', (e) => {
                self.checkUnique(e)
            })
        }

    }
}


export default AddEamilTem
