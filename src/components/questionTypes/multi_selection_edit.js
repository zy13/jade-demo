/**
 * @Author: Jet.Chan
 * @Date:   2016-12-22T17:50:51+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-11T21:52:29+08:00
 */
import cui from 'c-ui';
import './commonStyle/style.less'
import './multi_selection.less'
import './multi_selection_edit.less'
import loading from '../loading';
import baseClass from './base/questionClass';
import SuccessTip from '../tips/successTip';
import WarnTip from '../tips/warnTip';
import juicer from 'juicer';
//多选题
import tpl_multi_selection from './tpl/multi_selection.html';
import tpl_single_selection from './tpl/single_selection.html';
const juicerTpl = juicer(tpl_multi_selection);
const juicerTpl_single = juicer(tpl_single_selection);

import tplEdit_multi_selection_edit from './tpl/multi_selection_edit.html';
import tplEdit_single_selection_edit from './tpl/single_selection_edit.html';
const juicerTplEdit = juicer(tplEdit_multi_selection_edit);
const juicerTplEdit_single = juicer(tplEdit_single_selection_edit);


// 修改单选 {"dOptionStemSetting":{"question":"单选择题","options":[{"maskCode":"maskCodeOne","label":"选项一","answer":false},{"maskCode":"maskCodeTwo","label":"选项二","answer":false}]},"unicode":"optionCode","type":4}
// 修改多选{"dOptionStemSetting":{"question":"多选择题","options":[{"maskCode":"maskCodeOne","label":"选项一","answer":false},{"maskCode":"maskCodeTwo","label":"选项二","answer":false}]},"unicode":"optionMultipleCode","type":5}

const defaultValue = {
    "dOptionStemSetting": {
        "question": "请填写题目",
        "options": [{
            "label": "请填写选项"
        }, {
            "label": "请填写选项"
        }, {
            "label": "请填写选项"
        }]
    },
    "dOptionStyleSetting": {
        "optionSetting": 1
    },
    "type": 5
}

class multi_selection extends baseClass {
    constructor($container) {
        super();

        this.$container = $container;
        this.editOptionsLength = 1;
    };

    addSubject(data) {
        setTimeout(() => {
            loading.open();
            let dataConf = Object.assign({}, defaultValue, data || {}),
                postData = {};
            postData.jsonStr = JSON.stringify(defaultValue);
            postData.subject = 'option';
            postData.paperId = data.paperId;

            this.add(postData, (r) => {
                let objRp = JSON.parse(r.response);
                dataConf.dOptionStemSetting = objRp.dOptionStemSetting;
                dataConf.dOptionStyleSetting = objRp.dOptionStyleSetting;
                dataConf.unicode = objRp.unicode;
                dataConf.sortNum = this.$container.createIndex;
                dataConf.dataString = JSON.stringify(dataConf);

                let $addTpl = $(juicerTpl.render(dataConf));
                this.appendToSpecifyElem(this.$container, $addTpl);

                //编辑状态切换
                $('.edit', $addTpl).on('click', (e) => {
                    if (!this.getEditControlLength()) {
                        let $this = $(e.currentTarget),
                            dataConf = $this.data('value');
                        this.showEdit($this.parents('.preview-question'), dataConf);
                    }
                })

                this.copyAndDelete($addTpl,this)

                this.$container.createIndex++;

                setTimeout(() => {
                    loading.close();
                }, 200);
            });
        }, 200);
    }

    showPreview(preViewDataConf, $editTpl) {
        if(!preViewDataConf.dOptionStyleSetting){
                preViewDataConf.dOptionStyleSetting = {
                "optionSetting": 1
            }
        }
        let $preViewTpl
        if (preViewDataConf.type == '5')
            $preViewTpl = $(juicerTpl.render(preViewDataConf));
        else
            $preViewTpl = $(juicerTpl_single.render(preViewDataConf));

        this.displaceTpl($editTpl, $preViewTpl, () => {
            if (this.editUes) {
                this.editUes.map((item) => {
                    item.ue.destroy();
                })
                this.editUes.length = 0;
            }

            $('.edit', $preViewTpl).on('click', (e) => {
                if (!this.getEditControlLength()) {

                    let $this = $(e.currentTarget),
                        dataConf = $this.data('value');
                    this.showEdit($this.parents('.preview-question'), dataConf);
                }
            })

            this.copyAndDelete($preViewTpl,this)

        });
    }

