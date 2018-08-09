/*
 * @Author: zyuan
 * @Date:   2016-12-16 09:46:20
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-03-15T17:30:24+08:00
 */

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import editTpl from '../tpl/edit_account.html';
import SuccessTip from '../../../components/tips/successTip'
import examineeInfoDao from '../../../dao/projectManagement/examineeInfo.js';
import moment from 'moment'
import loading from '../../../components/loading'
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
class EditAccount {
    constructor(data) {
        this.data = data || '';
        this.initModal();
    }
    initModal() {
        let opts = {
            accessToken: this.data && this.data.accessToken ? this.data.accessToken : '',
            projectId: this.data && this.data.projectId ? this.data.projectId : '',
            taskId: this.data && this.data.taskId ? this.data.taskId : '',
            userId: this.data && this.data.userId ? this.data.userId : ''
        }
        examineeInfoDao.editAccount(opts).then((res) => {
            if (res && res.code == 0) {
                this.data.renderData = res.response;
            } else {
                return cui.popTips.error(res.message)
            }
        }).then(() => {
            let count = 0,
                tplHtml = $(juicer(editTpl).render(this.data.renderData)),
                tmpHeader = $(`<span>修改帐号</span>`),
                modalPanel = new cui.Panel(tmpHeader, $(tplHtml)),
                modalBrocken = new cui.Brocken();

            this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
            let height = $(window).height() * 0.9
            modalPanel.getPanel().css({
                width: '610px',
                maxHeight: height + 'px'
            });
            this.modal.$el.find('.cui-panel-content').css({
                'max-height': height - 50,
                'overflow-y': 'auto'
            })
            this.modal.$broken.off('click')
            this.modal.$el.find('.create_account .v.cui-inputCroupContainer.only').css('height', height - 218)
            loading.close();
            this.modal.open();

            this.initControl();

            this.modal.on('modalClose', () => this.modal.$container.remove());
            $('.cancel').on('click', () => this.modal.$container.remove());

            $(window).on('resize', () => {
                if (this.modal.isShow)
                    this.resetPosition();
            })
        })
    }
    initControl() {
        this.textBoxes = Array.from($('.editAccount .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.dateSelector = Array.from($('.editAccount .cui-datePickerContainer'), (v) => new cui.DatePicker($(v)));
        this.selectBox = Array.from($('.editAccount .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
        this.radio = Array.from($('.editAccount .cui-radioGroupContainer'), (v) => new cui.RadioGroup($(v)));
        $('.cui-panel-content .editAccount .cui-textBoxContainer>span, .cui-panel-content .editAccount .dateSelector>span, .cui-panel-content .editAccount .selectBox>span', this.modal.$el).each((i, v) => {
            let height = $(v).height()
            if (height > 40) {
                $(v).addClass('ellipsis')
            }
        })
        this.handleConfirm();
    }
    handleConfirm() {
        $('.editAccount .confirm').on('click', () => {
            let validate = true,
                sjsonStr = '{',
                obj = [];

            //处理输入框-日历框
            if (this.textBoxes.length) {
                //console.log(this.textBoxes.length)
                for (let i of this.textBoxes) {
                    if (!i.getValidate()) {
                        $('.editAccount .cui-textBoxContainer input').focus().blur();
                    }
                    validate = validate && i.getValidate();
                }
                this.textBoxes.map((i, v) => {
                    if (i.getValue()) {
                        sjsonStr += "\"" + i.$el.find('input').attr('name') + "\":"
                        sjsonStr += "\"" + i.getValue() + "\","
                        obj.push({
                            key: i.$el.find('input').attr('name'),
                            value: i.getValue()
                        });
                    }
                })
            }

            //处理日历框
            // if (this.dateSelector.length) {
            //     this.dateSelector.map((i, v) => {
            //         if (i.getValue()) {
            //             sjsonStr += "\"" + i.$el.attr('name') + "\":"
            //             sjsonStr += "\"" + moment(i.getValue()).format('YYYY-MM-DD') + "\","
            //             obj.push({
            //                 key: i.$el.attr('name'),
            //                 value: Date.parse(i.getValue())
            //             });
            //         }else{
            //             sjsonStr += "\"" + i.$el.attr('name') + "\":"
            //             sjsonStr += "\"" + i.$el.data('value') + "\","
            //             obj.push({
            //                 key: i.$el.attr('name'),
            //                 value: Date.parse(i.$el.data('value'))
            //             });
            //         }
            //     })
            // }

            //处理下拉框
            if (this.selectBox.length) {
                this.selectBox.map((i, v) => {
                    sjsonStr += "\"" + i.$el.attr('name') + "\":"
                    if (i.getValue()) {
                        sjsonStr += "\"" + i.getValue().text + "\","
                        obj.push({
                            key: i.$el.attr('name'),
                            value: i.getValue().text
                        });
                    } else {
                        sjsonStr += "\"" + i.$el.data('value') + "\","
                        obj.push({
                            key: i.$el.attr('name'),
                            value: i.$el.data('value')
                        });
                    }
                })
            }
            if (this.radio[0] && this.radio[0].getValue()) {
                sjsonStr += "\"" + "gender" + "\":"
                sjsonStr += "\"" + this.radio[0].getValue() + "\","
                obj.push({
                    key: "gender",
                    value: this.radio[0].getValue()
                });
            }

            if (validate) {
                loading.open();
                sjsonStr = sjsonStr.substring(0, sjsonStr.length - 1) + "}"
                let opts = {
                    accessToken: this.data.accessToken,
                    jsonStr: sjsonStr,
                    obj: obj || [],
                    projectId: this.data.projectId,
                    taskId: this.data.taskId,
                    userId: this.data && this.data.userId ? this.data.userId : ''
                };

                examineeInfoDao.editOneAccount(opts).then((res) => {
                    setTimeout(() => {
                        loading.close();
                    }, 200)
                    if (res && res.code == 0) {
                        this.modal.$container.remove();
                        new SuccessTip('修改成功', () => {
                            window.location.reload();
                        }, 800);
                    } else {
                        return cui.popTips.error(res.message);
                    }
                }).catch((err) => {
                    setTimeout(() => {
                        loading.close();
                    }, 200)
                    return cui.popTips.error('网络错误')
                })
            }
        })
    }
    resetPosition() {
        let height = $(window).height() * 0.9

        this.modal.$el.css({
            width: '610px',
            maxHeight: height + 'px'
        });
        this.modal.$el.find('.cui-panel-content').css({
            'max-height': height - 50,
            'overflow-y': 'auto'
        })
    }
}
export default EditAccount
