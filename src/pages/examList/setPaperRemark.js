/*
 * @Author: sihui.cao
 * @Date:   2016-12-16 10:49:07
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-06T16:27:56+08:00
 */

'use strict';
import cui from 'c-ui'
import moment from 'moment'
import dalExamList from '../../dao/examManagement/examList'
import SuccessTip from '../../components/tips/successTip'
import WarnTip from '../../components/tips/warnTip'
import Loading from '../../components/loading/index'
import "../../components/ueditor"
import session from '../../dao/sessionContext'
import '../../components/commonTab/style.less'
import '../../components/share/hfCommon'
import './setPaperRemark.less'

class SettingRemark {
    constructor() {
        this.score = parseFloat($('#score').val()) || 0
        this.init()
        this.watch()
    }
    init() {
        this.editor = [];
        let date = moment().valueOf();
        $('.examRemark').each((i, v) => {
            this.initEditor($(v),date++)
        })

    }
    initEditor($v,date) {
        let self = this;
        $v.attr('id', 'examRemark' + date)
        let examRemark = self.createEditor('examRemark' + date)

        examRemark.ready(function() {
            let value = $('#examRemark' + date).prev().val() || '恭喜您已完成试卷答题！您本次客观题答题得分为：$$考试得分$$';
            examRemark.setContent(value)
        });
        self.editor.push(examRemark)

    }
    createEditor(elem) {
        let self = this;
        let toolbars = [
            ['bold', 'italic', 'underline',
                'strikethrough', 'forecolor', 'backcolor', 'fontfamily',
                'fontsize', 'justifyleft', 'justifycenter', 'justifyright',
                'lineheight', 'removeformat', 'replaceword'
            ]
        ]
        let ue = UE.getEditor(elem, {
            initialFrameWidth: '100%',
            initialFrameHeight: 120,
            autoHeightEnabled: false,
            toolbars: toolbars,
            elementPathEnabled: false,
            enableAutoSave: false,
            wordCount: false
        });

        //自定义
        ue.commands['replaceword'] = {
            execCommand: function(e) {
                let $target = $('#' + elem + ' .edui-for-replaceword')
                let $list = $(`<div class="replaceword">
                                <div class="repacewordItem">$$考试得分$$</div>
                            </div>`)
                $list.appendTo($target)
                $target.css('overflow', 'visible').parent().css('overflow', 'visible')
                $list.find('div').map((i, v) => {
                    $(v).on('click', (e) => {
                        let value = $(e.target).text()
                        $list.remove()
                        ue.execCommand('insertHtml', value)
                    })
                });

                let listen = (e) => {
                    if (!$(e.target).hasClass('replaceword') && !$(e.target).hasClass('repacewordItem') && $(e.target).parents('.edui-for-replaceword').length == 0) {
                        $list.remove()
                        $('body').off('click', listen)
                    }
                }
                $('body').on('click', listen)

                ue.addListener("focus", function(type, event) {
                    if ($target.find('.replaceword').length > 0) {
                        $target.find('.replaceword').remove();
                        ue.removeListener("focus");
                    }
                });
                $(document).one('scroll', () => {
                    $list.remove()
                })
            },
            queryCommandState: function() {}
        }
        return ue;
    }
    getValue() {
        let self = this;
        let result = []
        let arr = Array.from($('.item'), (v) => v);
        for (let [i, v] of arr.entries()) {
            result.push({
                id: $(v).data('id') || 0,
                startScore: parseFloat($(v).find('.start').val()),
                endScore: parseFloat($(v).find('.end').val()),
                description: self.editor[i].getContent(),
                unicode: $(v).data('code') || ''
            })
        }
        return JSON.stringify(result)
    }
    //分数不互相交叉
    checkScore($parent, start, end) { //判断值是否在区间里面
        let data = []
        $('.startScore').map((i, v) => {
            if ($(v).parents('.score-range')[0] != $parent[0]) {
                if ($(v).find('input').val() != '' && $(v).nextAll('.endScore').find('input').val() != '')
                    data.push({
                        start: parseFloat($(v).find('input').val()),
                        end: parseFloat($(v).nextAll('.endScore').find('input').val())
                    })
            }
        })
        if (!isNaN(start) && !isNaN(end)) {
            data.map((v) => {
                if (!(start > v.end || end < v.start))
                    return false;
            });
            return true;
        } else if (!isNaN(start) || !isNaN(end)) {
            let val = !isNaN(start) ? start : end;
            data.map((v) => {
                if (val >= v.start && val <= v.end)
                    return false;
            });
            return true;
        }
        return true;
    }
    //定位
    move($el) {
        if (!$el)
            return;
        let top = $el.offset().top - $(window).height() / 4
        $('html,body').scrollTop(top)
    }
    //验证非空
    verify() {
        let self = this;
        let validate = true;
        let arr = Array.from($('.item'), (v) => v);
        for (let [i, v] of arr.entries()) {
            $(v).find('input[type=text]').map((i, input) => {
                if ($(input).val() == '') {
                    if (validate)
                        self.move($(v))
                    validate = false;
                    $(input).addClass('fail')
                    new WarnTip($(input).parent(), '不能为空', {
                        width: '50px',
                        'z-index': 10000
                    })
                }
            });
            if (self.editor[i].getContentTxt() == '' || self.editor[i].getContentTxt().length > 10000) {
                if (validate)
                    self.move($(v))
                validate = false;
                new WarnTip($(v).find('.examRemark'),
                    self.editor[i].getContentTxt() == '' ? '请设置结束语' : '结束语不能超过10000字', {
                        top: '164px',
                        left: '46px'
                    })
            }
        }
        return validate;
    }
    checkRange() { //所有区间完全包含0-总分
        let total = 0,
            i = 0;
        $('.startScore').map((t, v) => {
            let s = parseFloat($(v).find('input').val())
            let e = parseFloat($(v).nextAll('.endScore').find('input').val())
            if (!isNaN(s) && !isNaN(e)) {
                total += (e * 10 - s * 10)
            }
            i++;
        });
        // console.log(((total + (i - 1) * 1) / 10), i);
        return ((total + (i - 1) * 1) / 10) == this.score
    }
    watch() {
        let self = this;
        $('.item-wrap').on('focus', '.startScore input,.endScore input', (e) => {
            $(e.target).removeClass('fail')
        }).on('keydown', '.startScore input,.endScore input', (e) => { //限制输入的keyCode
            if (e.keyCode == 8 || e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 190 || e.keyCode == 110 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                return true;
            }
            return false;
        }).on('keyup', '.startScore input,.endScore input', (e) => { //限制格式
            let val = e.target.value;
            if (val != '') {
                let reg = new RegExp(/^\d+($|\.\d?$)/)
                // let reg = new RegExp(/^\d{1,3}$|^\d{1,3}\.\d?$/)
                // let reg = new RegExp(/^([0-9][0-9]{0,2}[\.][0-9]{1})$|^([0-9][0-9]{0,2}[\.])$|^([0-9][0-9]{0,2})$/)
                if (!reg.test(val)) {
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '输入至多一位小数的正数', {
                        width: '137px',
                        'z-index': 10000
                    });
                }
            }
        }).on('blur', '.startScore input,.endScore input', (e) => {
            if ($(e.target).val() != '') {

                let start = $(e.target).hasClass('start') ? parseFloat($(e.target).val()) : parseFloat($(e.target).parent().prevAll('.startScore').find('input').val());
                let end = $(e.target).hasClass('start') ? parseFloat($(e.target).parent().nextAll('.endScore').find('input').val()) : parseFloat($(e.target).val());

                let reg = new RegExp(/^\d+($|\.\d?$)/)
                // let reg = new RegExp(/^\d{1,3}$|^\d{1,3}\.\d?$/)
                // let reg = new RegExp(/^([0-9][0-9]{0,2}[\.][0-9]{1})$|^([0-9][0-9]{0,2}[\.])$|^([0-9][0-9]{0,2})$/)
                if (reg.test($(e.target).hasClass('start') ? start : end)) { //第一步检验格式
                    if (!isNaN(end) && !isNaN(start) && start > end) { //第二步判断大小
                        $(e.target).val('').addClass('fail')
                        new WarnTip($(e.target).parent(), $(e.target).hasClass('start') ? '开始不能大于结束' : '结束不能小于开始', {
                            width: '100px',
                            'z-index': 10000
                        })
                    } else if (parseFloat($(e.target).val()) > self.score) {
                        $(e.target).val('').addClass('fail')
                        new WarnTip($(e.target).parent(), '不能大于总分', {
                            width: '80px',
                            'z-index': 10000
                        })
                    } else {
                        if (!self.checkScore($(e.target).parents('.score-range'), start, end)) { //判断分数是否交叉
                            $(e.target).val('').addClass('fail')
                            new WarnTip($(e.target).parent(), '分数不能交叉', {
                                width: '80px',
                                'z-index': 10000
                            })
                        } else {
                            //第四步清除无效0和.
                            $(e.target).val($(e.target).hasClass('start') ? start : end)
                        }
                    }
                } else { //不合法
                    $(e.target).val('').addClass('fail')
                    new WarnTip($(e.target).parent(), '输入至多一位小数的正数', {
                        width: '137px',
                        'z-index': 10000
                    })
                }

            }
        }).on('click', '.del', (e) => {
            let $parents = $(e.target).parents('.item')
            let code = $parents.data('code');
            if ($('.item-wrap .item').length == 1) {
                cui.popTips.error('不能删除最后一个结束语');
                return;
            }
            if (code) {
                Loading.open()
                session.customer().then((r) => {
                    return dalExamList.deleteRemark(code, r.accessToken)
                }).then((res) => {
                    if (res && res.code == 0) {
                        $parents.remove();
                        new SuccessTip('删除成功')
                    } else {
                        cui.popTips.error('操作失败')
                    }
                    Loading.close()
                }, (err) => {
                    cui.popTips.error('操作失败')
                    Loading.close()
                    console.log(err)
                })
            } else {
                $parents.remove();
                new SuccessTip('删除成功')
            }
        })

