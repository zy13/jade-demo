/**
* @Author: Jet.Chan
* @Date:   2016-12-22T17:53:04+08:00
* @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-11T21:57:57+08:00
*/

import cui from 'c-ui';
import './commonStyle/style.less'
import './subjectivity_fill.less'
import './subjectivity_fill_edit.less'
import loading from '../loading';
import baseClass from './base/questionClass';
import ComfirmTip from '../tips/deleteTip';
import SuccessTip from '../tips/successTip';
import WarnTip from '../tips/warnTip'
import juicer from 'juicer';
//主观填空题
import tpl_subjective_fill from './tpl/subjectivity_fill.html';
const juicerTpl = juicer(tpl_subjective_fill);
import tplEdit_subjective_fill_edit from './tpl/subjectivity_fill_edit.html';
const juicerTplEdit = juicer(tplEdit_subjective_fill_edit);


const defaultValue = {
    "dBlankStemSetting": {
        "question": "请填写题目",
        "numbers": 3,
        "type": 0
    },
    "dBlankStyleSetting": {
        "height": 40,
        "width": 150,
        "limit": ''
    },
    "type": 6
}

// console.log(JSON.stringify(defaultValue))
class subjective_fill extends baseClass {
    constructor($container) {
        super();
        this.$container = $container;
    };

