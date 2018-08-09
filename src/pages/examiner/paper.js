/*
 * @Author: zyuan
 * @Date:   2016-12-28 10:36:45
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-04-28 15:32:16
 */

'use strict';

import '../../components/share/hfCommon'
import './paper.less'

import cui from 'c-ui'
import juicer from 'juicer'
import examinerDao from '../../dao/examManagement/examiner'
import SuccessTip from '../../components/tips/successTip'
import session from '../../dao/sessionContext'
import tips from '../../components/tips/deleteTip'
import loading from '../../components/loading'
import exerciseDao from '../../dao/examManagement/exercise'
import {
    FormOptions,
    pageHelper
} from '../../components/share/tools';
import WarnTip from '../../components/tips/warnTip'
import CheckImgs from '../../components/ckeckImgs/index'
import editTpl from './tpl/paper.html';
const fo = new FormOptions();

class PaperDemo {
    constructor() {
        this.init()
    }
    init() {
        this.selBox = Array.from($('.title-state .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
        this.txtBox = Array.from($('.score-container .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.selPaging = Array.from($('.paging .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
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

        this.selPaging.forEach((v,i)=>{
            if(v.$el){
                v.$el.on('click','.cui-options li',(e)=>{
                    this.paging({
                        pageIndex:$(e.target).data('value')
                    })
                })
            }
        })

        this.judgeScore()

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
                    seqNo: $('#paperSeria').val(),
                    examerId: $this.data('userid') || ''
                });
            }

            if ($this.is('.word') || $this.is('.xls')) {
                session.customer().then((r) => {
                    exerciseDao.downloadExamerImg({
                        taskId: $('input[name=taskId]').val(),
                        paperId: $('input[name=paperId]').val(),
                        examerId: $this.data('userid') || '',
                        seqNo: $('#paperSeria').val(),
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
                buttonType:'',
                pageIndex:1,
                pagelimit:pageHelper.urlContext()['pagelimit'] || '50',
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
            this.save($this)
        })



    }
    judgeScore(){
        $('.question-group .score-container .cui-textBoxContainer').map((i, v) => { //限制分数输入
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
    paging(data){
        let self = this;
        let searchModel = this.getCommonData({
            returnType:1,
            buttonType:'',
            pageIndex:data.pageIndex || '1',
            pagelimit:pageHelper.urlContext()['pagelimit'] || '50'
        })
        loading.open()
        session.customer().then((res) => {
            searchModel.accessToken = res.accessToken
            examinerDao.getListFromPaper(searchModel).then((res)=>{
                loading.close();
                let data = res.response,tplJuicer = juicer(editTpl);

                data.width = data.dBlankStyleSetting==null ? 150: data.dBlankStyleSetting.width
                data.height = data.dBlankStyleSetting==null ? 50: data.dBlankStyleSetting.height
                data.spanWidth = data.width>70?70:(data.width<40?40:data.width)
                let tplHtml = tplJuicer.render(res.response).replace(/>\s+</g,'><')
                $('.question-group').html(tplHtml)
                this.txtBox = Array.from($('.score-container .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
                this.autoFooter()
                this.judgeScore()
                this.adjustPaging(searchModel.pageIndex)
            })
        })
    }
    adjustPaging(value){
        this.selPaging.forEach((v,i)=>{
            v.setValue({text:value,value})
        })
    }
    save($this,data={}){

        let self = this,
            jsonStr = [],
            opts = {};

        Array.from($('.question-group .question'), (v, i) => {
            if ($(v).data('canscore') == 'yes') {
                let score = [],
                    fullScore = [];

                Array.from($(v).find('.score-container .cui-textBoxContainer'), (k) => {
                    score.push($(k).find('input[name=score]').val())
                    fullScore.push($(k).find('input[name=score]').data('full'))
                })
                jsonStr.push({
                    number: $('.testNumber').data('id'), //题目序号
                    userId: $(v).find('.seria').data('user'), //考生id
                    seq: $(v).find('.seria').data('seqno'), //考生序号
                    score: score, //得分
                    fullScore: fullScore //满分
                });
            }
        });

        let digit = this.selBox[0].getValue() ? this.selBox[0].getValue().value : $('input[name=evaluate]').val();
        opts = {
            jsonStr: JSON.stringify(jsonStr),
            paperId: $('input[name=paperId]').val(),
            taskId: $('input[name=taskId]').val(),
            evaluate: digit ? digit : 1
        }
        session.customer().then((res)=>{
            opts.accessToken = res.accessToken
            return examinerDao.checkPaperScore(opts)
        }).then((res) => { //检查是否可以保存分数
            loading.close();
            if (res && res.code == 0) {
                examinerDao.savePaperScore(opts).then((res1) => { //保存分数
                    if (res1 && res1.code == 0) {
                        this.saveScore($this,data);
                    } else if (res1 && res1.code == 28008006) { //是否继续保存分数
                        new tips(() => {
                            this.saveScore($this,data);
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
                            this.saveScore($this,data);
                        } else if (res2 && res2.code == 28008006) { //是否继续保存分数
                            new tips(() => {
                                this.saveScore($this,data);
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
            } else {
                return cui.popTips.warn(res.message);
            }
        }).catch((err) => {
            return cui.popTips.error('服务繁忙！');
        })

    }
    saveScore($this,data) {

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
                    showType: showType,
                    pageIndex:1
                })
            }
            new SuccessTip('保存成功！',fn)
        }
        // if ($this.is('.paging')) {   //分页
        //     this.paging(data)
        // }
    }
    getCommonData(data) {
        let searchModel = new Object();
        let digit = this.selBox[0].getValue() ? this.selBox[0].getValue().value : $('input[name=evaluate]').val();
        // searchModel.taskName = $('input[name=taskName]').val();
        searchModel.taskId = $('input[name=taskId]').val();
        searchModel.paperId = $('input[name=paperId]').val();
        searchModel.number = $('.testNumber').data('id') || '';
        searchModel.userId = $('input[name=userId]').val();
        searchModel.evaluate = digit ? digit : 1;

        if (data && data.showType) {
            searchModel.showType = data.showType;
        } else { //没有显示类型时，默认未评试题类型显示
            searchModel.showType = pageHelper.urlContext()['showType'];
        }
        if (data && data.buttonType!=undefined) searchModel.buttonType = data.buttonType;
        if (data && data.pagesize) searchModel.pagesize = data.pagesize;
        if (data && data.pageIndex) searchModel.pageIndex = data.pageIndex;
        if (data && data.pagelimit) searchModel.pagelimit = data.pagelimit;

        if(data.returnType)
            return searchModel
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
    new PaperDemo()

    if (($('.special-wrap').height() + 100) > $(window).height()) {
        $('#ex-footer').removeClass('fixed');
    }
})
