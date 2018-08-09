/**
* @Author: Jet.Chan
* @Date:   2016-12-22T17:54:04+08:00
* @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-12-22T17:54:04+08:00
*/
import cui from 'c-ui';
import './commonStyle/style.less'
import './upload_selection.less'
import './upload_selection_edit.less'

import loading from '../loading';
import baseClass from './base/questionClass';
import SuccessTip from '../tips/successTip';
import juicer from 'juicer';

//上传题
import tpl_upload_selection from './tpl/upload_selection.html';
const juicerTpl = juicer(tpl_upload_selection);

import tplEdit_upload_selection_edit from './tpl/upload_selection_edit.html';
const juicerTplEdit = juicer(tplEdit_upload_selection_edit);

const defaultValue = {
    "dAttachmentStemSetting": {
        "question": "请填写题目",
        "type": 1
    },
    "type": 7
}

// console.log(JSON.stringify(defaultValue))
class upload_selection extends baseClass {
    constructor($container) {
        super();
        this.$container = $container;
    };

    addSubject(data) {
        setTimeout(() => {
            loading.open();
            let dataConf = Object.assign({}, defaultValue, data || {}),
                postData = {};
            postData.jsonStr = JSON.stringify(dataConf);
            postData.subject = 'attachment';
            postData.paperId = data.paperId;
            // console.log(postData)

            this.add(postData, (r) => {
                let objRp = JSON.parse(r.response);
                dataConf.dAttachmentStemSetting = objRp.dAttachmentStemSetting;
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
                    this.showEdit($this.parents('.preview-question'), dataConf);
                }
            })
            this.copyAndDelete($preViewTpl,this)

        });
    }

    showEdit(displaceTpl, dataConf) {
        let self = this,$editTpl;
        if(typeof dataConf =='string')
            dataConf = JSON.parse(dataConf)

        dataConf.dAttachmentItems = dataConf.dAttachmentStemSetting.type.toString().split(',')

        dataConf.dataString = JSON.stringify(dataConf);
        $editTpl = $(juicerTplEdit.render(dataConf));

        //设置模版选中值
        this.displaceTpl(displaceTpl, $editTpl, () => {
            //初试化富文本
            this.editUes = this.initUEditor($('script', $editTpl));
            Array.from($('.ques-setting .cui-checkboxContainer', $editTpl), (v) => new cui.Checkbox($(v)))
        });


        //编辑保存
        $('.cui-button.save', $editTpl).on('click', (e) => {
            e.stopPropagation()
            if(!self.checkWordLimit($editTpl,self.editUes)){
                return cui.popTips.error('题干和选项内容均不能大于10000');
            }
            if(!self.checkSelect($editTpl)){
                return;
            }

            self.step = 0;
            let $this = $(e.currentTarget),
                data = this.getEditFormData($editTpl),
                postData = Object.assign({}, data);

            postData.jsonStr = JSON.stringify({
                dAttachmentStemSetting: data.dAttachmentStemSetting
            });

            loading.open()

            this.save(postData, (r) => {
                loading.close()
                // data.dataString = JSON.stringify(data);
                // self.getShowPreviewData($editTpl)
                self.settingSave($editTpl,true)
            })

        })

        //setting中的保存
        $('.ques-setting .tc a', $editTpl).on('click', (e) => {
            e.stopPropagation()
            self.settingSave($editTpl)
        })

        $('.ques-setting .del-setting',$editTpl).on('click',(e) => {
            $('.ques-setting',$editTpl).hide()
        })
    }

    checkSelect($tpl){
        //检查是否勾选上传文件类型
        let fileType = Array.from($('.ques-setting .fileType .cui-checkboxContainer input:checked',$tpl),(v)=>{
                return v.value
            })
        if(fileType.length == 0){
            $tpl.addClass('failure').off('click');
            setTimeout(()=>{
                let remove = ()=>{
                    $tpl.removeClass('failure')
                }
                $tpl.one('click',remove)
                let fn = ()=>{
                    $tpl.removeClass('failure')
                    self.editUes[0].ue.removeListener("focus", fn , true);
                }
                if(self.editUes&&self.editUes.length>0&&self.editUes[0].ue){
                    self.editUes[0].ue.addListener("focus", fn , true);
                }

            },10)

            cui.popTips.error('请设置上传文件类型');
            return false;
        }
        return true;
    }
    settingSave($tpl,save=false){

        let self = this,
            fileType = Array.from($('.ques-setting .fileType .cui-checkboxContainer input:checked',$tpl),(v)=>{
                return v.value
            })

        if(!self.checkSelect($tpl)){
            return;
        }


        //修改本题的题目设置
        let data = {
            unicode: $tpl.find('input[name=id]').val(),
            jsonStr: JSON.stringify({
                "type": 3,
                "pctType": fileType.join(','),
                "changeAllType":$('.ques-setting .setAll.cui-checkboxContainer input[type=checkbox]:checked', $tpl).length==1
            })
        }

        loading.open()
        self.changeType(data, (r) => {
            self.changeAllQuesStyle({
                $tpl,
                data:data.jsonStr,
                save
            })
        })
    }


    //修改同类型题目和布局
    changeAllQuesStyle(s){

        let self = this;
        if($('.ques-setting .setAll.cui-checkboxContainer input[type=checkbox]:checked', s.$tpl).length==1){        //应用到同类型题目

            let $ques = $('.preview-question.preview-upload-question'),
                total = $ques.length,
                count = 0
            if(total==0){
                $('.ques-setting .setAll.cui-checkboxContainer input[type=checkbox]', s.$tpl)[0].checked = false;
                if(s.save){
                    self.getShowPreviewData(s.$tpl)
                }
                loading.close()
                new SuccessTip('保存成功')
                return;
            }
            $ques.each((i,v)=>{
                let pctType = JSON.parse(s.data).pctType.split(','),
                    config = $(v).find('.edit').data('value')

                if(typeof config != "object")
                    config = JSON.parse(config)

                if(config.dAttachmentStemSetting)
                    config.dAttachmentStemSetting.type = pctType
                $(v).find('.edit').data('value',JSON.stringify(config))

                count ++;
                if(count == total){
                    $('.ques-setting .setAll.cui-checkboxContainer input[type=checkbox]', s.$tpl)[0].checked = false;
                    if(s.save){
                        self.getShowPreviewData(s.$tpl)
                    }
                    loading.close()
                    new SuccessTip('保存成功')
                }
            })
        }else{
            if(s.save){
                self.getShowPreviewData(s.$tpl)
            }
            loading.close()
            new SuccessTip('保存成功')
        }
    }

    getShowPreviewData($tpl){

        let self = this,
            data = this.getEditFormData($tpl);

        let postData = Object.assign({}, data);

        postData.jsonStr = JSON.stringify({
            dAttachmentStemSetting: data.dAttachmentStemSetting
        });

        postData.dataString = JSON.stringify(postData);
        self.showPreview(postData, $tpl)
    }


    getEditFormData($tpl) {
        let data = {
            dAttachmentStemSetting: {
                question: '',
                type: ''
            },
            unicode: $('input[name=id]', $tpl).val(),
            type: $('input[name=type]', $tpl).val(),
            subject: 'attachment'
        }

        this.editUes.map((item) => {
            if (item.key.indexOf('Subject') > -1) {
                data.dAttachmentStemSetting.question = item.ue.getContent();
            }
        })

        data.dAttachmentStemSetting.type = Array.from($('.ques-setting .fileType .cui-checkboxContainer input[type=checkbox]:checked',$tpl),(v)=>v.value).join()

        data.sortNum = $('.operating p:first', $tpl).data('sortnum');
        data.paperId = $('#paperUnicode').val();

        return data;
    }

}

export default upload_selection;