        $('.addRemark').on('click', (e) => {
            let end = this.score,
                start = $('.item:last .endScore input').val()
            if (!start) {
                start = end = '';
            } else {
                start = (parseInt(parseFloat(start) * 10)) / 10
                if (start >= end) {
                    start = end = '';
                } else {
                    start += 0.1
                }
            }
            let $html = $(`<div data-id="" data-code="" class="item">
                                <div class="score-range">
                                    <span>当得分在：</span>
                                    <div data-rule="digits" data-tips="请输入正整数" class="cui-textBoxContainer inline startScore">
                                        <input class="start" type="text" value="${start}">
                                    </div>
                                    <span>到</span>
                                    <div data-rule="digits" data-tips="请输入正整数" class="cui-textBoxContainer inline endScore">
                                        <input class="end" type="text" value="${end}">
                                    </div>
                                    <span>时显示：</span>
                                </div>
                                <div class="del">
                                    <i class="cpf-icon cpf-icon-ic_close"></i>
                                </div>
                                <div class="remark">
                                    <input type="hidden" value='' class="examRem">
                                    <script type="text/plain" class="examRemark"></script>
                                </div>
                            </div>`)
            $html.appendTo($('.item-wrap'))
            self.initEditor($html.find('.examRemark'),moment().valueOf())
        })


