/*
* @Author: sihui.cao
* @Date:   2017-01-12 14:09:20
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-03-22 10:38:21
*/

import cui from 'c-ui';
import './commonStyle/style.less'

import loading from '../loading';
import baseClass from './base/questionClass';
import SuccessTip from '../tips/successTip';
import juicer from 'juicer';

//上传题
import tpl_explain from './tpl/explain.html';
const juicerTpl = juicer(tpl_explain);

import tplEdit_explain_edit from './tpl/explain_edit.html';
const juicerTplEdit = juicer(tplEdit_explain_edit);

const defaultValue = {
    "comment":"该信息考生可见",
    "filePath":"filePath",
    "type":3
}


class explain_selection extends baseClass {
    constructor($container) {
        super();
        this.$container = $container;
    };

    addSubject(data,$tempTpl,copy=false) {
        if (!copy&&this.getCurrentEditControl().length <= 0) {
            cui.popTips.warn('请确保当前有一个题目在编辑状态', 2000);
        } else {
            let dataConf = Object.assign({}, defaultValue, data || {}),
                postData = {};
            postData.jsonStr = JSON.stringify(dataConf);
            postData.subject = 'instruction';
            postData.paperId = data.paperId;

            this.add(postData, (r) => {
                let objRp = JSON.parse(r.response);

                dataConf.unicode = objRp.unicode;
                dataConf.sortNum = this.$container.createIndex;
                dataConf.dataString = JSON.stringify(dataConf);

                let $addTpl = $(juicerTpl.render(dataConf));
                this.appendToSpecifyElem($tempTpl || this.getCurrentEditControl(), $addTpl, () => {}, true);
                //编辑状态切换
                $('.edit', $addTpl).on('click', (e) => {
                    if (!this.getEditControlLength()) {
                        let $this = $(e.currentTarget),
                            dataConf = $this.data('value');
                        this.showEdit($this.parents('.preview-question'), dataConf);
                    }
                })

                this.copyAndDelete($addTpl,this,true)

                this.$container.createIndex++;

                setTimeout(() => {
                    loading.close();
                }, 200);
            });
        }
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

            this.copyAndDelete($preViewTpl,this,true)

        });
    }

    showEdit(displaceTpl, dataConf) {
        let self = this,$editTpl;
        if(typeof dataConf =='string')
            dataConf = JSON.parse(dataConf)
        dataConf.dataString = JSON.stringify(dataConf);
        $editTpl = $(juicerTplEdit.render(dataConf));

        //设置模版选中值
        this.displaceTpl(displaceTpl, $editTpl, () => {
            //初试化富文本
            this.editUes = this.initUEditor($('script', $editTpl));
        });


        //编辑保存
        $('.cui-button.save', $editTpl).on('click', (e) => {
            if(!self.checkWordLimit($editTpl,self.editUes)){
                return cui.popTips.error('说明内容不能大于10000');
            }

            self.step = 0;
            let $this = $(e.currentTarget);
            let data = this.getEditFormData($editTpl);

            let postData = Object.assign({}, data);
            postData.subject = "instruction";
            postData.jsonStr = JSON.stringify(data);

            loading.open()

            this.save(postData, (r) => {
                loading.close()
                data.dataString = JSON.stringify(data);
                self.showPreview(data,$editTpl)
            })

        })

    }


    getEditFormData($tpl) {
        let data = {
            comment: '',
            filePath: 'filePath',
            unicode: $('input[name=id]', $tpl).val(),
            type: $('input[name=type]', $tpl).val(),
            subject: 'instruction'
        }

        this.editUes.map((item) => {
            if (item.key.indexOf('Subject') > -1) {
                data.comment = item.ue.getContent();
            }
        })

        data.paperId = $('#paperUnicode').val();

        return data;
    }

}

export default explain_selection;
