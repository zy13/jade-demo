/*
 * @Author: sihui.cao
 * @Date:   2016-12-01 15:24:33
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-05-04 15:41:47
 */

'use strict';
import juicer from 'juicer'
import cui from 'c-ui'
import _ from 'lodash'
import session from '../../dao/sessionContext'
import loading from '../loading';
import WarnTip from '../tips/warnTip'
import SlideSwitch from '../slide-switch/index'
import SuccessTips from '../tips/successTip'
import dalTemplate from '../../dao/projectManagement/template'

import './style.less'


class AddMesTem {
    constructor(setting) {
        var def_config = {
            title: '模板',
            reuse: {
                obj: '',
                data: []
            },
            type: 'add',
            data: {
                message: {
                    id: 0,
                    companyId: '',
                    whetherDefault: 0,
                    name: '',
                    content: '',
                }
            },
            check: true
        }
        this.config = _.extend(def_config, setting || {})
        this.isFirefox = window.navigator.userAgent.toLowerCase().indexOf("firefox")!=-1
        //火狐低版本不支持innerText，但由于短信希望不过滤html，所以用textContent代替
            // console.log(this.config)
        if (this.config.type == 'add' || this.config.type == 'edit')
            this.initModal();
        else
            this.initHtml();
    }
    initHtml() {
        //初始化下拉框
        let opts = []
        this.messArr = this.config.reuse.data.smsList;
        for (var v of this.messArr) {
            opts.push({
                value: v.id,
                text: v.name
            })
        }
        //获取dom
        let tpljuicer = juicer(require('./tpl/index.html'));
        let html = tpljuicer.render({
            message: {
                content: this.messArr.length > 0 ? this.messArr[0].content : '',
                reuse: true,
                contentId: 'messContent' + this.config.reuse.time,
                opts: JSON.stringify(opts),
                defaultValue: opts.length > 0 ? opts[0].text : '',
                whetherdefault: this.messArr.length > 0 ? this.messArr[0].whetherdefault : ''
            }
        })

        this.$el = $(html);
        this.$el.appendTo(this.config.reuse.obj)

        this.selectBox = Array.from(this.$el.find('.cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)))
        this.checkBoxes = Array.from(this.$el.find('.cui-checkboxContainer'), (v) => new cui.Checkbox($(v)))
        this.textBoxes = Array.from(this.$el.find('.cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
        this.slideList = Array.from(this.$el.find('.slideBtn'), (v) => new SlideSwitch(v))
        this.createEditor(this.messArr.length > 0 ? this.messArr[0].content.toString() : '')
        this.watch()
    }
    setData(data) {
        if (data) {
            if (data.content != undefined){
                if(this.isFirefox){
                    this.messContent.body.textContent = data.content
                }else{
                    this.messContent.setContentWithHtml(data.content)
                }
            }
            this.slideList[0].set(data.whetherdefault == 1 ? true : false)
            this.setCount(data.content)
        }
        this.checkBoxes[0].setValue(false)
        this.textBoxes[0].setValue('');
        this.textBoxes[0].$el.find('input').attr('disabled', 'disabled').val('').removeClass('success fail');
    }
    initModal() {
        let tpljuicer = juicer(require('./tpl/index.html'));
        let html = tpljuicer.render(this.config.data);
        let tmpHeader = $('<span>' + this.config.title + '</span>');
        let tmpContent = $(html);
        let modalPanel = new cui.Panel(tmpHeader, tmpContent);
        let modalBrocken = new cui.Brocken();
        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
        this.modal.$container.find('.cui-panel-content').css({
            height: '470px',
            overflow: 'auto'
        })
        modalPanel.getPanel().css({
            height: '520px',
            width: '810px'
        });
        this.modal.$broken.off('click')
        this.modal.open();
        this.textBoxes = Array.from($('.win-main .cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
        this.slideList = Array.from($('.win-main .slideBtn'), (v) => new SlideSwitch(v))
        this.createEditor(this.config.data.message.content.toString())
        this.watch()
        this.$el = this.modal.$el
    }
    createEditor(data) {
        let self = this,
            toolbars = [
                ['replaceword']
            ],
            config = {
                initialFrameWidth: 620,
                initialFrameHeight: 120,
                toolbars: toolbars,
                elementPathEnabled: false,
                autoHeightEnabled: false,
                enableAutoSave: false,
                wordCount: false,
                zIndex: 10000
            }
        let elem = self.config.reuse.time ? 'messContent' + self.config.reuse.time : 'messContent',
            ue = UE.getEditor(elem, config);
        this.messContent = ue;
        ue.commands['replaceword'] = {
            execCommand: function(e) {
                var $list = $(`<div class="replaceword">
                                <div class="repacewordItem">$$帐号$$</div>
                                <div class="repacewordItem">$$姓名$$</div>
                                <div class="repacewordItem">$$密码$$</div>
                                <div class="repacewordItem">$$考试地址$$</div>
                                <div class="repacewordItem">$$评卷地址$$</div>
                                <div class="repacewordItem">$$任务数量$$</div>
                            </div>`)

                if ($('.edui-for-replaceword .replaceword').length > 0)
                    $('.edui-for-replaceword .replaceword').remove();

                if (self.modal) {
                    $('#messContent .edui-for-replaceword').css('overflow', 'visible').parent().css('overflow', 'visible')
                    $list.appendTo($('#messContent .edui-for-replaceword'));
                } else {
                    let $target = self.$el.find(`#messContent${self.config.reuse.time} .edui-for-replaceword`)
                    $target.css('overflow', 'visible').parent().css('overflow', 'visible')
                    $list.appendTo($target);
                }

                $list.find('div').map((index, i) => {
                    $(i).on('click', (e) => {
                        var value = $(e.target).text()
                        $list.remove()
                        let contentText = ue.getContentTxt();
                        if ((contentText.length + value.length) > 300) {
                            cui.popTips.warn('请先适当删减内容后再添加')
                        } else {
                            ue.execCommand('insertHtml', value)
                            self.setCount(ue.getContentTxt())
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
            let contentText = self.isFirefox?ue.body.textContent:ue.body.innerText;
            if (contentText.length >= 300) {
                if(self.isFirefox){
                    ue.body.textContent = contentText.substr(0, 300);
                }else{
                    ue.setContentWithHtml(contentText.substr(0, 300));
                }

            }
            self.setCount(ue.getContentTxt())
        })


        ue.ready(() => {
            if (data) {
                if(self.isFirefox){
                    ue.body.textContent = data;
                }else{
                    ue.setContentWithHtml(data)
                }
                self.setCount(self.messContent.getContentTxt())
            }
            self.messContent.$el = $(`#${elem}`)
        })

    }
    getValue() {
        return {
            id: this.config.data.message.id || 0,
            whetherDefault: this.slideList[0].get() ? 1 : 0,
            name: $.trim(this.textBoxes[0].getValue()),
            content: $.trim(this.messContent.getContentTxt())
        }
    }
    getSendValue() {
        return {
            newSmsName: $.trim(this.textBoxes[0].getValue()),
            smsContent: $.trim(this.messContent.getContentTxt()),
            whetherDefaultSms: this.slideList[0].get(),
            whetherSaveSms: this.checkBoxes[0].getValue()
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
                new WarnTip(self.textBoxes[0].$el, '模板名称已存在', { top: '37px', left: 0 })
                self.textBoxes[0].$el.find('input').addClass('fail')
            }
        }

        if ($.trim(this.messContent.getContentTxt()) == '') {
            validate = false;
            new WarnTip(self.messContent.$el, '请输入短信内容', {
                top: '157px',
                'z-index': 100000,
                left: 0
            })
        } else {
            let val = this.messContent.getContentTxt()
            if (val.length > 300) {
                validate = false;
                new WarnTip(self.messContent.$el, '内容不能超过300字', {
                    top: '157px',
                    'z-index': 100000,
                    left: 0
                })
            }
        }
        return validate;
    }
    setCount(text) {
        var count = 1;
        if (text == null) {
            count = 0;
        } else {
            if (text.length == 0) {
                count = 0;
            } else if (text.length > 70) {
                count += Math.ceil((text.length - 70) / 67)
            }
        }
        var n = text == null ? 0 : text.length;
        $('.win-item .note', this.$el).find('.count').text(count).next().text(300 - n)
    }
    checkUnique(e) {
        let self = this;
        var $el = $(e.target)
        if ($.trim($el.val()) == "")
            return;
        this.config.check = null;
        session.customer().then((r) => {
            return dalTemplate.checkMesTemplateName({
                accessToken: r.accessToken,
                name: $el.val() || '',
                id: self.config.data.message.id
            })
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
            cui.popTips.error(err.message || '网络错误');
        })
    }
    watch() {
        //弹窗关闭
        // console.log(this.modal)
        let self = this;
        if (self.config.type != 'merge') {

            self.textBoxes[0].$el.on('focus', 'input', (e) => {
                $(e.target).removeClass('fail succ')
            }).on('keyup', 'input', (e) => {
                self.config.check = false;
            }).on('blur', 'input', (e) => {
                self.checkUnique(e)
            })
            for (let v of self.slideList) {
                v.$el.on('click', (e) => {
                    v.toggleClass(false)
                })
            }
            self.modal.on('modalClose', () => {
                self.modal.$container.remove()
                self.messContent.destroy()
            })

            self.modal.$el.on('click', '.sure', () => {

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
                        return dalTemplate.addMesTemplate(data)
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
                        return dalTemplate.editMesTemplate(data)
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

            self.selectBox[0].$el.on('click', '.cui-optionsWrapper li', (e) => {
                var _i = $(e.target).index();
                self.setData(self.messArr[_i])
            })

            self.checkBoxes[0].$el.on('change', 'input', () => {
                if (self.checkBoxes[0].$el.find('input')[0].checked) {
                    self.textBoxes[0].$el.find('input').removeAttr('disabled')
                        //状态切换
                    for (let v of self.slideList) {
                        v.$el.on('click', (e) => {
                            v.toggleClass(false)
                        })
                    }
                } else {
                    self.textBoxes[0].$el.find('input').attr('disabled', 'disabled').val('').removeClass('success fail failure')
                    for (let v of self.slideList) {
                        v.set(false);
                        v.$el.on('click', (e) => {
                            // v.toggleClass(true)
                            v.set(!v.judge());
                        })
                    }
                }
            })
            self.textBoxes[0].$el.on('blur', 'input', (e) => {
                self.checkUnique(e)
            })
        }


    }
}


export default AddMesTem