    addSubject(data) {
        setTimeout(() => {
            loading.open();
            let dataConf = Object.assign({}, defaultValue, data || {}),
                postData = {};
            postData.jsonStr = JSON.stringify(defaultValue);
            postData.subject = 'blank';
            postData.paperId = data.paperId;

            this.add(postData, (r) => {
                let arr = [], objRp = JSON.parse(r.response);
                dataConf.dBlankStemSetting = objRp.dBlankStemSetting;
                dataConf.dBlankStyleSetting = objRp.dBlankStyleSetting;
//-----------
                dataConf.dBlankStemSetting.type = 0
//-----------

                for(let i=1;i<=dataConf.dBlankStemSetting.numbers;i++)
                    arr.push(i)
                dataConf.options = arr;

                dataConf.unicode = objRp.unicode;
                dataConf.sortNum = this.$container.createIndex;
                dataConf.dataString = JSON.stringify(dataConf);
                dataConf.setWidth = parseInt(objRp.dBlankStyleSetting.width)/820*100+'%'
                dataConf.setHeight = objRp.dBlankStyleSetting.height


                let $addTpl = $(juicerTpl.render(dataConf));
                this.appendToSpecifyElem(this.$container, $addTpl);

                $('.edit', $addTpl).on('click', (e) => {
                    if (!this.getEditControlLength()) {
                        let $this = $(e.currentTarget),
                            dataConf = $this.data('value');
                        if(typeof dataConf != 'object')
                            dataConf = JSON.parse(dataConf)
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
        let arr = [],num = 3,width=150,height=40;
        if(preViewDataConf&&preViewDataConf.dBlankStemSetting&&preViewDataConf.dBlankStemSetting.numbers){
            num = preViewDataConf.dBlankStemSetting.numbers;
        }
        for(let i=1;i<=num;i++)
            arr.push(i)
        preViewDataConf.options = arr;

        if(preViewDataConf.dBlankStyleSetting){
            if(preViewDataConf.dBlankStyleSetting.width)
                width = preViewDataConf.dBlankStyleSetting.width
            if(preViewDataConf.dBlankStyleSetting.height)
                height = preViewDataConf.dBlankStyleSetting.height
        }else{
            preViewDataConf.dBlankStyleSetting = {
                "height": 40,
                "width": 150,
                "limit": ''
            }
            preViewDataConf.dataString = JSON.stringify(preViewDataConf)
        }

        preViewDataConf.setWidth = parseInt(parseInt(width)/820*100)+'%'
        preViewDataConf.setHeight = height

        let $preViewTpl = $(juicerTpl.render(preViewDataConf));
        this.displaceTpl($editTpl, $preViewTpl, () => {
            if(this.editUes){
                this.editUes.map((item) => {
                    item.ue.destroy();
                })
                this.editUes.length = 0;
            }

            $('.edit', $preViewTpl).on('click', (e) => {
                if (!this.getEditControlLength()) {
                    let $this = $(e.currentTarget),
                        dataConf = $this.data('value');
                    if(typeof dataConf != 'object')
                        dataConf = JSON.parse(dataConf)
                    this.showEdit($this.parents('.preview-question'), dataConf);
                }
            })
            this.copyAndDelete($preViewTpl,this)

        });



    }

    showEdit(displaceTpl, dataConf) {
        let arr = [] , self = this
        for(let i=1;i<=dataConf.dBlankStemSetting.numbers;i++)
            arr.push(i)
        dataConf.options = arr;
        dataConf.setWidth = parseInt(parseInt(dataConf.dBlankStyleSetting.width)/820*100)+'%'
        dataConf.setHeight = dataConf.dBlankStyleSetting.height

        dataConf.dataString = JSON.stringify(dataConf);
        let $editTpl = $(juicerTplEdit.render(dataConf));

        //设置模版选中值
        this.displaceTpl(displaceTpl, $editTpl, () => {
            //初试化富文本
            this.editUes = this.initUEditor($('script', $editTpl));
            Array.from($('.ques-setting .cui-checkboxContainer', $editTpl), (v) => new cui.Checkbox($(v)))
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
            postData.subject = 'blank';

            postData.jsonStr = JSON.stringify({
                dBlankStemSetting: data.dBlankStemSetting,
                dBlankStyleSetting: data.dBlankStyleSetting
            });

            loading.open()
            self.save(postData, (r) => {
                data.dataString = JSON.stringify(data);
                self.step++;
                if(self.step==2)
                    self.showPreview(data, $editTpl)
            })

            self.settingSave($editTpl,true)

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
                type = $('input[name=type]', $editTpl).val(),
                _index = ++($('.options-item', $editTpl).length),
                width = $('.options',$editTpl).data('width'),
                height = $('.options',$editTpl).data('height'),
                setHeight = height>70?70:height;

            let optionHtml = `<div class="options-item" style="padding-left:${setHeight}px">
                    <p class="option-index" style="width:${setHeight}px">${_index}</p>
                    <div class="option-wrap" style="width:${width}">
                        <div class="option-content" style="height:${height}px"></div>
                        <i class="cpf-icon cpf-icon-thin-close del-option"></i>
                    </div>
                </div>`,
                $optionHtml = $(optionHtml);
            $editTpl.find('.options').append($optionHtml);
        })


        //绑定编辑状态 选项删除按钮
        $editTpl.on('click', '.cpf-icon-thin-close.del-option', (e) => {
            let $this = $(e.currentTarget),
                $optItem = $this.parents('.options-item');
            for(let v of $optItem.nextAll('.options-item').find('.option-index')){
                let val = parseInt($(v).text())
                if(!isNaN(val))
                    $(v).text(--val)
            }
            $optItem.remove();
        })

        //高度、宽度、字数的交互和输入限制
        $editTpl.on('focus','.ques-setting .layout input[type=txt]',(e)=>{
            $(e.target).removeClass('fail')
        })
        .on('keydown','.ques-setting .layout input[type=txt]',(e)=>{    //只能输入数字
            if (e.keyCode == 8 || e.keyCode == 37 || e.keyCode == 39 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                return true;
            }
            return false;
        })
        .on('keyup','.ques-setting .layout input[type=txt]',(e)=>{    //限制中文字符
            let val = e.target.value,
                reg = new RegExp(/^\d+$/);
            if(val!=''){
                if(!reg.test(val)){
                    e.target.value = '';
                    new WarnTip($(e.target).parent(),'请输入正整数',{width:'80px'})
                }
            }
        })
        .on('blur','.ques-setting .layout .height input[type=txt]',(e)=>{
            let height = $(e.target).val()           //最小高度为70
            if(height!=''){
                height = parseInt(height)
                if(height<40){                       //判断大小
                    $(e.target).val('40')
                    new WarnTip($(e.target).parent(),'最小高度为40',{width:'80px'})
                }else{
                    $(e.target).val(height)
                }
            }
        })
        .on('blur','.ques-setting .layout .width input[type=txt]',(e)=>{
            let width = $(e.target).val()           //最小宽度为150，最大宽度为820
            if(width!=''){
                width = parseInt(width)
                if(width<150){
                    $(e.target).val('150')
                    new WarnTip($(e.target).parent(),'最小宽度为150',{width:'85px'})
                }
                else if(width>820){
                    $(e.target).val('820')
                    new WarnTip($(e.target).parent(),'最大宽度为820',{width:'85px'})
                }else{
                    $(e.target).val(width)
                }
            }
        })
        .on('blur keyup input','.ques-setting .layout .limit input[type=txt]',(e)=>{
            let limit = $(e.target).val()
            if(limit!=''){
                limit = parseInt(limit)
                if(limit==0){
                    $(e.target).val('')
                    new WarnTip($(e.target).parent(),'字数上限不能为0',{limit:'120px'})
                }else if(limit>5000){
                    $(e.target).val('')
                    new WarnTip($(e.target).parent(),'字数上限不能超过5000字',{limit:'120px'})
                }else{
                    $(e.target).val(limit)
                }
            }
        })
    }

    settingSave($tpl,save=false){

        let self = this,
            oldType = $('.ques-setting .tc a', $tpl).data('type'),
            type = $('input[name=type]', $tpl).val(),
            width = $('.ques-setting .layout .width input[type=txt]', $tpl).val(),
            height = $('.ques-setting .layout .height input[type=txt]', $tpl).val(),
            limit = $('.ques-setting .layout .limit input[type=txt]', $tpl).val();


        //修改本题的宽高字数
        let data = {
            unicode: $tpl.find('input[name=id]').val(),
            jsonStr: JSON.stringify({
                "type":4,
                "dBlankStyleSetting": {height,width,limit}
            }),
            paperId: $('body #paperUnicode').val()
        }

        loading.open()
        self.changeType(data, (r) => {
            width = parseInt((width/820)*100);
            $('.ques-content .options',$tpl).data('width',width+'%').data('height',height)
            $('.ques-content .options .options-item',$tpl).css({
                'padding-left':height>70?70:height+'px'
            }).find('.option-index').css({
                'width':height>70?70:height+'px'
            })
            $('.option-wrap', $tpl).width(width+'%')
                .find('.option-content').height(height+'px')

            self.changeAllQuesStyle({
                $tpl,
                data:data.jsonStr,
                oldType,
                type,
                save
            })
        })
    }


    //修改同类型题目宽高字数
    changeAllQuesStyle(s){

        let self = this;
        if($('.ques-setting .cui-checkboxContainer:eq(1) input[type=checkbox]:checked', s.$tpl).length==1){        //应用到同类型题目

            let $ques = s.oldType == '1' ? $('.preview-question.obj-completion'):$('.preview-question.sub-completion'),
                total = $ques.length,
                count = 0
            if(total==0){
                $('.ques-setting .cui-checkboxContainer:eq(1) input[type=checkbox]', s.$tpl)[0].checked = false;
                self.changeQuesType({
                    $tpl:s.$tpl,
                    oldType:s.oldType,
                    type:s.type,
                    save:s.save
                });
                return;
            }
            for(let v of $ques){
                let _data = {
                    unicode: $(v).data('id'),
                    jsonStr: s.data
                }
                self.changeType(_data, (r) => {

                    let style = JSON.parse(s.data).dBlankStyleSetting,
                        config = $(v).find('.edit').data('value')
                    if(typeof config != "object")
                        config = JSON.parse(config)
                    let width = parseInt((parseInt(style.width)/820)*100);

                    $('.content .preview-options .preview-option',$(v)).css({
                        'padding-left':style.height>70?70:style.height+'px'
                    }).find('.option-index').css({
                        'width':style.height>70?70:style.height+'px'
                    })
                    $('.option-wrap', $(v)).width(width+'%')
                        .find('.option-content').height(style.height+'px')

                    config.dBlankStyleSetting = style
                    $(v).find('.edit').data('value',JSON.stringify(config))

                    count ++;
                    if(count == total){
                        $('.ques-setting .cui-checkboxContainer:eq(1) input[type=checkbox]', s.$tpl)[0].checked = false;
                        self.changeQuesType({
                            $tpl:s.$tpl,
                            oldType:s.oldType,
                            type:s.type,
                            save:s.save
                        });
                    }
                })
            }
        }else{
            self.changeQuesType({
                $tpl:s.$tpl,
                oldType:s.oldType,
                type:s.type,
                save:s.save
            });
        }
    }

    getShowPreviewData($tpl){

        let self = this,
            data = this.getEditFormData($tpl);

        let postData = Object.assign({}, data);
        postData.subject = 'blank';

        postData.jsonStr = JSON.stringify({
            dBlankStemSetting: data.dBlankStemSetting,
            dBlankStyleSetting: data.dBlankStyleSetting
        });

        postData.dataString = JSON.stringify(postData);
        self.showPreview(postData, $tpl)
    }

    changeQuesType(s){
        //修改题型

        let self = this;
        if(s.oldType!= s.type){
            let data = {
                unicode: s.$tpl.find('input[name=id]').val(),
                jsonStr: JSON.stringify({
                     "type":3,
                     "isObjective ":s.type
                })
            }
            self.changeType(data,(r) => {
                $('.ques-setting .tc a', s.$tpl).data('type',s.type);
                self.setQuesType(s.type,s.$tpl)
                self.changeAllQuesType({
                    data:data.jsonStr,
                    type:s.type,
                    save:s.save
                })
            })

        }else{
            if(s.save){
                self.step++;
                if(self.step==2)
                    self.getShowPreviewData(s.$tpl)
            }
            loading.close()
            new SuccessTip('保存成功')

        }
    }

    changeAllQuesType(s){

        let self = this;
        if($('.ques-setting .cui-checkboxContainer:eq(0) input[type=checkbox]:checked', s.$tpl).length==1){        //应用到同类型题目
            let $ques = s.type == '1' ? $('.preview-question.sub-completion'):$('.preview-question.obj-completion'),       //主观题修改为客观题/客观题修改为主观题
                total = $ques.length,
                count = 0
            if(total==0){
                if(s.save){
                    self.step++;
                    if(self.step==2)
                        self.getShowPreviewData(s.$tpl)
                }
                loading.close()
                $('.ques-setting .cui-checkboxContainer:eq(0) input[type=checkbox]', s.$tpl)[0].checked = false;
                new SuccessTip('保存成功')
                return;
            }
            for(let v of $ques){
                let data = {
                    unicode: $(v).data('id'),
                    jsonStr: s.data
                }
                self.changeType(data,(r) => {
                    $('.ques-setting .tc a', $(v)).data('value',s.type);
                    self.setQuesType(s.type,$(v))
                    count++;
                    if(count == total){
                        if(s.save){
                            self.step++;
                            if(self.step==2)
                                self.getShowPreviewData(s.$tpl)
                        }
                        loading.close()
                        $('.ques-setting .cui-checkboxContainer:eq(0) input[type=checkbox]', s.$tpl)[0].checked = false;
                        new SuccessTip('保存成功')
                    }
                })
            }
        }else{
            if(s.save){
                self.step++;
                if(self.step==2)
                    self.getShowPreviewData(s.$tpl)
            }
            loading.close()
            new SuccessTip('保存成功')
        }
    }


    setQuesType(type,$tpl){
        //修改类型
        $('input[name=type]', $tpl).val(type)
        //修改类型名称
        $('.ques-type', $tpl).text(type!='1'?'【主观填空题】':'【客观填空题】')
        //修改类名
        if(type=='1'){
            $tpl.removeClass('sub-completion').addClass('obj-completion')
        }else{
            $tpl.removeClass('obj-completion').addClass('sub-completion')
        }
    }


    getEditFormData($tpl) {
        let data = {
            dBlankStemSetting: {
                question: "",
                numbers: 3,
                type: 1
            },
            dBlankStyleSetting: {
                height: 40,
                width: 150,
                limit: ''
            },
            unicode:'',
            type: 6,
            subject: 'blank'
        }
        data.unicode = $('input[name=id]', $tpl).val();

        this.editUes.map((item) => {
            if (item.key.indexOf('Subject') > -1) {
                data.dBlankStemSetting.question = item.ue.getContent();
            }
        })

        data.dBlankStemSetting.numbers = $('.options-item', $tpl).length;
        data.dBlankStyleSetting.width = $('.ques-setting .layout .width input', $tpl).val();
        data.dBlankStyleSetting.height = $('.ques-setting .layout .height input', $tpl).val();
        data.dBlankStyleSetting.limit = $('.ques-setting .layout .limit input', $tpl).val();

        data.dBlankStemSetting.type = $('input[name=type]', $tpl).val();
        data.sortNum = $('.operating p:first', $tpl).data('sortnum');
        data.paperId = $('body #paperUnicode').val();
        return data;
    }

    //切换选项
    changeOptionsTypes($tpl, type) {
        let optsButtonHtml = {
            checkbox: `<div class="cui-checkboxContainer inline"><input type="checkbox" ><label><i></i></label></div>`,
            radio: `<div class="cui-radioContainer inline"><input type="radio" name="options1" value=""><label><i></i></label></div>`
        }
        if (type == 5) {
            $('.options-item .cui-radioContainer', $tpl).before(optsButtonHtml.checkbox).remove();
            $('.options-item .cui-checkboxContainer:first input', $tpl).attr('checked', 'checked');
        } else if (type == 4) {
            $('.options-item .cui-checkboxContainer', $tpl).before(optsButtonHtml.radio).remove();
            $('.options-item .cui-radioContainer:first input', $tpl).attr('checked', 'checked');
        }
        $('body input[name=type]').val(type)
    }


}

export default subjective_fill;
