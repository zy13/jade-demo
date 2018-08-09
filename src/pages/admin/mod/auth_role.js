/*
 * @Author: zyuan
 * @Date:   2016-11-29 18:52:00
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-08T18:55:40+08:00
 */

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import authTpl from '../tpl/auth_role.html';
import daoRole from '../../../dao/administratorSetting/role'
import SuccessTip from '../../../components/tips/successTip'
const tplJuicer = juicer(authTpl);

class AuthManage {
    constructor(conf) {
        this.conf = conf || {};
        this.initModal();
    }
    initModal() {
        let conf = {};
        let self = this;
        daoRole.getPermissionOfRole(self.conf).then((res) => {
            if (res && res.code == 0) {
                let pCpunt = 0;
                let allCount = 0;

                conf = res;
            } else {
                cui.popTips.error(res.message);
            }

        }).then(() => {
            let tplHtml = $(tplJuicer.render(conf));

            let tmpHeader = $('<span>权限管理[系统管理员]</span>');
            let tmpContent = $(tplHtml);
            let modalPanel = new cui.Panel(tmpHeader, tmpContent);
            let modalBrocken = new cui.Brocken();

            self.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

            modalPanel.getPanel().css({
                width: '610px'
            });

            self.modal.open();
            self.initCheckBox();
            self.selectAll();

            self.modal.on('modalClose', () => {
                self.modal.$container.remove()
            })

            self.confirm();
            self.cancel();

        })
    }
    initCheckBox() {
        this.ckboxes = Array.from($('.auth .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));

        let tmpList = [],
            chooseLen = 0;
        $('.total.for-all').map((i, v) => {
            let tmpObj = {
                k: v,
                v: []
            }
            $(v).find('input[type=checkbox]').each((index, el) => {
                tmpObj.v.push($(el).is(':checked'));
            });
            tmpList.push(tmpObj);
        })
        tmpList.map((item) => {
            if ($.inArray(false, item.v) < 0) {
                $(item.k).prev().find('input')[0].checked = true;
                chooseLen++;
            }
        })
        if (chooseLen == tmpList.length) $('input.all')[0].checked = true;
    }
    selectAll() {
        $('.auth .checks-group .cui-checkboxContainer').on('click', '.all', () => { //全选和反选
            let self = this;
            for (let i = 1; i < self.ckboxes.length; i++) {
                if (self.ckboxes[0].val) {
                    self.ckboxes[i].val = true;
                    self.ckboxes[i].$el.find('input[type=checkbox]')[0].checked = true;
                } else {
                    self.ckboxes[i].val = false;
                    self.ckboxes[i].$el.find('input[type=checkbox]')[0].checked = false;
                }

            }
        });

        $('.auth .checks-group .cui-checkboxContainer').on('click', 'input', (e) => {
            let self = this;
            let $this = $(e.currentTarget);
            let count = 0,
                cur, temp;

            for (let i = 0; i < 4; i++) {
                if ($this.is('.f' + i)) {
                    cur = '.f' + i;
                }
            }

            for (var i = 1; i < self.ckboxes.length; i++) {
                if (self.ckboxes[i].$el.find('input').is(cur)) {
                    if (self.ckboxes[i].$el.find('input').is('.yiji')) {
                        temp = i;
                    }
                    //局部全选-一级
                    if ($this.is('.yiji')) {
                        if ($this[0].checked) {
                            self.ckboxes[i].val = true;
                            self.ckboxes[i].$el.find('input[type=checkbox]')[0].checked = true;
                        } else {
                            self.ckboxes[i].val = false;
                            self.ckboxes[i].$el.find('input[type=checkbox]')[0].checked = false;
                        }
                    }
                    //局部全选-二级
                    if ($this.is('.erji')) {
                        let subLen = 0;
                        for (let j = 1; j < $(cur).length; j++) {
                            if (self.ckboxes[temp + j].getValue()) {
                                subLen++;
                            }
                        }
                        if (subLen == ($(cur).length - 1)) {
                            self.ckboxes[temp].val = true;
                            self.ckboxes[temp].$el.find('input[type=checkbox]')[0].checked = true;
                        } else {
                            self.ckboxes[temp].val = false;
                            self.ckboxes[temp].$el.find('input[type=checkbox]')[0].checked = false;
                        }
                    }
                }
            }

            for (let i = 1; i < self.ckboxes.length; i++) {
                if (self.ckboxes[i].getValue()) {
                    count++;
                }
            }
            if (count == (self.ckboxes.length - 1)) {
                self.ckboxes[0].val = true;
                self.ckboxes[0].$el.find('input[type=checkbox]')[0].checked = true;
            } else {
                self.ckboxes[0].val = false;
                self.ckboxes[0].$el.find('input[type=checkbox]')[0].checked = false;
            }
        })
    }
    confirm() {
        let self = this;
        $('.confirm').on('click', () => {
            let permissionIdsStr = [];
            let count = 0;
            self.ckboxes.map((i) => {
                if (i.val && i.$el.attr('id')) {
                    permissionIdsStr[count] = i.$el.attr('id');
                    count++;
                }
            });
            let opts = {
                roleId: self.conf.roleId,
                accessToken: self.conf.accessToken,
                permissionIdsStr: permissionIdsStr.join(',')
            }

            daoRole.setRolePermission(opts).then((res) => {
                if (res && res.code == 0) {
                    let fn = () => self.modal.$container.remove();
                    new SuccessTip('设置成功', fn, true);
                } else {
                    cui.popTip.error(res.message);
                }
            })
        })
    }
    cancel() {
        $('.cancel').on('click', () => {
            this.modal.$container.remove()
        })
    }
}
export default AuthManage