        $('.setting-action').on('click', '.save', () => {
            //是否全部非空
            if (!this.verify()) {
                cui.popTips.error('还有分数或结束语未填写')
                return;
            }
            //是否包含0-总分的区间
            if (!this.checkRange()) {
                cui.popTips.error(`分数区间需要包含0-${this.score}分`)
                return;
            }
            let data = this.getValue()
            Loading.open()
            session.customer()
                .then((res) => {
                    return dalExamList.setQuestionFlush({
                        paperUnicode: $('#paperUnicode').val(),
                        accessToken: res.accessToken,
                        jsonStr: data,
                        stepNo: 4, //处于第4步
                    })
                }).then((res) => {
                    if (res && res.code == 0) {
                        new SuccessTip('操作成功');
                        window.location.href = '/customer/examList/setCompletion/' + $('#paperUnicode').val() + '?mode=' + $('#mode').val() + '&paperId=' + $('#paperId').val()
                    } else {
                        cui.popTips.error(res.message)
                    }
                    Loading.close()
                }, (err) => {
                    Loading.close()
                    cui.popTips.error(err.message || '操作失败');
                })
        })
    }
}
new SettingRemark()

//分数只能输入数字和英文.
//分数是不超过总分的正数
//分数不互相交叉
//分数区间完全包含0-总分
//提交时验证分数非空和结束语非空
//提交时验证完全包含
//删除旧结束语和新结束语
//不能删除最后一个结束语
