/**
 * @Author: Jet.Chan
 * @Date:   2016-12-27T10:57:28+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-17T13:58:44+08:00
 */



import cui from 'c-ui';
import loading from '../loading';
import baseClass from './base/questionClass';

import juicer from '../share/juicer';
//多选题
import tpl_paging from './tpl/paging.html';
const juicerTpl = juicer(tpl_paging);

const defaultValue = {
    dPageStyleSetting: {
        subjectOrder: 0,
        optionOrder: 0
    },
    type: 2
}

class paging extends baseClass {
    constructor($container) {
        super();
        this.$container = $container;
        this.editOptionsLength = 1;
    };
    addSubject(data, ischeck = true, $tempTpl) {
        //检测是否存在编辑状态的题目
        if (this.getCurrentEditControl().length <= 0 && ischeck) {
            cui.popTips.warn('请确保当前有一个题目在编辑状态', 2000);
        } else {
            if (!$tempTpl) {
                let $currEditCtrl = this.getCurrentEditControl();
                if ($currEditCtrl.prev().is('.sp-paging')) {
                    return cui.popTips.warn('当前题目不能再插入分页符', 2000);
                }
            }

            let dataConf = Object.assign({}, {
                                dPageStyleSetting: {
                                    subjectOrder: 0,
                                    optionOrder: 0
                                },
                                type: 2
                            }, data || {}),
                postData = {},
                self = this;

            postData.jsonStr = JSON.stringify({
                                    dPageStyleSetting: {
                                        subjectOrder: 0,
                                        optionOrder: 0
                                    },
                                    type: 2
                                });
            postData.subject = 'page';
            postData.paperId = data.paperId;

            this.add(postData, (r) => {
                let objRp = JSON.parse(r.response);
                dataConf.dOptionStemSetting = objRp.dPageStyleSetting;
                dataConf.unicode = objRp.unicode;
                dataConf.sortNum = ++$('.sp-paging').length;
                dataConf.type = objRp.type;
                dataConf.dataString = JSON.stringify(data);
                // console.log(dataConf);
                let $addTpl = $(juicerTpl.render(dataConf));
                this.appendToSpecifyElem($tempTpl || this.getCurrentEditControl(), $addTpl, () => {
                    self.updateSortNum('.sp-paging .paging-num .num')
                    if ($tempTpl) {
                        //删除首个分页符添加时附加的div
                        $('.sp-question .tempdiv').remove()
                    }
                }, true);
                this.SelectBoxs = this.initCtrlInteraction($addTpl);
                this.initCtrlEvents($addTpl);
            });
        }
    };
    showPreview(preViewDataConf, $editTpl) {

        let $preViewTpl = $(juicerTpl.render(preViewDataConf));

        this.displaceTpl($editTpl, $preViewTpl, () => {
            this.SelectBoxs = this.initCtrlInteraction($preViewTpl);
            //删除按钮
            this.initCtrlEvents($preViewTpl);
        });
    };
    initCtrlInteraction($tpl) {
        return Array.from($('.cui-selectBoxContainer', $tpl), (v) => new cui.SelectBox($(v)));
    }
    initCtrlEvents($tpl) {
        let self = this;
        $('.del-paging', $tpl).on('click', (e) => {
            let $this = $(e.currentTarget),
                $item = $this.parents('.preview-question');
            let unicode = $this.data('id');

            setTimeout(() => {
                loading.open();
                this.delete({
                    unicode
                }, (r) => {
                    $item.remove();
                    self.updateSortNum('.sp-paging .paging-num .num')
                    setTimeout(() => {
                        loading.close();
                    }, 500);
                });
            }, 500);
        })

        //注册选择时候修改分页符数据
        this.SelectBoxs.map((item) => {
            item.$el.find('.cui-options ul li').on('click', (e) => {
                let pd = this.getEditFormData($tpl);
                pd.jsonStr = JSON.stringify(pd)
                pd.subject = 'page';
                loading.open()
                this.save(pd, (r) => {
                    loading.close();
                })
            });
        })
        return;
    }
    getEditFormData($tpl) {
        let postData = Object.assign({}, defaultValue);
        postData.dPageStyleSetting.subjectOrder = (this.SelectBoxs[0].$el.find('.result').text() == '固定顺序' ? {
            value: 0
        } : {
            value: 1
        }).value;
        postData.dPageStyleSetting.optionOrder = (this.SelectBoxs[1].$el.find('.result').text() == '固定顺序' ? {
            value: 0
        } : {
            value: 1
        }).value;
        postData.paperId = $('body #paperUnicode').val();
        postData.unicode = $('input[name=unicode]', $tpl).val();
        return postData;
    }
}

export default paging;
