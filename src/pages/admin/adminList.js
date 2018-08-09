/*
 * @Author: zyuan
 * @Date:   2016-11-28 15:51:29
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-08T10:38:25+08:00
 */

'use strict';

'use strict';

import '../../components/share/hfCommon'

import '../../components/commonTab/managementTab.less'
import './adminList.less'

import cui from 'c-ui'
import SlideSwitch from '../../components/slide-switch/index'

import AdminMgtItem from './mod/create_admin'
import ResetPwd from './mod/reset_pwd';
import adminDao from '../../dao/administratorSetting/admin';
import session from '../../dao/sessionContext';
import SuccessTip from '../../components/tips/successTip';
import {
    FormOptions
} from '../../components/share/tools';
import ph from '../../components/share/placeholder';

const fo = new FormOptions();
class ManagerList {
    init() {
        this.initSlideButton();
        this.initCheckboxes();
        this.initSelectBoxes();
        this.initEvents();
        ph();
    }
    initSlideButton() {
        let slideBtns = document.querySelectorAll('.m-main .slideBtn')
        this.slideList = Array.from(slideBtns, (elem) => new SlideSwitch(elem))
    }
    initCheckboxes() {
        this.checkboxes = Array.from($('.m-main .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));

        $('.m-main .cui-checkboxContainer.inline.selectAll').on('click', 'input', (event) => {
            this.checkboxes.slice(1, this.checkboxes.length).forEach((item) => {
                item.val = this.checkboxes[0].getValue();
                item.$el.find('input[type=checkbox]')[0].checked = this.checkboxes[0].getValue();
            })
        })

        $('.m-item .cui-checkboxContainer.inline').on('click', 'input', (event) => {
            const itemChk = this.checkboxes.slice(1, this.checkboxes.length);
            let slcCount = 0;
            itemChk.map((item) => item.getValue() ? slcCount++ : 0);
            if (slcCount == itemChk.length) {
                this.checkboxes[0].val = true;
                this.checkboxes[0].$el.find('input[type=checkbox]')[0].checked = true;
            } else {
                this.checkboxes[0].val = false;
                this.checkboxes[0].$el.find('input[type=checkbox]')[0].checked = false;
            }
        })
    }
    initSelectBoxes() {
        this.selectBoxes = Array.from($('.m-search .cui-selectBoxContainer'), (v) => {
            return new cui.SelectBox($(v))
        });
        let iptRole = document.querySelector('input[name=groupId]');
        if (iptRole.value) {
            this.selectBoxes[1].setValue({
                value: parseInt(iptRole.value)
            });
        }
        let iptSearchType = document.querySelector('input[name=searchType]');
        if (iptSearchType.value) {
            this.selectBoxes[0].setValue({
                value: iptSearchType.value
            });
        }
    }
    initEvents() {
        $('a.create-account').on('click', (e) => {
            this.openAdminCreateOrEdit('add')
        })
        $('a.edit').on('click', (e) => {
            this.openAdminCreateOrEdit('edit', $(e.target).data('id'));
        })
        $('a.btn-resetpwd').on('click', (e) => {
            const itemChk = this.checkboxes.slice(1, this.checkboxes.length);
            let ids = []
            itemChk.map((item) => {
                if (item.getValue()) {
                    ids.push(item.$el.find('input').data('id'))
                }
            })
            if (ids.length > 0)
                new ResetPwd({
                    ids: ids.join(',')
                })
            else
                cui.popTips.warn('请选择管理员');
        })
        $('a.btn-export').on('click', (e) => {
            session.customer().then((customer) => {
                return adminDao.exportAdmins(customer.accessToken)
            }).catch((err) => {
                cui.popTips.error('系统异常！');
                console.log(err);
            })
        })
        $('a.btn-status').on('click', (e) => {
            let status = $(e.target).data('status');
            const itemChk = this.checkboxes.slice(1, this.checkboxes.length);
            let ids = []
            itemChk.map((item) => {
                if (item.getValue()) {
                    ids.push(item.$el.find('input').data('id'))
                }
            })
            if (ids.length > 0) {
                session.customer().then((customer) => {
                    return adminDao.setStatus(customer.accessToken, ids.join(','), status)
                }).then((r) => {
                    if (r.code == 0) {
                        ids.map((item) => {
                            if (status == 1)
                                $(`i.slideBtn[data-id=${item}]`).addClass('active')
                            else
                                $(`i.slideBtn[data-id=${item}]`).removeClass('active')
                        })
                        new SuccessTip(status == 1 ? '已启用' : '已禁用')
                    } else {
                        cui.popTips.error(r.message);
                    }
                }).catch((err) => {
                    cui.popTips.error('系统异常！');
                    console.log(err);
                })
            } else {
                cui.popTips.warn('请选择管理员');
            }
        })
        /**
        this.slideList.forEach((v) => {
            v.on('statusChange', (eve) => {
                let status = v.get(),
                    ids = v.$el.data('id');

                session.customer().then((customer) => {
                    return adminDao.setStatus(customer.accessToken, ids, status ? 1 : 0)
                }).then((r) => {
                    if (r.code == 0) {
                        if (status)
                            v.$el.addClass('active')
                        else
                            v.$el.removeClass('active')
                        new SuccessTip('设置成功')
                    } else {
                        cui.popTips.error(r.message);
                    }
                }).catch((err) => {
                    cui.popTips.error('系统异常！');
                    console.log(err);
                })
            })

        })**/

        for (let v of this.slideList) {
            v.$el.on('click', (e) => {
                let status = v.get(),
                    ids = v.$el.data('id');

                session.customer().then((customer) => {
                    return adminDao.setStatus(customer.accessToken, ids, status ? 0 : 1)
                }).then((r) => {
                    if (r.code == 0) {
                        v.toggleClass()
                    } else {
                        cui.popTips.error(r.message);
                    }
                }).catch((err) => {
                    cui.popTips.error('系统异常！');
                    console.log(err);
                })
            })
        }

        $('.search-detail button,.search-grouping .cui-options li').on('click', (e) => {
            let searchModel = new Object();
            searchModel.key = encodeURIComponent($('input[name=key]').val() ? $('input[name=key]').val() : '');
            searchModel.searchType = this.selectBoxes[0].getValue() ? this.selectBoxes[0].getValue().value : $('input[name=searchType]').val();
            searchModel.groupId = this.selectBoxes[1].getValue() ? this.selectBoxes[1].getValue().value : $('input[name=groupId]').val();
            searchModel.roleId = $('.role a.cur').data('value');
            searchModel.status = $('.status a.cur').data('value');
            window.location.href = `/customer/admin/adminList?${fo.toPostString(searchModel)}`;
        })
    }
    openAdminCreateOrEdit(type, adminId) {
        session.customer()
            .then((customer) => {
                if (!this.roleList || !this.groupList)
                    return adminDao.getOptionsList(customer.accessToken, customer.companyId).then((list) => {
                        if (list.code == 0 && !list.bizError && list.response) {
                            this.groupList = JSON.stringify(list.response.groupList.map((v) => {
                                return {
                                    value: v.id,
                                    text: v.name
                                }
                            }));
                            this.roleList = JSON.stringify(list.response.roleList.map((v) => {
                                return {
                                    value: v.id,
                                    text: v.name
                                }
                            }));

                        }
                    })
            }).then(() => {
                if (type == 'edit') {
                    return adminDao.getDetail(window.customer.accessToken, window.companyId, adminId)
                        .then((res) => {
                            return Promise.resolve(res.response);
                        })
                }
            }).then((data = {}) => {
                if (!data.hasOwnProperty('status'))
                    data.status = 1;
                //创建的时候，默认显示选择角色或分组
                if (type == 'add') {
                    if (this.selectBoxes[1].getValue()) {
                        data.groupId = this.selectBoxes[1].getValue().value;
                    }
                    if ($('.role a.cur').data('value')) {
                        data.roleId = $('.role a.cur').data('value');
                    }
                }
                new AdminMgtItem({
                    type,
                    title: `${type=='add'?'创建':'编辑'}管理员`,
                    roleJson: this.roleList,
                    groupJson: this.groupList,
                    data
                })
            })
    }

}

let managerListIns = new ManagerList()
managerListIns.init();
