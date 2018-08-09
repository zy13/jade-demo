/*
 * @Author: sihui.cao
 * @Date:   2016-12-16 10:49:07
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-13T11:21:33+08:00
 */

'use strict';
import cui from 'c-ui'
import dalExamList from '../../dao/examManagement/examList'
import SuccessTip from '../../components/tips/successTip'
import WarnTip from '../../components/tips/warnTip'
import "../../components/ueditor"
import session from '../../dao/sessionContext'
import '../../components/commonTab/style.less'
import '../../components/share/hfCommon'
import './createPaper.less'

class CreateFirst {
    constructor() {
        this.textBoxes = Array.from($('.create-wrap .cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
        this.maximumWords = 1000;
        this.initEditor()
        this.watch()
    }
    getContext() {
        let self = this;
        session.customer().then((res) => {
            self.context = res;
        })
    }
    createEditor(elem, type) {
        let toolbars = [
            ['undo', 'redo', 'bold', 'italic', 'underline',
                'strikethrough', 'forecolor', 'backcolor', 'fontfamily',
                'fontsize', 'justifyleft', 'justifycenter', 'justifyright',
                'lineheight', 'removeformat', 'simpleupload', 'insertorderedlist',
                'insertunorderedlist', 'link', 'inserttable'
            ]
        ]
        let config = {
            initialFrameWidth: 660,
            initialFrameHeight: 120,
            autoHeightEnabled: false,
            toolbars: toolbars,
            elementPathEnabled: false,
            enableAutoSave: false,
            wordCount: false
        }
        let ue = UE.getEditor(elem, config);

        return ue;
    }
    initEditor() {
        let self = this
        //---------实例化富文本编辑器--------
        this.examRemark = this.createEditor('examRemark')
        //渲染数据
        this.examRemark.ready(function() {
            let value = $('#examRem').val() || '如需特别记录该份试卷的用途说明或使用注解，可在此处填写，该信息考生不可见。';
            self.examRemark.setContent(value)
        });
    }
    getValue() {
        return {
            name: $.trim(this.textBoxes[0].getValue()),
            comment: this.examRemark.getContent(),
            duration: $.trim(this.textBoxes[1].getValue()) || null
        }
    }
    verify() {
        let self = this;
        let validate = true;
        if (self.textBoxes.length > 0) {
            if (!self.textBoxes[0].getValidate()) {
                self.textBoxes[0].$el.find('input').focus().blur();
                validate = false;
            } else if (self.textBoxes[0].$el.find('input').hasClass('fail')) {
                validate = false;
                new WarnTip(self.textBoxes[0].$el, '试卷名称已存在', {
                    left: 0,
                    'z-index': 10000
                })
            }
        }

        if ($.trim(this.examRemark.getContentTxt()).length > this.maximumWords) {
            validate = false;
            new WarnTip($('#examRemark').parent(), `字数不能多于${this.maximumWords}`, {
                width: '130px',
                'z-index': 10000,
                top: '164px',
                left: 0
            });
        }
        return validate;
    }
    save(type) {
        let self = this,
            paperUnicode = $('#paperUnicode').val(),
            mode = $('#mode').val(),
            paperId = $('#paperId').val();
        if (!this.blurChecked && self.verify()) {
            let data = JSON.stringify(self.getValue())
            if (type == 1) {
                if (mode == '1' && !paperUnicode) {
                    session.customer().then((r) => {
                        return dalExamList.createQuestion({
                            jsonStr: data,
                            subject: 'header',
                            accessToken: r.accessToken,
                            paperUnicode: -1
                        })
                    }).then((res) => {
                        if (res && res.code == 0) {
                            new SuccessTip('创建成功', function() {
                                res.response = JSON.parse(res.response);
                                let unicode = res.response.unicode;
                                window.location.href = "/customer/examList/setPaper/" + unicode + '?mode=1&paperId=' + paperId;
                            }, null, 800)
                        } else {
                            cui.popTips.error(res.message)
                        }
                    }, (err) => {
                        console.log(err)
                        cui.popTips.error('操作失败')
                    })
                } else {
                    session.customer().then((r) => {
                        return dalExamList.editQuestion({
                            flush: 0,
                            jsonStr: data,
                            subject: 'header',
                            accessToken: r.accessToken,
                            paperUnicode: paperUnicode,
                            unicode: ''
                        })
                    }).then((res) => {
                        if (res && res.code == 0) {
                            new SuccessTip('操作成功', function() {
                                window.location.href = "/customer/examList/setPaper/" + paperUnicode + '?mode=' + mode + '&paperId=' + paperId;
                            }, null, 800)
                        } else {
                            cui.popTips.error(res.message)
                        }
                    }, (err) => {
                        cui.popTips.error('请稍后重试')
                    })
                }
            } else {
                session.customer().then((r) => {
                    return dalExamList.setQuestionFlush({
                        paperUnicode: paperUnicode,
                        stepNo: 1,
                        accessToken: r.accessToken,
                        jsonStr: data
                    })
                }).then((r) => {
                    if (r && r.code == 0) {
                        new SuccessTip('保存成功', () => {
                            window.location.href = "/customer/examList/setCompletion/" + paperUnicode + '?mode=' + mode + '&paperId=' + paperId;
                        }, null, 800)
                    } else {
                        cui.popTips.error(r.message)
                    }
                }).catch((err) => {
                    cui.popTips.error('出错了')
                    console.log(err)
                })
            }

        }
    }
    watch() {
        let self = this;

        $('.next').on('click', (e) => {
            setTimeout(() => {
                self.save(1)
            }, 50);

        })
        $('.save').on('click', (e) => {
            setTimeout(() => {
              self.save(2)
            }, 50);
        })

        $('.cui-textBoxContainer').on('focus', 'input', (e) => {
            $(e.target).removeClass('fail')
        })
        $('.cui-textBoxContainer.time').on('keydown', 'input', (e) => { //限制输入的keyCode
            if (e.keyCode == 8 || e.keyCode == 37 || e.keyCode == 39 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                return true;
            }
            return false;
        }).on('keyup', 'input', (e) => { //限制格式
            let val = e.target.value;
            if (val != '') {
                let reg = new RegExp(/^\d{1,3}$/)
                if (!reg.test(val)) {
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '请输入不大于999的正数', {
                        width: '140px',
                        'z-index': 10000
                    });
                }
            }
        }).on('blur', 'input', (e) => {
            if (e.target.value != '') {
                e.target.value = parseInt(e.target.value)
            }
        })


        $('input[name=paperName]').on('blur', (e) => {
            this.blurChecked = true;
            let name = e.target.value;
            if (name != '') {
                session.customer().then((r) => {
                    return dalExamList.checkPaperNameUnique({
                        accessToken: r.accessToken,
                        newName: name,
                        paperId: $('#paperId').val() || -1
                    })
                }).then((r) => {
                    if (r.code == 28007004) {
                        $(e.target).addClass('fail')
                        new WarnTip($(e.target).parent(), '试卷名称已存在', {
                            left: 0,
                            'z-index': 10000
                        })
                    }
                    else {
                      this.blurChecked = false;
                    }
                })

            }
        })
    }
}
new CreateFirst()
