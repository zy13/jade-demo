/*
 * @Author: zyuan
 * @Date:   2016-12-19 10:49:42
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-02-14T15:28:02+08:00
 */

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import addTpl from '../tpl/add_selectBox.html';
import SuccessTip from '../../../components/tips/successTip'

import session from '../../../dao/sessionContext';
import setGlobalDao from '../../../dao/projectManagement/setGlobalAccount'

const juicerTpl = juicer(addTpl);

class AddSelectBox {
    constructor(data) {
        this.data = data || '';
        this.initModal();
    }
    initModal() {
        let renderData = {
                msg: ['选项1', '选项2', '选项3', '选项4']
            },
            tplHtml = $(juicerTpl.render(renderData)),
            tmpHeader = $(`<span>属性设置</span>`),
            modalPanel = new cui.Panel(tmpHeader, $(tplHtml)),
            modalBrocken = new cui.Brocken();

        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css({
            width: '610px'
        });

        this.modal.open();
        this.initControl();
        this.handleDelAdd();
        this.modal.on('modalClose', () => this.modal.$container.remove());

        this.handleConfirm();
        $('.cancel').on('click', () => this.modal.$container.remove());
    }
    initControl() {
        this.txtBoxes = Array.from($('.add_selector .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.radioGroup = Array.from($('.add_selector .cui-radioGroupContainer'), (v) => new cui.RadioGroup($(v)));
    }
    handleDelAdd() {
        //添加
        this.handleAdd('.cpf-icon-ic_add');

        //删除
        this.handleDel($('.add_selector .cpf-icon-ic_forbidden_line'));
    }
    handleAdd($e) {
        $('.add_selector').on('click', $e, (event) => {
            let $this = $(event.currentTarget);
            let len = $('.add_selector .block').length;
            let cont = this.handleCont(len);
            let $html = $(this.htmlTpl(cont));
            let $el = $html.find('.cpf-icon-ic_forbidden_line')
            $this.parents('.option-tag-mgl-30').removeClass('option-tag-mgl-30') //.addClass('cpf-icon-ic_forbidden_line')
            $this.remove();
            $('.add_selector .handleData').append($html);
            $html.on('click', '.cpf-icon-ic_forbidden_line', (e) => {
                let $this = $(e.currentTarget);
                //检测至少保存一项选项
                if (this.checkedOptionLength() - 1 == 0)
                    return cui.popTips.error('不能删除，至少包含一个选项');

                //删除时候回复添加符号
                if ($this.siblings().is('.cpf-icon-ic_add')) {
                    let prevEl = $this.parents('.cui-radioGroupContainer').prev(),
                        optSpanEl = prevEl.addClass('option-tag-mgl-30').find('.cui-textBoxContainer span');
                    $('i', optSpanEl).before(`<i  class='cpf-icon cpf-icon-ic_add'></i>`);
                }
                $this.parents('.cui-radioGroupContainer').remove(); //('.block').remove();
                $('.add_selector .block .cui-textBoxContainer input').each((j, v) => {
                    $(v).attr('placeholder', this.handleCont(j));
                })
            })
            this.initControl();
        })
    }
    checkedOptionLength() {
        return $('.add_selector .handleData .cui-radioGroupContainer').length;
    }
    handleDel($el) {
        $el.map((index, i) => {
            $(i).on('click', () => {
                //检测至少保存一项选项
                if (this.checkedOptionLength() - 1 == 0)
                    return cui.popTips.error('不能删除，至少包含一个选项');
                let $this = $(i);
                if ($this.siblings().is('.cpf-icon-ic_add')) {
                    let prevEl = $this.parents('.cui-radioGroupContainer').prev(),
                        optSpanEl = prevEl.addClass('option-tag-mgl-30').find('.cui-textBoxContainer span');
                    $('i', optSpanEl).before(`<i  class='cpf-icon cpf-icon-ic_add'></i>`);
                }
                $(i).parents('.cui-radioGroupContainer').remove();
                $('.add_selector .block .cui-textBoxContainer input').each((j, v) => {
                    $(v).attr('placeholder', this.handleCont(j));
                })
                this.initControl()
            })
        })
    }
    handleConfirm() {
        $('.add_selector .confirm').on('click', () => {
            let validate = true;
            let txt = this.txtBoxes[0].getValue();
            for (let i of this.txtBoxes) {
                if (!i.getValidate()) {
                    $('.add_selector .cui-textBoxContainer input').focus().blur();
                }
                validate = validate && i.getValidate();
            }
            $('.must .inputs .cui-checkboxContainer label span').each((i, v) => {
                if ($(v).text() == txt || txt == '帐号') {
                    validate = false
                    this.txtBoxes[0].$el.attr('data-tips', '属性名称已存在')
                        .find('input')
                        .val('').focus().blur();
                }
            });
            if (validate) {
                let $fn = (name) => {
                    let $el = $(this.checkBoxTpl(txt, name))
                    this.modal.$container.remove();
                    if ($('#tempInput').length > 0) {
                        $('#tempInput').before($el);
                    } else {
                        $('.byself .byself-inputs').append($el);
                    }
                    $el.attr('title',txt).find('label span').text(txt)
                    // $('.byself .byself-inputs').on('click', 'input', (e) => {
                    //     this.handleByselfCheckbox(e);
                    // });
                    this.ckboxesBySelf = Array.from($('.setAccountInfo .byself .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));
                };
                //获取选项数据
                let aryValue = [];
                this.txtBoxes.slice(1, this.txtBoxes.length).map((item) => {
                    aryValue.push(item.getValue());
                })

                //添加数据
                session.customer().then((r) => {
                    return setGlobalDao.addSelectedInfo({
                        accessToken: r.accessToken,
                        fieldName: txt,
                        selectValue: aryValue.join(','),
                        type: 3
                    })
                }).then((r) => {
                    if (r.code == 0) {
                        new SuccessTip('设置成功', () => {
                            $fn(r.response)
                        });
                        $('.setAccountInfo .item .selector').off('click');
                    } else {
                        cui.popTips.error(r.message);
                        return false;
                    }
                })

            }
        })
    }
    handleCont(len) {
        return `选项${len+1}`;
    }
    htmlTpl(cont) {
        return `<div class="cui-radioGroupContainer option-tag-mgl-30">
                    <div class='block'>
                        <div class="cui-radioContainer inline">
                            <input type="radio" name="addAttr" value="" >
                            <label>
                                <i></i>
                                <span></span>
                            </label>
                        </div>
                        <div class="cui-textBoxContainer inline"  data-rule="required" data-tips='选项不能为空,如不需要，请删除'>
                            <input type="text" placeholder="${cont}" value='' />
                                <span>
                                    <i  class='cpf-icon cpf-icon-ic_add'></i>
                                    <i  class='cpf-icon cpf-icon-ic_forbidden_line'></i>
                                </span>
                        </div>
                    </div>
                </div>`;
    }
    checkBoxTpl(txt, name) {
        return `<div class="cui-checkboxContainer inline" data-type="3" data-value=""  title="">
                    <input type="checkbox" name="${name}"/>
                    <label>
                        <i></i>
                        <span></span>
                    </label>
                    <span class="delField" data-value="${name}">x</span>
                </div>`;
    }
    handleByselfCheckbox(e) {
        let $this = $(e.currentTarget);
        let txt = $this.closest('.cui-checkboxContainer').find('label span').text();
        let $html = `<div class='cui-checkboxContainer inline'>
                                <input type='checkbox'/>
                                <label>
                                    <i></i>
                                    <span></span>
                                </label>
                            </div>`;
        if ($this[0].checked) {
            $('.must .inputs .cui-checkboxContainer label span').each((i, v) => {
                if ($(v).text() == txt) {
                    $('.must .cui-checkboxContainer').eq(i).remove();
                }
            });
            $('.must .inputs').append($html);
            this.ckboxesByMust = Array.from($('.setAccountInfo .must .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)));

        } else {
            $('.must .cui-checkboxContainer label span').each((i, v) => {
                if ($(v).text() == txt) {
                    $('.must .cui-checkboxContainer').eq(i).remove();
                }
            });
        }
    }
}

export default AddSelectBox
