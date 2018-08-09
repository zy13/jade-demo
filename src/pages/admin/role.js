/*
 * @Author: zyuan
 * @Date:   2016-11-28 15:03:46
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-02T17:30:54+08:00
 */

'use strict';

import '../../components/share/hfCommon'

import '../../components/commonTab/managementTab.less'
import './role.less'

import $ from 'jquery'
import cui from 'c-ui'
import CreateRole from './mod/create_role'
import AddAcount from './mod/add_role'
import EditAcount from './mod/edit_role'
import AuthManage from './mod/auth_role'
import DelRole from './mod/del_share'
import session from '../../dao/sessionContext'

class Role {
    constructor() {
        this.getContext();
        this.initCheckboxes();
        this.selectAll();
        this.createRole();
        this.delMore();
        this.delOne();
        // this.addRole();
        this.editRole();
        this.authManage();
    }
    getContext() {
        let self = this;
        session.customer().then((res) => {
            self.context = res;
        })
    }
    initCheckboxes() {
        this.checkboxes = Array.from($('.cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
    }
    selectAll() {
        $('.m-wrap .m-title').on('click', '.input-title', () => { //全选和反选
            var self = this;
            for (var i = 1; i < self.checkboxes.length; i++) {
                if (self.checkboxes[0].getValue()) {
                    self.checkboxes[i].val = true;
                    self.checkboxes[i].$el.find('input[type=checkbox]')[0].checked = true;
                } else {
                    self.checkboxes[i].val = false;
                    self.checkboxes[i].$el.find('input[type=checkbox]')[0].checked = false;
                }

            }
        })

        $('.m-wrap .m-item .cui-checkboxContainer').on('click', 'input', () => { //单个
            let self = this,
                count = 0;
            for (var i = 1; i < self.checkboxes.length; i++) {
                if (self.checkboxes[i].getValue()) {
                    count++;
                }
            }
            if (count == (self.checkboxes.length - 1)) {
                self.checkboxes[0].val = true;
                self.checkboxes[0].$el.find('input[type=checkbox]')[0].checked = true;
            } else {
                self.checkboxes[0].val = false;
                self.checkboxes[0].$el.find('input[type=checkbox]')[0].checked = false;
            }
        })
    }
    createRole() {
        $('.create').on('click', () => {
            this.createRole = new CreateRole();
        })
    }
    delMore() {
        let self = this;
        $('.m-main-action .del').on('click', () => {
            let delIds = [];
            let count = 0;
            for (let i in self.checkboxes) {
                if (i > 0 && self.checkboxes[i].getValue()) {
                    delIds[count] = self.checkboxes[i].$el.closest('.m-item').attr('id');
                    count++;
                }
            }
            if (delIds.length > 0) {
                new DelRole(delIds, 2);
            } else {
                return cui.popTips.warn('请选择角色！');
            }

        })
    }
    delOne() {
        $('.m-item .del').map((v, i) => {
            $(i).on('click', () => {
                let fn = () => $(i).closest('.m-item').remove();
                let delId = $(i).closest('.m-item').attr('id');
                new DelRole(delId, 2)
            })
        })
    }
    addRole() {
        $('.m-item .add').map((v, i) => {
            $(i).on('click', () => {
                this.addAcount = new AddAcount();
            })
        })
    }
    editRole() {
        $('.m-item .edit').map((v, i) => {
            $(i).on('click', () => {
                let data = {
                    roleId: $(i).closest('.m-item').attr('id') || '',
                    roleName: $(i).closest('.m-item').find('.role-name').text()
                }
                new EditAcount(data);
            })
        });
    }
    authManage() {
        let self = this;
        $('.m-item .manage').map((v, i) => {
            $(i).on('click', () => {
                if (!self.context) {
                    return cui.popTips.error('网络出错')
                }
                let data = {
                    accessToken: self.context.accessToken,
                    roleId: $(i).closest('.m-item').attr('id')
                }
                new AuthManage(data);
            })
        });
    }
}

let roleIns = new Role();
