/*
 * @Author: zyuan
 * @Date:   2016-12-19 19:54:07
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-03-17T11:10:34+08:00
 */

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import createTpl from '../tpl/create_account.html';

import session from '../../../dao/sessionContext';
import examineeInfoDao from '../../../dao/projectManagement/examineeInfo.js';
import SuccessTip from '../../../components/tips/successTip'
import handleRepeatAccount from '../../../components/tips/deleteTip'
import loading from '../../../components/loading'
const juicerTpl = juicer(createTpl);
juicer.register('jsonStringify', function(select) {
    let op = [];
    if (select) {
        select.map((i, k) => {
            op.push({
                value: k,
                text: i.name
            });
        });
    }
    return JSON.stringify(op)
})
class createAccount {
    constructor(data) {
        this.data = data || '';
        this.matchGlobalTop = '';
        this.initModal();
    }
    initModal() {
        let renderData, opts = {
            projectId: this.data.projectId,
            taskId: this.data.taskId
        }
        session.customer().then((r) => {
            opts.accessToken = r.accessToken
            return examineeInfoDao.getNewField(opts)
        }).then((res) => {
            if (res && res.code == 0) {
                this.data.renderData = res.response;
            } else {
                return cui.popTips.error(res.message);
            }
        }).then(() => {
            let count = 0,
                tplHtml = $(juicerTpl.render(this.data.renderData)),
                tmpHeader = $(`<span>创建帐号</span>`),
                modalPanel = new cui.Panel(tmpHeader, $(tplHtml)),
                modalBrocken = new cui.Brocken();

            this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
            let height = $(window).height() * 0.9

            modalPanel.getPanel().css({
                'width': '610px',
                'max-height': height + 'px'
            });

            this.modal.$el.find('.cui-panel-content').css({
                'max-height': height - 50,
                'overflow-y': 'auto'
            })

            this.modal.$broken.off('click');
            loading.close();
            this.modal.open();
            this.initControl();

            this.matchGlobalTop = ($(window).height() - this.modal.$el.height()) / 2;

            this.modal.on('modalClose', () => this.modal.$container.remove());
            $('.cancel').on('click', () => this.modal.$container.remove());

            $(window).on('resize',()=>{
                this.resetPosition();
            })
        })

    }
    initControl() {
        this.crtRadio = Array.from($('.create_account .cui-radioGroupContainer.golbal'), (v) => new cui.RadioGroup($(v)));
        this.oneRadio = Array.from($('.create_account .only .cui-radioGroupContainer'), (v) => new cui.RadioGroup($(v)));
        this.oneTextBoxes = Array.from($('.create_account .only .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.oneDateSelector = Array.from($('.create_account .only .cui-datePickerContainer'), (v) => new cui.DatePicker($(v)));
        this.oneSelectBox = Array.from($('.create_account .only .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
        this.mutiRadio = Array.from($('.create_account .muti .cui-radioGroupContainer'), (v) => new cui.RadioGroup($(v)));
        this.multiTextBoxes = Array.from($('.create_account .muti .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.ImportTextBoxes = Array.from($('.create_account .import .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        $('.cui-panel-content .create_account .cui-textBoxContainer>span, .cui-panel-content .create_account .dateSelector>span, .cui-panel-content .create_account .selectBox>span', this.modal.$el).each((i, v) => {
            let height = $(v).height()
            if (height > 40) {
                $(v).addClass('ellipsis')
            }
        })
        $('.v.cui-inputCroupContainer.only').on('click', (e) => {
            setTimeout(() => {
                this.oneSelectBox.map((item) => {
                    if (item.$el.hasClass('active'))
                        item.close()
                })
            }, 200);
        })

        //下拉选择框不重叠显示
        this.oneSelectBox.map((item) => {
            item.$el.on('click', (e) => {
                this.oneSelectBox.map((v) => {
                    if (!v.$el.is($(e.currentTarget)) && v.$el.hasClass('active')) {
                        v.close();
                    }
                });
                return false;
            })
        })
        $('.cui-panel-content .create_account .cui-inputCroupContainer .cui-textBoxContainer>span', this.modal.$el).each((i, v) => {
            let height = $(v).height()
            if (height > 40) {
                $(v).addClass('ellipsis')
            }
        })
        this.handleRadioTag();
    }
    handleRadioTag() {
        let self = this;
        let globalValidate = true;
        $('.create_account input[name=account]').on('blur', (e) => {
            $(e.target).data('repeat', 0)

            if (e.target.value) {
                let accountVal = e.target.value;

                session.customer().then((r) => {
                    return examineeInfoDao.repeatAccount({
                        account: accountVal,
                        accessToken: r.accessToken,
                        projectId: self.data.projectId,
                        taskId: self.data.taskId
                    })
                }).then((r) => {
                    if (r.response.userId) {
                        let data = {
                            content: '该帐号已经存在，是否直接引用？',
                            style: {
                                width: '400px',
                                height: '300px'
                            },
                            isAuto: false,
                            tip: '已引用',
                            cancel: () => {
                                $(e.target).val('').data('repeat', 0);
                                $(e.target).removeAttr('readonly');
                                $('.create_account input[name=password]').removeAttr('readonly');
                                $(e.target).css('background-color', '#fff');
                                $('.create_account input[name=password]').css('background-color', '#fff');
                            }
                        }
                        new handleRepeatAccount(() => {
                            $(e.target).data('repeat', 1).data('id', r.response.userId)
                            if (r.response.fields) {
                                self.setData(r.response.fields);
                                $(e.target).attr('readonly', 'true').off('blur').off('focus').removeClass('success').css('background-color', '#efefef');
                                $('.create_account input[name=password]').attr('readonly', 'true').off('blur').off('focus').removeClass('success').css('background-color', '#efefef');
                                this.oneTextBoxes.map((item) => {
                                    if (item.$el.find('input').val() != '') {
                                        item.$el.find('.ie-placeholder').hide();
                                    }
                                });
                                loading.close();
                            }
                        }, data);
                    }
                })
            }
        })

        $('.create_account').on('click', ' .cui-radioGroupContainer.golbal input[type=radio]', (e) => {
            let $this = $(e.currentTarget);
            if (this.crtRadio[0].getValue() == 1) {
                $('.create_account .only').removeClass('dis')
                    .siblings('.v').addClass('dis');
            } else if (this.crtRadio[0].getValue() == 2) {
                $('.create_account .muti').removeClass('dis')
                    .siblings('.v').addClass('dis');

                //验证开始-结束数字
                if (this.mutiRadio[0].getValue() == 21) {
                    $('.muti .validate-num').each((i, v) => {
                        $(v).find('input').on('blur', (e) => {
                            let tv = parseInt($(e.currentTarget).val(), 10);
                            globalValidate = true;
                            if (i == 0 && !isNaN(tv) && tv > 0) { //开始数字
                                if (this.multiTextBoxes[3].getValue() && (tv > parseInt(this.multiTextBoxes[3].getValue(), 10))) {
                                    this.multiTextBoxes[2].setValidate(false, '开始数字不能大于结束数字');
                                    globalValidate = false;
                                }
                            }
                            if (i == 1 && !isNaN(tv) && tv > 0) { //结束数字
                                if (this.multiTextBoxes[2].getValue() && (tv < parseInt(this.multiTextBoxes[2].getValue(), 10))) {
                                    this.multiTextBoxes[3].setValidate(false, '结束数字不能小于开始数字');
                                    globalValidate = false;
                                }
                            }
                        })
                    })
                }
            } else {
                $('.create_account .import').removeClass('dis')
                    .siblings('.v').addClass('dis');
            }
        }).on('click', '.muti input[type=radio]', () => {
            if (this.mutiRadio[0].getValue() == 21) {
                $('.muti .dataed .doing').removeClass('dis')
                    .siblings('.da').addClass('dis');
            } else {
                $('.muti .dataed .todo').removeClass('dis')
                    .siblings('.da').addClass('dis');
            }
        }).on('click', '.confirmBtn', () => {
            if (globalValidate) {
                this.handleConfirm();
            } else {
                $('.create_account .muti .cui-textBoxContainer input').focus().blur();
                return false;
            }
        }).on('change', '#file', (e) => { //处理ie9-placeholder样式
            if ($(e.currentTarget).val()) {
                $(e.currentTarget).closest('.import').find('.ie-placeholder').remove();
            }
        })

        //导入模板
        $('.create_account .import').on('click', '.modLoad', () => {
            let opts = {
                projectId: this.data.projectId,
                taskId: this.data.taskId
            };

            session.customer().then((r) => {
                opts.accessToken = r.accessToken
                return examineeInfoDao.importMDownload(opts)
            })
        })
    }
    setData(data) {
        data.map((v, i) => {
            if (v.type == 1 || v.type == 2) {
                $(`.create_account input[name=${v.fieldKey}]`).val(v.fieldValue);
            } else {
                if (v.fieldKey == 'gender') {
                    this.oneRadio[0].setValue(v.fieldValue)
                } else {
                    $(`.create_account .cui-selectBoxContainer[name=${v.fieldKey}] .cui-options li`).each((i, k) => {
                        if ($(k).text() == v.fieldValue) {
                            $(`.create_account .cui-selectBoxContainer[name=${v.fieldKey}]`).css('overflow', 'hidden')
                            $(k).click()
                        }
                    })
                    setTimeout(() => {
                        $(`.create_account .cui-selectBoxContainer`).css('overflow', 'inherit')
                    }, 500)
                }

            }
        });
    }
    handleConfirm() {
        //单个
        if (this.crtRadio[0].getValue() == 1) {
            let validate = true,
                //jsonStr = [],
                sjsonStr = '{',
                obj = [];

            //处理文本框-日历框
            if (this.oneTextBoxes.length) {
                for (let i of this.oneTextBoxes) {
                    if (!i.getValidate()) {
                        $('.create_account .only .cui-textBoxContainer input').focus().blur();
                    }
                    validate = validate && i.getValidate();
                }

                this.oneTextBoxes.map((i, v) => {
                    if (i.getValue()) {
                        sjsonStr += "\"" + i.$el.find('input').attr('name') + "\":"
                        sjsonStr += "\"" + i.getValue() + "\","
                            // sjsonStr += "\"" + encodeURIComponent(i.getValue() ? i.getValue() : '') + "\","

                        obj.push({
                            key: i.$el.find('input').attr('name'),
                            value: i.getValue()
                        });
                    }
                })
            }
            //处理下拉框
            if (this.oneSelectBox.length) {
                this.oneSelectBox.map((i, v) => {
                    if (i.getValue()) {
                        sjsonStr += "\"" + i.$el.attr('name') + "\":"
                        sjsonStr += "\"" + i.getValue().text + "\","
                        obj.push({
                            key: i.$el.attr('name'),
                            value: i.getValue().text
                        });
                    }
                })
            }
            //处理radio
            if (this.oneRadio[0] && this.oneRadio[0].getValue()) {
                sjsonStr += "\"" + "gender" + "\":"
                sjsonStr += "\"" + this.oneRadio[0].getValue() + "\","
                obj.push({
                    key: "gender",
                    value: this.oneRadio[0].getValue()
                });
            }

            if (validate) {
                loading.open();
                sjsonStr = sjsonStr.substring(0, sjsonStr.length - 1) + "}"
                let opts = {
                    jsonStr: sjsonStr,
                    obj: obj || [],
                    projectId: this.data.projectId,
                    taskId: this.data.taskId,
                    userId: $('.create_account input[name=account]').data('id')
                };

                let repeat = $('.create_account input[name=account]').data('repeat'),
                    url = repeat == null || repeat == undefined || repeat == '1' ? examineeInfoDao.editOneAccount : examineeInfoDao.createOneAccount;

                session.customer().then((r) => {
                    opts.accessToken = r.accessToken
                    return url(opts)
                }).then((res) => {
                    setTimeout(() => {
                        loading.close();
                    }, 200)
                    if (res && res.code == 0) {
                        this.modal.$container.remove();
                        new SuccessTip('创建成功', () => {
                            window.location.reload();
                        }, 800);
                    } else {
                        return cui.popTips.error(res.message);
                    }
                }).catch((err) => {
                    loading.close();
                    return cui.popTips.error('网络错误！')
                })
            }
        }

        //多个
        if (this.crtRadio[0].getValue() == 2) {
            let validate = true;
            let accountPre = 'test',
                amount,
                password,
                endNum,
                startNum,
                opts = {};

            this.multiTextBoxes.slice(0, this.multiTextBoxes.length).forEach((i, v) => {
                if (i.getValue()) {
                    switch (v) {
                        case 0:
                            accountPre = i.getValue();
                            break;
                        case 1:
                            password = i.getValue();
                            break;
                        case 2:
                            startNum = parseInt(i.getValue());
                            break;
                        case 3:
                            endNum = parseInt(i.getValue());
                            break;
                        case 4:
                            amount = parseInt(i.getValue());
                            break;
                        default:
                            break;
                    }
                }
                if (this.mutiRadio[0].getValue() == 21) { //自定义
                    if (v != 4) {
                        $('.create_account .muti .cui-textBoxContainer input').focus().blur();
                        validate = validate && i.getValidate();
                    }
                }
                if (this.mutiRadio[0].getValue() == 22) { //非自定义
                    if (v != 2 && v != 3) {
                        $('.create_account .muti .cui-textBoxContainer input').focus().blur();
                        validate = validate && i.getValidate();
                    }
                }

            });
            if (validate) {
                loading.open();
                if (this.mutiRadio[0].getValue() == 21) {
                    amount = 0;
                }
                if (this.mutiRadio[0].getValue() == 22) {
                    amount = this.multiTextBoxes[4].getValue();
                }
                opts = {
                    accountPre: accountPre,
                    amount: amount,
                    endNum: endNum,
                    password: password,
                    projectId: this.data.projectId,
                    startNum: startNum,
                    taskId: this.data.taskId
                };

                session.customer().then((r) => {
                    opts.accessToken = r.accessToken
                    return examineeInfoDao.createMutiAccount(opts)
                }).then((res) => {
                    setTimeout(() => {
                        loading.close();
                    }, 200)
                    if (res && res.code == 0) {
                        this.modal.$container.remove();
                        new SuccessTip(`${res.response.succAccsNum}个创建成功, ${res.response.failAccsNum}个创建失败`, () => {
                            window.location.reload()
                        }, 800);
                    } else {
                        return cui.popTips.error(res.message);
                    }
                }).catch((err) => {
                    loading.close();
                    return cui.popTips.error('网络错误！')
                })
            }
        }

        //导入
        if (this.crtRadio[0].getValue() == 3) {
            let validate = true;

            if (!this.ImportTextBoxes[0].getValidate()) {
                $('#filePath').focus().blur();
                validate = false;
            }

            if (validate) {
                let importFile = this.ImportTextBoxes[0].getValue();
                let fileType = importFile.substr(importFile.lastIndexOf('.'));

                if (fileType == '.xls' || fileType == '.xlsx') { //检验文件类型
                    let opts = {
                        projectId: this.data.projectId,
                        taskId: this.data.taskId
                    };
                    loading.open();
                    session.customer().then((r) => {
                        opts.accessToken = r.accessToken
                        return examineeInfoDao.importAccount('/osexamer/examer/import?accessToken=' + r.accessToken, 'file', opts)
                    }).then((res) => {
                        setTimeout(() => {
                            loading.close();
                        }, 200)
                        if (res && res.code == 0) {
                            this.modal.$container.remove();
                            new SuccessTip('文件导入中，请稍后到导入日志查看', () => {
                                window.location.reload()
                            }, 800);
                        } else {
                            return cui.popTips.error(res.message);
                        }
                    }).catch((err) => {
                        loading.close();
                        return cui.popTips.error('网络错误！')
                    })
                } else { //文件类型错误
                    this.ImportTextBoxes[0].setValidate(false, '文件类型错误');
                    return false;
                }
            }
        }
    }
    resetPosition() {
        let self = this;

        if (self.modal.isShow) {
            let height = $(window).height() * 0.9

            self.modal.$el.css({
                'width': '610px',
                'max-height': height + 'px',
                'top': this.matchGlobalTop + 'px'
            });

            self.modal.$el.find('.cui-panel-content').css({
                'max-height': height - 50,
                'overflow-y': 'auto'
            })
        }
    }
}
export default createAccount