    showEdit(displaceTpl, dataConf) {
        let self = this,
            $editTpl;
        if (typeof dataConf == 'string')
            dataConf = JSON.parse(dataConf)
        dataConf.dataString = JSON.stringify(dataConf);
        if (dataConf.type == '5')
            $editTpl = $(juicerTplEdit.render(dataConf));
        else
            $editTpl = $(juicerTplEdit_single.render(dataConf));

        //设置模版选中值
        this.displaceTpl(displaceTpl, $editTpl, () => {

            //初试化富文本
            this.editUes = this.initUEditor($('script', $editTpl));
            this.editOptionsLength = $editTpl.find('.options-item').length;
            this.selectBoxs = Array.from($('.ques-setting .cui-selectBoxContainer', $editTpl), (v) => new cui.SelectBox($(v)));

            Array.from($('.ques-setting .cui-checkboxContainer', $editTpl), (v) => new cui.Checkbox($(v)))

            //右手设置项 每行数值

            let opSettingCount = dataConf.dOptionStyleSetting?dataConf.dOptionStyleSetting.optionSetting:1
            this.selectBoxs[0].setValue({
                value: opSettingCount,
                text: opSettingCount
            })
        });


        //编辑保存
        $('.cui-button.save', $editTpl).on('click', (e) => {
            if(!self.checkWordLimit($editTpl,self.editUes)){
                return cui.popTips.error('题干和选项内容均不能大于10000');
            }


            self.step = 0;
            let $this = $(e.currentTarget);
            let data = this.getEditFormData($editTpl);

            let postData = Object.assign({}, data);
            postData.subject = 'option';

            postData.jsonStr = JSON.stringify({
                dOptionStemSetting: data.dOptionStemSetting,
                dOptionStyleSetting: data.dOptionStyleSetting,
                type: data.type
            });
            // console.log(postData)

            loading.open()
            this.save(postData, (r) => {
                loading.close()
                if(r.response){
                    this.updateData(r.response)
                }

                self.step++;
                if (self.step == 2) {
                    self.getShowPreviewData($editTpl)
                }

            })
            self.settingSave($editTpl, true)
        })

        //setting中的保存
        $('.ques-setting .tc a', $editTpl).on('click', (e) => {
            self.settingSave($editTpl)
        })


        //当前题目更换选项类型
        $('.changeOptionsTypes', $editTpl).on('click', (e) => {
            let $this = $(e.currentTarget),
                type = $this.data('type');
            $('.changeOptionsTypes', $editTpl).removeClass('active');
            $this.addClass('active');
            $('input[name=type]', $editTpl).val(type)
        });



        //添加选项
        $('.content .add-option a', $editTpl).on('click', (e) => {
            let $this = $(e.currentTarget),
                type = $('input[name=type]', $editTpl).val();
            this.editOptionsLength++;
            let newOptId = `optionContent${this.editOptionsLength}`,
                optionHtml = `<div class="options-item">
                ${type==5?'<div class="cui-checkboxContainer inline"><input type="checkbox"><label><i></i></label></div>':
                '<div class="cui-radioContainer inline"><input type="radio" name="options1" value=""><label><i></i></label></div>'}
                <div class="option-content">
                    <script id="${newOptId}" type="text/plain">请填写选项</script>
                </div><i class="cpf-icon cpf-icon-thin-close del-option" data-id='${newOptId}'></i></div>`,
                $optionHtml = $(optionHtml);
            $editTpl.find('.options').append($optionHtml);
            this.editUes = this.editUes.concat(this.initUEditor($optionHtml.find('script')));
        })

        //绑定编辑状态 选项删除按钮
        $editTpl.on('click', '.cpf-icon-thin-close.del-option', (e) => {
            let $this = $(e.currentTarget),
                $optItem = $this.parents('.options-item');
            let delId = $this.data('id');

            $optItem.remove();
            let newUes = [];
            this.editUes.map((item) => {
                if (item.key != delId)
                    newUes.push(item);
                else
                    item.ue.destroy();
            })
            this.editUes.length = 0;
            this.editUes.push.apply(this.editUes, newUes);
        })

    }


