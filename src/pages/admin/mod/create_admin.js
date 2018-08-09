/*
 * @Author: zyuan
 * @Date:   2016-12-02 18:10:32
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-13T21:01:24+08:00
 */

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import createTpl from '../tpl/create_admin.html';
import SuccessTip from '../../../components/tips/successTip'

import session from '../../../dao/sessionContext';
import adminDao from '../../../dao/administratorSetting/admin.js';
import SlideSwitch from '../../../components/slide-switch/index';

import {
    RandomString,
    FormOptions
} from '../../../components/share/tools.js';

const juicerTpl = juicer(createTpl);

class AdminMgtItem {
    constructor(params) {
        this.initData(params);
        this.initModal();
        this.initControl();
        this.handleInput();
    }
    initModal() {
        let tplHtml = $(juicerTpl.render(this.conf)),
            tmpHeader = $(`<span>${this.conf.title}</span>`),
            modalPanel = new cui.Panel(tmpHeader, $(tplHtml)),
            modalBrocken = new cui.Brocken(),
            modalH = $(window).width()>1400 ? parseInt($(window).height()*0.8, 10):parseInt($(window).height()*0.9, 10);

        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
        this.modal.$container.find('.cui-panel-content').css({
            height: modalH-100,
            overflowY: 'auto',
            overflowX: 'hidden'
        })
        modalPanel.getPanel().css({
            height: modalH,
            width: '610px'
        });
        this.modal.open();
        this.modal.on('modalClose', () => {
            this.modal.$container.remove()
        })

        $('.cancel').on('click', () => {
            this.modal.$container.remove();
        })
        $('.create .confirm').on('click', () => {
            let validate = true;
            for (let i of this.textBoxes) {
                if (i.$el.is('.password')) {
                    let pwdInput = i.$el.find('input'),
                        pwdVal = pwdInput.val();
                    if (!pwdVal || pwdVal.length < 6) {
                        pwdInput.addClass('failure');
                        i.$el.append(`<div class="valid-tips" style="top:${pwdInput.outerHeight()+5}px;max-width: 202px;display:block;"><div class="valid-tips-arrow"></div><div class="valid-tips-inner">密码不能为空或少于6位</div></div>`)
                        pwdInput.one('focus', (e)=> {
                            pwdInput.removeClass('failure')
                        });
                        setTimeout(() => {
                            i.$el.find('.valid-tips').remove();
                        }, 1200)
                        return false;
                    }
                }
                if (!i.getValidate()) {
                    $('.create .cui-textBoxContainer.valtextbox input').focus().blur();
                }
                validate = validate && i.getValidate();
            }
            if (validate) {
                const fp = new FormOptions($('.create').parent());
                let model = fp.getDataObj(),userId;

                //获取 下拉，checkbox，拖拽值
                model.status = this.slideList[0].get() ? 1 : 0;
                model.roleId = this.selectBoxes[0].getValue() && this.selectBoxes[0].getValue() ? this.selectBoxes[0].getValue().value : this.selectBoxes[0].$el.find('.activeItem').data('value') || '';
                model.groupId = this.selectBoxes[1].getValue() && this.selectBoxes[1].getValue() ? this.selectBoxes[1].getValue().value : this.selectBoxes[1].$el.find('.activeItem').data('value') || '';
                session.customer().then((customer) => {
                    userId = customer.userId;
                    model.accessToken = customer.accessToken;
                    if (this.conf.type == 'add')
                        return adminDao.createAdmin(model)
                    else {
                        model.id = this.conf.data.id;
                        model.account = undefined;
                        return adminDao.editAdmin(model)
                    }
                }).then((r) => {
                    if (r.code == 0) {
                        new SuccessTip(`${this.conf.type=='add'?'添加':'编辑'}成功`)

                        if(model.id && userId == model.id){      //修改的管理员恰好是登录的管理员
                            $.ajax({
                                type: 'post',
                                url: '/customer/session/update',
                                data: {
                                    name: model.name
                                }
                            }).done((res)=>{
                                let userName = model.name && model.name.length>0 ? model.name : $('.create input[name=account]').val();
                                $(window.parent.document).find('#ex-header .ex-content-rgt .setting>a>span').text(userName)
                                window.location.reload();
                            })
                        }else{
                            window.location.reload();
                        }

                    } else {
                        cui.popTips.error(r.message);
                    }
                }).catch((err) => {
                    cui.popTips.error('系统异常！');
                    console.log(err);
                })
            }
        })
    }
    initControl() {
        this.textBoxes = Array.from($('.create .cui-textBoxContainer.valtextbox'), (v) => new cui.TextBox($(v)));
        this.selectBoxes = Array.from($('.create .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
        this.slideList = Array.from($('.create .slideBtn'), (v) => new SlideSwitch(v));
        this.checkboxes = Array.from($('.create .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
        this.textBoxes[1].$el.find('input, textarea').off('focus').off('blur');;
        $('.create .cui-checkboxContainer input').on('click', (e) => {
            if (this.checkboxes[0].getValue()) {
                const rdPwd = new RandomString().getTypeString(6, 6, "number,letter,char"); //TODO:随机密码
                $('input[name=password]').attr('readonly', 'true').val(rdPwd);
                $('.password .ie-placeholder').hide();
            } else {
                $('input[name=password]').removeAttr('readonly').val('')
                $('.password .ie-placeholder').show();
            }
        })
        this.slideList.forEach((v) => {
            v.$el.on('click', (eve) => {
                v.toggleClass(false)
            })
        })
        $('.create .input-groups').on('click', (e) => {
            setTimeout(() => {
                this.selectBoxes.map((item) => {
                    if (item.$el.hasClass('active'))
                        item.close()
                })
            }, 200);
        })

        //下拉选择框不重叠显示
        this.selectBoxes.map((item) => {
            item.$el.on('click', (e) => {
                this.selectBoxes.map((v) => {
                    if (!v.$el.is($(e.currentTarget)) && v.$el.hasClass('active')) {
                        v.close();
                    }
                });
                return false;
            })
        })


        /**
        let slc_role_value = this.conf.type == 'add' ?
            this.selectBoxes[0].data.options[0].value :
            this.conf.data.roleId,
            slc_group_value = this.conf.type == 'add' ?
            this.selectBoxes[1].data.options[0].value :
            this.conf.data.groupId;
         **/
        let slc_role_value = this.conf.type == 'add' ?
            (this.conf.data.roleId ? this.conf.data.roleId : this.selectBoxes[0].data.options[0].value) :
            this.conf.data.roleId,
            slc_group_value = this.conf.type == 'add' ?
            (this.conf.data.groupId ? this.conf.data.groupId : this.selectBoxes[1].data.options[0].value) :
            this.conf.data.groupId;

        this.selectBoxes[0].setValue({
            value: slc_role_value
        })
        this.selectBoxes[1].setValue({
            value: slc_group_value
        })
    }
    handleInput() {
        $('.create .cui-textBoxContainer input').on('keyup', (e) => {
            let $this = $(e.currentTarget);
            if($this.val().length>=50){
                let str = $this.val().slice(0, 50).replace(/\S{51,}/, '');
                $this.val(str);
            }
        })
    }
    initData(params) {
        this.conf = {
            title: '创建管理员',
            type: 'add',
            data: {
                account: '',
                email: '',
                groupId: '',
                id: '',
                mobile: '',
                name: '',
                roleId: '',
                status: 1
            },
            roleJson: '[{"value":1,"text":"10"},{"value":2,"text":"20"},{"value":3,"text":"30"},{"value":4,"text":"50"}]',
            groupJson: '[{"value":1,"text":"10"},{"value":2,"text":"20"},{"value":3,"text":"30"},{"value":4,"text":"50"}]'
        };
        if (params && typeof params == 'object')
            this.conf = Object.assign(this.conf, params)

    }
}
export default AdminMgtItem
