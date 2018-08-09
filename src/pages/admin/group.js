/*
 * @Author: zyuan
 * @Date:   2016-11-28 11:02:52
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-02T17:29:09+08:00
 */

'use strict';

import '../../components/share/hfCommon'

import '../../components/commonTab/managementTab.less'
import './group.less'

import $ from 'jquery'
import cui from 'c-ui'
import EditGroup from './mod/edit_group'
import AddGroup from './mod/add_group'
import DelGroup from './mod/del_share'

class Grouping {
    constructor() {
        this.initCheckboxes();
        this.selecteAll();
        this.delOne();
        this.delMore();
        this.addGroup();
        this.editGroup();
        this.spreadOrSprink();
    }
    initCheckboxes() {
        this.checkboxes = Array.from($('.cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
    }
    selecteAll() {
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

        $('.m-wrap .m-item .cui-checkboxContainer').on('click', 'input', (e) => { //单个
            let self = this,
                count = 0;
            //设置子选项选中
            let currCode = $(e.currentTarget).parents('li.m-item').data('code');

            for (var i = 1; i < self.checkboxes.length; i++) {
                if (self.checkboxes[i].getValue()) {
                    count++;
                }
                let setChlidEle = self.checkboxes[i].$el.parents(`li.m-item[data-code*=${currCode}]`);
                if (setChlidEle.length > 0) {
                    self.checkboxes[i].val = $(e.currentTarget).is(':checked');
                    self.checkboxes[i].$el.find('input[type=checkbox]')[0].checked = $(e.currentTarget).is(':checked');
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
    delOne() {
        $('.m-item .del').map((v, i) => {
            $(i).on('click', (e) => {
                if ($(i).closest('.m-item').is('.has-son')) {
                    let orgCode = $(i).closest('.m-item').data('code');
                    let orgReg = new RegExp(orgCode);
                    let delIds = [],
                        count = 1;
                    delIds[0] = $(i).closest('.m-item').attr('id');
                    $(i).closest('.m-item').siblings('.m-item').map((index, j) => {

                        if (orgReg.test($(j).data('code'))) {
                            delIds[count] = $(j).attr('id');
                            count++;
                        }
                    })
                    new DelGroup(delIds, 0)
                } else {
                    let delId = $(i).closest('.m-item').attr('id');
                    //alert(delId);
                    new DelGroup(delId, 0)
                }
            })
        });
    }
    delMore() {
        let self = this;
        $('.m-main-action .del').on('click', () => {
            let delIds = [];

            for (let i in self.checkboxes) {
                if (i > 0 && self.checkboxes[i].getValue()) {
                    delIds.push(self.checkboxes[i].$el.closest('.m-item').attr('id'));
                }
            }
            if (delIds.length > 0) {
                new DelGroup(delIds, 0);
            } else {
                return cui.popTips.warn('请选择分组！');
            }

        })
    }
    addGroup() {
        $('.m-item .add').on('click', (e) => {
            /*if($('.m-item').length==10){
                cui.popTips.warn('分组已达到最大层级');
            }else{*/
            let $this = $(e.currentTarget);
            let data = {
                groupName: $this.closest('.m-item').find('.group-name').text(),
                parentId: $this.closest('.m-item').attr('id')
            }
            new AddGroup(data);
            //}
        })
    }
    editGroup() {
        $('.m-item .edit').map((v,i) => {
            $(i).on('click', () => {

                let data = {
                    groupId: $(i).closest('.m-item').attr('id'),
                    groupName: $(i).closest('.m-item').find('.group-name').text()
                }
                new EditGroup(data);
            })
        })
    }
    spreadOrSprink() {
        let countClick = Array.from({
            length: $('.m-item').length
        }, (x) => x = 0);

        $('.cl').on('click', (e) => {
            let $this = $(e.currentTarget);
            let orgCode = $this.closest('.m-item').data('code');
            let temp = 0;

            $this.closest('.m-item')
                .find('.i').toggleClass('triangle-bottom-right triangle-left')
                .siblings('.ii').toggleClass('cpf-icon-un-folder cpf-icon-folder');

            if ($this.closest('.m-item').is('.has-son')) {
                let orgReg = new RegExp(orgCode);
                for (let k = 0; k < $('.m-item').length; k++) {
                    let iClass = '.i' + k;
                    if ($this.closest('.m-item').is(iClass)) {
                        countClick[k]++;
                        temp = k;
                    }
                }
                $this.closest('.m-item').siblings('.m-item').map((v,i) => {
                    if (orgReg.test($(i).data('code'))) {
                        if (countClick[temp] % 2 == 1) { //收缩
                            $(i).hide();
                        } else { //展开
                            $(i).show();
                        }
                    }
                })
                return false;
            }

            return false;
        })
    }

}

let groupingIns = new Grouping();