    updateData(data){
        if(typeof data == 'string')
            this.saveData = JSON.parse(data)
    }

    settingSave($tpl, save = false) {

        let self = this,
            oldType = parseInt($('.ques-setting .tc a', $tpl).data('type')),
            type = parseInt($('input[name=type]', $tpl).val()),
            lineNum = this.selectBoxs.length > 0 && this.selectBoxs[0].getValue() ? this.selectBoxs[0].getValue().value : '';


        //修改本题的pc端每行x个
        let data = {
            unicode: $tpl.find('input[name=id]').val(),
            jsonStr: JSON.stringify({
                "type": 2,
                "dOptionStyleSetting": lineNum
            }),
            paperId: $('body #paperUnicode').val()
        }

        loading.open()
        self.changeType(data, (r) => {
            self.changeAllQuesStyle({
                $tpl,
                data: data.jsonStr,
                oldType,
                type,
                save
            })
        })
    }


    //修改同类型题目和布局
    changeAllQuesStyle(s) {

        let self = this;
        if ($('.ques-setting .cui-checkboxContainer:eq(1) input[type=checkbox]:checked', s.$tpl).length == 1) { //应用到同类型题目

            let $ques = s.oldType == '4' ? $('.preview-question.single') : $('.preview-question.multiple'),
                total = $ques.length,
                count = 0
            if (total == 0) {
                $('.ques-setting .cui-checkboxContainer:eq(1) input[type=checkbox]', s.$tpl)[0].checked = false;
                self.changeQuesType({
                    $tpl: s.$tpl,
                    oldType: s.oldType,
                    type: s.type,
                    save: s.save
                });
                return;
            }
            for (let v of $ques) {
                let _data = {
                    unicode: $(v).data('id'),
                    jsonStr: s.data
                }
                self.changeType(_data, (r) => {

                    let lineNum = JSON.parse(s.data).dOptionStyleSetting,
                        config = $(v).find('.edit').data('value')
                    if (typeof config != "object")
                        config = JSON.parse(config)

                    config.dOptionStyleSetting = lineNum
                    $(v).find('.options-item').attr('class',`options-item item${lineNum}`)
                    $(v).find('.edit').data('value', JSON.stringify(config))

                    count++;
                    if (count == total) {
                        $('.ques-setting .cui-checkboxContainer:eq(1) input[type=checkbox]', s.$tpl)[0].checked = false;
                        self.changeQuesType({
                            $tpl: s.$tpl,
                            oldType: s.oldType,
                            type: s.type,
                            save: s.save
                        });
                    }
                })
            }
        } else {
            self.changeQuesType({
                $tpl: s.$tpl,
                oldType: s.oldType,
                type: s.type,
                save: s.save
            });
        }
    }

    getShowPreviewData($tpl) {

        let self = this,
            data = this.saveData?this.saveData:this.getEditFormData($tpl);

        this.saveData = null
        let postData = Object.assign({}, data);
        postData.subject = 'option';

        postData.jsonStr = JSON.stringify({
            dOptionStemSetting: data.dOptionStemSetting,
            dOptionStyleSetting: data.dOptionStyleSetting
        });

        postData.dataString = JSON.stringify(postData);

        self.showPreview(postData, $tpl)
    }

    changeQuesType(s) {
        //修改题型

        let self = this;
        if (s.oldType != s.type) {
            let data = {
                unicode: s.$tpl.find('input[name=id]').val(),
                jsonStr: JSON.stringify({
                    "type": 1,
                    "isSingle": s.type == '4' ? 0 : 1
                })
            }
            self.changeType(data, (r) => {
                $('.ques-setting .tc a', s.$tpl).data('type', s.type);
                self.setQuesType(s.type, s.$tpl)

                self.changeAllQuesType({
                    $tpl: s.$tpl,
                    data: data.jsonStr,
                    type: s.type,
                    save: s.save
                })
            })

        } else {
            if (s.save) {
                self.step++;
                if (self.step == 2)
                    self.getShowPreviewData(s.$tpl)
            }
            loading.close()
            new SuccessTip('保存成功')

        }
    }

