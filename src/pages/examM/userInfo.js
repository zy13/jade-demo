/*
 * @Author: zyuan
 * @Date:   2017-01-06 16:57:48
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-04-19 11:54:59
 */

'use strict';

import '../../components/share/layoutM'
import './userInfo.less'

import $ from 'jquery'
import cui from 'c-ui'
import session from '../../dao/sessionContext'
import examDao from '../../dao/projectManagement/examineeInfo'
import moment from 'moment'

class UserInfo {
    constructor() {
        this.init();
    }
    init() {
        this.textBoxs = Array.from($('.cui-textBoxContainer'), (v) => new cui.TextBox($(v))) || ''; //输入框
        this.radios = Array.from($('.cui-radioGroupContainer'), (v) => new cui.RadioGroup($(v))) || ''; //gender
        this.dates = Array.from($('.cui-datePickerContainer'), (v) => new cui.DatePicker($(v))) || ''; //日历框

        $('select').on('change', (e) => {
            $(e.currentTarget).siblings('.select-value').attr('data-value', oldValue)
            let $this = $(e.currentTarget);
            let oldValue = $(e.currentTarget).find('option:selected').text();
            let newValue = oldValue && oldValue.length > 10 ? oldValue.slice(0, 10) + '...' : oldValue;

            if(oldValue=='--请选择--'){
                return false;
            }
            $(e.currentTarget).siblings('.select-value').attr('data-value', oldValue).text(newValue);
        })
        this.handleEvents();
    }
    handleEvents() {
        $('.div-body').on('click', '.a-button', () => {
            session.user().then((res) => {
                if (res && res.accessToken) {
                    let validate = true,
                        sjsonStr = '{';

                    //处理输入框
                    if (this.textBoxs != undefined && this.textBoxs.length) {
                        this.textBoxs.map((i, v) => {
                            if (v > 0) {
                                if (i.getValue()) {
                                    sjsonStr += "\"" + i.$el.find('input').attr('name') + "\":";
                                    sjsonStr += "\"" + i.getValue() + "\",";
                                }
                                if (!i.getValidate()) {
                                    i.$el.find('input').focus().blur();
                                    i.getValidate(false, '');
                                }
                                validate = validate && i.getValidate();
                            }

                        });
                    }

                    //处理日历框
                    if (this.dates != undefined && this.dates.length > 0) {
                        this.dates.map((i, v) => {
                            if (i.getValue()) {
                                sjsonStr += "\"" + i.$el.attr('name') + "\":";
                                sjsonStr += "\"" + moment(i.getValue()).format('YYYY-MM-DD') + "\",";
                            } else {
                                if (i.$el.data('ismandatory') == 1) { //必填项
                                    if (!i.$el.data('value')) {
                                        validate = false
                                        return cui.popTips.warn(`请选择${i.$el.attr('data-fieldName')}`);
                                    } else {
                                        validate = true;
                                        sjsonStr += "\"" + i.$el.attr('name') + "\":";
                                        sjsonStr += "\"" + moment(i.$el.data('value')).format('YYYY-MM-DD') + "\",";
                                    }
                                } else {
                                    sjsonStr += "\"" + i.$el.attr('name') + "\":";
                                    if (i.$el.data('value')) {
                                        sjsonStr += "\"" + moment(i.$el.data('value')).format('YYYY-MM-DD') + "\",";
                                    } else {
                                        sjsonStr += "\"" + '' + "\",";
                                    }
                                }
                            }
                        });
                    }

                    //处理radio
                    if (this.radios != undefined && this.radios.length) {
                        if (this.radios[0].getValue()) {
                            validate = true;
                            sjsonStr += "gender:";
                            sjsonStr += "\"" + this.radios[0].getValue() + "\",";
                        } else {
                            if (this.radios[0].$el.data('ismandatory') == 1) { //必填项
                                validate = false;
                                return cui.popTips.warn(`请选择性别`);
                            }
                        }
                    }

                    if (validate) {
                        //处理下拉框
                        if ($('.cui-selectBoxContainer').length) {
                            Array.from($('.cui-selectBoxContainer .select-value'), (v) => {
                                if ($(v).text()) {
                                    sjsonStr += "\"" + $(v).attr('name') + "\":";
                                    sjsonStr += "\"" + $(v).attr('data-value') + "\",";
                                }
                            })
                        }

                        sjsonStr += "id:";
                        sjsonStr += "\"" + res.userId + "\",";
                        sjsonStr += "companyId:";
                        sjsonStr += "\"" + res.companyId + "\",";
                        sjsonStr = sjsonStr.substring(0, sjsonStr.length - 1) + "}";

                        let opts = {
                            accessToken: res.accessToken,
                            userId: res.userId,
                            jsonStr: sjsonStr
                        }

                        examDao.editUserInfo(opts).then((res) => {
                            if (res && res.code == 0) {
                                $.ajax({
                                    type: 'post',
                                    url: '/exam/session/update',
                                    data: {
                                        name: $('input[name=name]').val()
                                    }
                                }).done((res)=>{
                                    window.location.href = '/exam/taskList'
                                })
                            } else {
                                return cui.popTips.warn(res.message)
                            }
                        })
                    }

                } else {
                    return cui.popTips.warn('网络错误！')
                }
            })
        })
    }
}

let unserInfoIns = new UserInfo();
