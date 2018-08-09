/*
 * @Author: zyuan
 * @Date:   2016-11-25 12:46:19
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-03-13 19:25:42
 */

'use strict';
import cui from 'c-ui'
import "../../components/ueditor"
import aj from "../../util/ajaxHelper";
import AddMessTem from '../../components/tem-mes-addtem/index'
import SlideSwitch from '../../components/slide-switch/index'
import MesDetail from '../../components/tem-mes-detail/index'
import SuccessTip from '../../components/tips/successTip'
import DeleteTip from '../../components/tips/deleteTip'
import dalTemplate from '../../dao/projectManagement/template'
import session from '../../dao/sessionContext'
import '../../components/share/hfCommon'

import '../../components/commonTab/style.less'
import './message.less'


class messageTem {
    constructor() {
        this.slideList = Array.from($('.tpl-main .slideBtn'), (elem) => new SlideSwitch(elem))
        this.checkboxes = Array.from($('.cui-checkboxContainer'), (v) => new cui.Checkbox($(v)))
        this.watch()
    }
    watch() {
        var self = this;
        //新建
        $('#addTemplate').on('click', () => {
            let config = {
                title: '创建短信模板'
            }
            this.addMessTem = new AddMessTem(config)
        })

        $('.temple-wrap .tpl-title .selectAll').on('click', 'input', () => { //全选和反选
            var self = this;
            for (let [i, v] of self.checkboxes.entries()) {
                if (self.checkboxes[0].getValue()) {
                    v.val = true;
                    v.$el.find('input[type=checkbox]')[0].checked = true;
                } else {
                    v.val = false;
                    v.$el.find('input[type=checkbox]')[0].checked = false;
                }

            }
        })

        $('.temple-wrap .tpl-item .cui-checkboxContainer').on('click', 'input', () => { //单个
                let self = this,
                    count = 0;
                for (let [i, v] of self.checkboxes.entries()) {
                    if (i > 0 && v.getValue()) {
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
            //状态切换
        for (let v of self.slideList) {
            v.$el.on('click', (e) => {
                session.customer().then((r)=>{
                    return dalTemplate.mesTemplateStatus({
                        id: v.$el.data('id'),
                        accessToken: r.accessToken,
                        status: !v.get()
                    })
                }).then((res) => {
                    if(res.code == 0){
                        v.toggleClass()
                    }else{
                        cui.popTips.error(res.message)
                    }
                }, () => {
                    cui.popTips.error('请稍后重试')
                })
            })
        }


        //修改模板
        $('.temple-wrap .tpl-item .edit').on('click', (e) => {
            var $el = $(e.target)
            var _data = {
                id: $el.data('id'),
                whetherDefault: $el.parents('.tpl-item').find('.whetherDefault').data('whetherdefault'),
                name: $el.parents('.tpl-item').find('.name').text(),
                content: $el.data('content')
            }
            let config = {
                title: '修改短信模板',
                type: 'edit',
                data: {
                    message: _data
                }
            }
            this.editMessTem = new AddMessTem(config)
        })

        //查看模板
        $('.temple-wrap .tpl-item .detail').on('click', (e) => {
            var data = {
                type: 'single',
                content: $(e.target).data('content')
            }
            let config = {
                title: '查看短信模板',
                data: {
                    mes: data
                }
            }
            this.mesDetail = new MesDetail(config)
        })

        //单个删除
        $('.temple-wrap .tpl-item .del').on('click', (e) => {
            var id = $(e.target).data('id')
            new DeleteTip(()=>{
                session.customer().then((r)=>{
                    return dalTemplate.deleteMesTemplate({
                        accessToken: r.accessToken,
                        id
                    })
                }).then((res) => {
                    if(res.code ==0){
                        $(e.target).parents('.tpl-item').remove()
                        new SuccessTip("删除成功",null,false)
                    }else{
                        cui.popTips.error(res.message)
                    }
                }, () => {
                    cui.popTips.error('请稍后重试')
                })
            },{time:1000,isAuto:false})

        })

        //批量删除
        $('#delTemplate').on('click', () => {
            var id = '';
            for (let [i, v] of self.checkboxes.entries()) {
                if (i != 0 && v.getValue()) {
                    id += v.$el.data('id') + ','
                }
            }
            if(!id){
                cui.popTips.warn('请勾选要删除模板')
                return;
            }
            new DeleteTip(()=>{
                session.customer().then((r)=>{
                    return dalTemplate.deleteMesTemplate({
                        accessToken: r.accessToken,
                        id
                    })
                }).then((res) => {
                    if(res.code ==0){
                        for (let [i, v] of self.checkboxes.entries()) {
                            if (i != 0 && v.getValue()) {
                                v.$el.parents('.tpl-item').remove()
                            }
                        }
                        new SuccessTip("删除成功",null,false)
                        self.checkboxes[0].setValue(false)
                    }else{
                        cui.popTips.error(res.message)
                    }
                }, () => {
                    cui.popTips.error('请稍后重试')
                })
            },{time:1000,isAuto:false})

        })
    }
}

let messageTemIns = new messageTem();
