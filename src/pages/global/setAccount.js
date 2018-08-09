/**
 * @Author: Jet.Chan
 * @Date:   2016-12-13T15:24:36+08:00
 * @Email:  guanjie.chen@talebase.com
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-01-18T14:42:28+08:00
 */


import '../../components/share/hfCommon'
import '../../components/commonTab/style.less'
import './setAccount.less'

import cui from 'c-ui'
import session from '../../dao/sessionContext'
import AddSelectBox from './mod/add_selectBox'

import setGlobalDao from '../../dao/projectManagement/setGlobalAccount'
import SuccessTip from '../../components/tips/successTip'
import Del from '../../components/tips/deleteTip'

class setGlobalAccount {
    constructor() {
        this.count = 1;
        this.globalStatus = true;
        this.getContext();
        this.handleAccountInfo();
    }
    getContext() {
        let self = this;
        session.customer().then((res) => {
            self.context = res;
        })
    }
    handleAccountInfo() {
        this.ckboxesBySelf = Array.from($('.setAccountInfo .byself .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
        this.ckboxesByMust = Array.from($('.setAccountInfo .must .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
        this.ckboxesByUnique = Array.from($('.setAccountInfo .unique .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));

        //tab
        $('.btn').on('click', (e) => {
            let $this = $(e.currentTarget);
            $this.addClass('cur');
            $('.setAccountInfo').removeClass('dis').siblings('.mainInfo').addClass('dis');
            $('.pagination').addClass('dis');
        });

        //保存修改
        $('.setAccountInfo .button').on('click', '.mr-10', () => {
            if(this.globalStatus){
                this.handleSave()
            }
        });

        //取消
        $('.setAccountInfo .button').on('click', '.cancel', (e) => {
            window.location.href = '/customer/projectList/index'
        });

        //添加测评者必填属性
        $('.byself ').on('click', '.cui-checkboxContainer input', (e) => {
            this.handleByselfCheckbox(e)
        })

        //删除
        $('.byself ').on('click', '.cui-checkboxContainer .delField', (e) => {

            e.stopPropagation();
            let fieldKey = $(e.currentTarget).data('value');
            //弹出确认框
            new Del(() => {
                session.customer().then((r) => {
                    return setGlobalDao.deleteGlobalSelectedInfo({
                        fieldKey,
                        accessToken: r.accessToken
                    })
                }).then((r) => {
                    if (r && r.code == 0) {
                        $(e.target).parent().remove();
                        $(`.must .cui-checkboxContainer input[name=${fieldKey}]`).parent().remove();
                        new SuccessTip('删除成功', null, true, 100)
                        setTimeout(()=>{
                            window.location.reload();
                        },800)
                    } else {
                        return cui.popTips.error(r.message)
                    }
                })
            }, {
                isAuto: false
            })
        })

        //可选信息-添加输入框
        this.handleByselfInput('.selected', 'tempInput', '1');

        //可选信息-添加日历
        this.handleByselfInput('.calendate', 'tempInput', '2');

        //添加下拉框
        $('.setAccountInfo .item').on('click', '.selector', () => {
            if($('#isextension').data('value')==20){
                return cui.popTips.error('自定义属性不能超过20个')
            }
            new AddSelectBox('3');
        })
    }
    handleByselfCheckbox(e) {
        let $this = $(e.currentTarget);
        let txt = $this.closest('.cui-checkboxContainer').find('label span').text();
        let $html = $(`<div class='cui-checkboxContainer inline'>
                                        <input type='checkbox' name ='${$this.attr('name')}'/>
                                        <label>
                                            <i></i>
                                            <span></span>
                                        </label>
                                    </div>`);
        if ($this[0].checked) {
            $('.must .inputs .cui-checkboxContainer label span').each((i, v) => {
                if ($(v).text() == txt) {
                    $('.must .cui-checkboxContainer').eq(i).remove();
                }
            });

            $html.attr('title',txt).find('label span').text(txt)
            $('.must .inputs').append($html);
            console.log($html)
            this.ckboxesByMust.push(new cui.Checkbox($(`.must input[name=${$this.attr('name')}]`).parent()));

        } else {
            $('.must .cui-checkboxContainer label span').each((i, v) => {
                if ($(v).text() == txt) {
                    $('.must .cui-checkboxContainer').eq(i).remove();
                }
            });
        }
    }
    handleByselfInput($el, $id, type) {
        $($el).on('click', (e) => {
            if($('#isextension').data('value')==20){
                return cui.popTips.error('自定义属性不能超过20个')
            }
            if ($('#' + $id).length) {
                $('#' + $id).focus().blur();
                return false;
            } else {
                let $ids = '#' + $id;
                let $idTarget = '.setAccountInfo ' + $ids;
                let $html = `<div class="cui-textBoxContainer inline" data-rule="required" id=${$id} data-tips='请输入名称'>
                            <input type="text" placeholder="请输入名称" value="" maxlength="50"/>
                            <span class='addonRight'>x</span>
                        </div>`;
                //插入输入框
                $('.byself .byself-inputs').append($html);
                this.txtboxesByMust = Array.from($('.setAccountInfo .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));

                //处理输入框
                $($idTarget).find('input[type=text]')
                    .focus().blur((e) => {
                        let tempInputText = $($idTarget).find('input[type=text]').val().trim();
                        const _ = this;
                        if (tempInputText) {
                            let validate = true;
                            for (let i of this.ckboxesBySelf) {
                                let txt = i.$el[0].innerText;
                                if (tempInputText == txt || tempInputText == '账号') {
                                    validate = false;
                                }
                            }

                            if (validate) {
                                session.customer().then((r) => {
                                    return setGlobalDao.addSelectedInfo({
                                        accessToken: r.accessToken,
                                        fieldName: tempInputText,
                                        selectValue: '',
                                        type
                                    })
                                }).then((r) => {
                                    if (r.code == 0) {
                                        /**
                                        if (process.env.NODE_ENV == 'development')
                                            r.response = r.response + (_.count++);
                                         **/
                                        let $el = $(_.handleHtml(type, tempInputText, r.response))
                                        $el.find('label span').text(tempInputText)
                                        $('.byself .byself-inputs').append($el);
                                        $el.attr('title',tempInputText)
                                        _.ckboxesBySelf.push(new cui.Checkbox($(`input[name=${r.response}]`).parent()));
                                        $($idTarget).remove();

                                        this.globalStatus = true;
                                    } else {
                                        cui.popTips.error(r.message);
                                        this.globalStatus = false;
                                    }
                                })

                            } else {
                                // $($idTarget).attr('data-tips', '名称已存在')
                                //     .find('input')
                                //     .val('').focus().blur();
                                this.txtboxesByMust[0].setValidate(false, '名称已存在')
                            }
                        }
                    })

                //删除输入框
                $($idTarget).on('click', '.addonRight', () => {
                    $($ids).remove();
                })
            }

        })
    }
    handleHtml(type, txt, name) {
        return `<div class='cui-checkboxContainer inline' title="">
                        <input type="checkbox" name="${name}" data-type="${type}"/>
                        <label>
                            <i></i>
                            <span></span>
                        </label>
                        <span class="delField" data-value="${name}">x</span>
                    </div>`;
    }
    handleSave() {
        if (!this.context) {
            return cui.popTips.error('网络出错')
        } else {
            let requiredKey = [],
                showKey = [],
                uniqueKey = [];

            //有未保存的字段不能保存,空格不允许保存
            let inputTextValue = $('.item.byself .byself-inputs .cui-textBoxContainer>input[type=text]').val();
            if (inputTextValue != undefined && inputTextValue.trim() == '') {
                return cui.popTips.error('请输入名称');
            }

            $('.item.byself .byself-inputs .cui-checkboxContainer>input[type=checkbox]:checked').map((i, v) => {
                showKey.push($(v).attr('name'));
            })

            $('.item.must .inputs .cui-checkboxContainer>input[type=checkbox]:checked').map((i, v) => {
                requiredKey.push($(v).attr('name'));
            })
            $('.item.unique .cui-checkboxContainer>input[type=checkbox]:checked').map((i, v) => {
                uniqueKey.push($(v).attr('name'));
            })
            let opts = {
                accessToken: this.context.accessToken,
                requiredKey: requiredKey.join(','),
                showKey: showKey.join(','),
                uniqueKey: uniqueKey.join(',')
            }
            setGlobalDao.saveSettedAccount(opts).then((res) => {
                if (res && res.code == 0) {
                    new SuccessTip('保存成功！')
                    setTimeout(()=>{
                        window.location.reload();
                    },1000)
                } else {
                    return cui.popTips.error(res.message)
                }
            })
        }
    }
}

let setGlobalAccountIns = new setGlobalAccount();