    changeAllQuesType(s) {
        let self = this;
        if ($('.ques-setting .cui-checkboxContainer:eq(0) input[type=checkbox]:checked', s.$tpl).length == 1) { //应用到同类型题目
            let $ques = s.type == '5' ? $('.preview-question.single') : $('.preview-question.multiple'), //多选修改为单选/单选修改为多选
                total = $ques.length,
                count = 0

            if (total == 0) {
                if (s.save) {
                    self.step++;
                    if (self.step == 2)
                        self.getShowPreviewData(s.$tpl)
                }
                loading.close()
                $('.ques-setting .cui-checkboxContainer:eq(0) input[type=checkbox]', s.$tpl)[0].checked = false;
                new SuccessTip('保存成功')
                return;
            }

            for (let v of $ques) {
                let data = {
                    unicode: $(v).data('id'),
                    jsonStr: s.data
                }

                self.changeType(data, (r) => {
                    $('.ques-setting .tc a', $(v)).data('value', s.type);
                    self.setQuesType(s.type, $(v))
                    count++;
                    if (count == total) {
                        if (s.save) {
                            self.step++;
                            if (self.step == 2)
                                self.getShowPreviewData(s.$tpl)
                        }
                        loading.close()
                        $('.ques-setting .cui-checkboxContainer:eq(0) input[type=checkbox]', s.$tpl)[0].checked = false;
                        new SuccessTip('保存成功')
                    }
                })
            }
        } else {
            if (s.save) {
                self.step++;
                if (self.step == 2)
                    self.getShowPreviewData(s.$tpl)
            }
            loading.close()
            new SuccessTip('保存成功')
        }
    }


    setQuesType(type, $tpl) {
        //修改类型
        $('input[name=type]', $tpl).val(type)
            //修改类型名称
        $('.ques-type', $tpl).text(type == '4' ? '【单选题】' : '【多选题】')
            //修改类名
        let unicode = $tpl.data('id') ? $tpl.data('id') : $('input[name=id]').val()
        let optsButtonHtml = {
            checkbox: `<div class="cui-checkboxContainer inline"><input type="checkbox" ><label><i></i></label></div>`,
            radio: `<div class="cui-radioContainer inline"><input type="radio" name="options${unicode}" value=""><label><i></i></label></div>`
        }

        if (type == '4') {
            $tpl.removeClass('multiple').addClass('single')
            $('.options', $tpl).addClass('cui-radioGroupContainer')
            $('.preview-options', $tpl).addClass('cui-radioGroupContainer')
            $('.options-item .cui-checkboxContainer', $tpl).before(optsButtonHtml.radio).remove();
        } else {
            $tpl.removeClass('single').addClass('multiple')
            $('.options', $tpl).removeClass('cui-radioGroupContainer')
            $('.preview-options', $tpl).removeClass('cui-radioGroupContainer')
            $('.options-item .cui-radioContainer', $tpl).before(optsButtonHtml.checkbox).remove();
        }
    }


    getEditFormData($tpl) {
        let data = {
            dOptionStemSetting: {
                options: []
            },
            dOptionStyleSetting: {
                optionSetting: 1
            },
            unicode: "",
            type: $('input[name=type]', $tpl).val(),
            subject: 'option'
        }

        data.unicode = $('input[name=id]', $tpl).val();

        this.editUes.map((item) => {
            if (item.key.indexOf('Subject') > -1) {
                data.dOptionStemSetting.question = item.ue.getContent();
            } else {
                data.dOptionStemSetting.options.push({
                    maskCode: item.key.indexOf('optionContent') > -1 ? '' : item.key,
                    label: item.ue.getContent()
                })
            }
        })

        data.dOptionStyleSetting.optionSetting = (this.selectBoxs[0].getValue() || {value:0}).value;

        data.type = $('input[name=type]', $tpl).val();
        data.sortNum = $('.operating p:first', $tpl).data('sortnum');
        data.paperId = $('body #paperUnicode').val();
        return data;
    }

}

export default multi_selection;
