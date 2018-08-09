/*
 * @Author: zyuan
 * @Date:   2016-12-28 10:36:31
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-04-25 17:03:03
 */

'use strict';

import '../../components/share/hfCommon'
import './examinee.less'

import cui from 'c-ui'
import juicer from 'juicer'
import examinerDao from '../../dao/examManagement/examiner'
import SuccessTip from '../../components/tips/successTip'
import session from '../../dao/sessionContext'
import tips from '../../components/tips/deleteTip'
import loading from '../../components/loading'
import exerciseDao from '../../dao/examManagement/exercise'
import {
    FormOptions
} from '../../components/share/tools';
import WarnTip from '../../components/tips/warnTip'
import CheckImgs from '../../components/ckeckImgs/index'


const fo = new FormOptions();

class ExamineeDemo {
    constructor() {
        this.init()
    }
    init() {
        this.selBox = Array.from($('.title-state .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
        this.txtBox = Array.from($('.scores-container .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.gerScoreTxtBox = Array.from($('.scror-group .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.getContext();
        this.handleEvents();
    }
    getContext() {
        let self = this;
        session.customer().then((res) => {
            self.context = res;
        })
    }
    handleEvents() {
        let count = 0;
        let rememberStr = '';

        $('.wrap-detail').on('click', '.title-state .cui-button', () => { //检查评卷详情
            $('.mark-detail').toggleClass('dis');
            this.autoFooter();
        }).on('click', '.upload .img-group a.a', (e) => { //上传题-处理图片文件
            let $this = $(e.currentTarget);

            if ($this.is('.isImg')) {
                new CheckImgs({
                    $elem: $this,
                    paperId: $('input[name=paperId]').val(),
                    taskId: $('input[name=taskId]').val(),
                    seqNo: $this.closest('.panel').siblings('.detail').data('seqno'),
                    examerId: $this.data('userid') || ''
                });
            }

            if ($this.is('.word') || $this.is('.xls')) {
                session.customer().then((r) => {
                    exerciseDao.downloadExamerImg({
                        taskId: $('input[name=taskId]').val(),
                        paperId: $('input[name=paperId]').val(),
                        examerId: $this.data('userid') || '',
                        seqNo: $this.closest('.panel').siblings('.detail').data('seqno'),
                    }, r.accessToken, $this.data('name'))
                });
            }

        }).on('click', '.eva .cui-options li', () => { //切换评卷方式
            loading.open();
            this.getCommonData({
                showType: this.selBox[1].getValue() ? this.selBox[1].getValue().value : $('input[name=showType]').val()
            });
        }).on('click', '.way .cui-options li', () => { //切换显示方式
            loading.open();
            let data = {
                showType: this.selBox[1].getValue() ? this.selBox[1].getValue().value : $('input[name=showType]').val()
            }
            this.getCommonData(data);
        }).on('click', '.div-loadm a', () => { //加载更多
            loading.open();
            this.getCommonData({
                pagesize: parseInt($('#loadm').data('value'), 10) + 100
            });
        }).on('click', '.pre-next .cui-button', (e) => { //保存分数
            loading.open();
            let $this = $(e.currentTarget);

            if (!this.context) {
                return cui.popTips.error('网络错误！')
            } else {
                let jsonStr = [];

                Array.from($('.question-group .question'), (v, i) => {
                    if ($(v).data('canscore') == 'yes') {
                        let score = [],
                            fullScore = [];

                        Array.from($(v).find('.scores-container .cui-textBoxContainer'), (k) => {
                            score.push($(k).find('input[name=score]').val() ? $(k).find('input[name=score]').val() : '')
                            fullScore.push($(k).find('input[name=score]').data('full'))
                        })

                        jsonStr.push({
                            number: $(v).find('.detail').data('seqno'),
                            userId: $('.examerId').attr('id'),
                            seq: $('input[name=seqNo]').val() ? $('input[name=seqNo]').val() : null,
                            score: score,
                            fullScore: fullScore
                        })
                    }
                });

                let digit = this.selBox[0].getValue() ? this.selBox[0].getValue().value : $('input[name=evaluate]').val();
                let opts = {
                    accessToken: this.context.accessToken,
                    jsonStr: JSON.stringify(jsonStr),
                    paperId: $('input[name=paperId]').val(),
                    taskId: $('input[name=taskId]').val(),
                    evaluate: digit ? digit : 1
                }

                examinerDao.checkPaperScore(opts).then((res) => { //检查是否可以保存分数
                    loading.close();
                    if (res && res.code == 0) {
                        examinerDao.savePaperScore(opts).then((res1) => { //保存分数
                            if (res1 && res1.code == 0) {
                                this.saveScore($this);
                            } else if (res && res.code == 28008006) { //是否继续保存分数
                                new tips(() => {
                                    this.saveScore($this);
                                }, {
                                    content: res1.message,
                                    tip: '保存成功！'
                                });
                                $('.cui-panel-content .btn .cancel, .cui-panel-header i').css({
                                    display: 'none'
                                })
                            } else {
                                return cui.popTips.error(res1.message)
                            }
                        }).catch((err) => {
                            return cui.popTips.error('服务繁忙！');
                        })
                    } else if (res && res.code == 28008006) { //是否继续保存分数
                        new tips(() => {
                            examinerDao.savePaperScore(opts).then((res2) => {
                                if (res2 && res2.code == 0) {
                                    this.saveScore($this);
                                } else if (res2 && res2.code == 28008006) { //是否继续保存分数
                                    new tips(() => {
                                        this.saveScore($this);
                                    }, {
                                        content: res2.message,
                                        tip: '保存成功！'
                                    });
                                    $('.cui-panel-content .btn .cancel, .cui-panel-header i').css({
                                        display: 'none'
                                    })
                                } else {
                                    return cui.popTips.error(res2.message)
                                }
                            }).catch((err) => {
                                return cui.popTips.error('服务繁忙！');
                            })
                        }, {
                            content: res.message,
                            tip: '保存成功！'
                        });
                    } else if (res && res.code == 28008007) {
                        new tips(() => {
                            window.location.reload();
                        }, {
                            content: res.message,
                            tip: '操作成功！'
                        });
                        $('.cui-panel-content .btn .cancel, .cui-panel-header i').css({
                            display: 'none'
                        });
                    } else {
                        return cui.popTips.warn(res.message);
                    }
                }).catch((err) => {
                    return cui.popTips.error('服务繁忙！');
                })
            }
        })

        $('.scores-container .cui-textBoxContainer').map((i, v) => { //限制分数输入
            $(v).find('input').blur((e) => {
                let $this = $(e.currentTarget);
                let reg = /^\d+(\.\d{1})?$/g;
                let reg0 = /^0\d{1,}(\.\d?)?$/gi;

                if (reg0.test($this.val())) {
                    this.txtBox[i].setValidate(false, `分数格式错误`);
                    this.txtBox[i].setValue($this.data('value') || '');
                    return false;
                }

                if (!$this.val() && $this.data('value') != null && parseFloat($this.data('value')) >= 0) {
                    this.txtBox[i].setValidate(false, '已评分数不能为空');
                    this.txtBox[i].setValue($this.data('value'));
                    return false;
                }

                if (!this.txtBox[i].getValidate()) {
                    this.txtBox[i].setValue($this.data('value') || '');
                    return false;
                } else {
                    if (!reg.test($this.val())) {
                        if ($this.val()) {
                            this.txtBox[i].setValidate(false, '请保留一位小数点');
                            this.txtBox[i].setValue($this.data('value') || '');
                        } else {
                            if ($this.val() == '') {
                                this.txtBox[i].setValidate(false, '分数不能为空');
                                this.txtBox[i].setValue('');
                            }
                        }
                        return false;
                    }
                }

                if ($this.val()) {
                    if (parseFloat($this.val()) > parseFloat($this.data('full'))) {
                        this.txtBox[i].setValidate(false, `请输入0~${$this.data('full')}的分数`);
                        this.txtBox[i].setValue($this.data('value') || '');
                        return false;
                    }
                }
            })
        })
    }
    saveScore($this) {
        let showType = this.selBox[1].getValue() ? this.selBox[1].getValue().value : $('input[name=showType]').val();

        if ($this.is('.pre')) { //上一个
            this.getCommonData({
                buttonType: 'up',
                showType: showType
            });
        }
        if ($this.is('.next')) { //下一个
            this.getCommonData({
                buttonType: 'next',
                showType: showType
            });
        }
        if ($this.is('.save-btn')) { //保存
            let fn = () => {
                this.getCommonData({
                    buttonType: '',
                    showType: showType
                })
            }
            new SuccessTip('保存成功！', fn)
        }
    }
    getCommonData(data) {
        let searchModel = new Object();
        let digit = this.selBox[0].getValue() ? this.selBox[0].getValue().value : $('input[name=evaluate]').val();
        // searchModel.taskName = $('input[name=taskName]').val();
        searchModel.taskId = $('input[name=taskId]').val();
        searchModel.paperId = $('input[name=paperId]').val();
        searchModel.seqNo = $('input[name=seqNo]').val();
        searchModel.evaluate = digit ? digit : 1;
        searchModel.userId = $('input[name=userId]').val();
        searchModel.number = '';

        if (data && data.showType) searchModel.showType = data.showType;
        if (data && data.buttonType) searchModel.buttonType = data.buttonType;
        if (data && data.pagesize) searchModel.pagesize = data.pagesize;

        window.location.href = `/customer/examiner/evaluate${digit}?${fo.toPostString(searchModel)}`;
    }
    autoFooter() {
        if (($('.special-wrap').height() + 100) > $(window).height()) {
            $('#ex-footer').removeClass('fixed');
        }
        if ($('.special-wrap').height() < $(window).height()) {
            $('#ex-footer').addClass('fixed');
        }
    }
}

$(() => {
    new ExamineeDemo();

    if (($('.special-wrap').height() + 100) > $(window).height()) {
        $('#ex-footer').removeClass('fixed');
    }

    //控制评分标准框的高度
    $('.question-group .question').each((i,v)=>{
        let maxH = $(v).height()-124,
            targetH = $(v).find('.div-right').height();

        if(targetH >maxH){
            $(v).find('.div-right .body').css({
                'max-height': maxH,
                'overflow-y': 'auto'
            })
        }
    })

})
