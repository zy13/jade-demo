/*
 * @Author: sihui.cao
 * @Date:   2016-12-22 14:32:56
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-02T19:29:35+08:00
 */

'use strict';

import cui from 'c-ui'
import WarnTip from '../../components/tips/warnTip'
import SuccessTip from '../../components/tips/successTip'
import loading from '../../components/loading/index'
import session from '../../dao/sessionContext'
import dalExamList from '../../dao/examManagement/examList'
import '../../components/commonTab/style.less'
import '../../components/share/hfCommon'
import './setScore.less'
import _ from 'lodash';


class SetScore {
    constructor() {
        this.textBoxes = Array.from($('.cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
        this.checkboxes = Array.from($('.cui-checkboxContainer'), (v) => new cui.Checkbox($(v)))
        this.radioGroups = Array.from($('.cui-radioGroupContainer'), (v) => new cui.RadioGroup($(v)))
        this.selectBoxes = Array.from($('.cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)))
        this.initScore()
        this.watch()
    }
    initScore() {
        let score = 0
        $('.cui-textBoxContainer.score').map((i, v) => {
            if ($(v).find('input').val() != '') {
                let s = (parseInt(parseFloat($(v).find('input').val()) * 10))
                if (!isNaN(s))
                    score += s
            }
        });
        $('#totalScore').text(score / 10)
    }
    move($el = null) {
        if (!$el) {
            let $preview = $('.preview-question.failure:eq(0)'),
                $preview_i = $('.preview-question input.fail:first').parents('.preview-question'),
                index = $preview.index('.preview-question'),
                index_i = $preview_i.index('.preview-question')
            if (index == -1) {
                $el = $preview_i
            } else if (index_i == -1) {
                $el = $preview
            } else {
                $el = index < index_i ? $preview : $preview_i
            }
        }
        let top = $el.offset().top - $(window).height() / 4
        $('html,body').scrollTop(top)
    }
    //检查分数和答案
    checkScore() {
        let vaild = true,
            self = this;
        let arr = ['.preview-question.single', '.preview-question.multiple',
            '.preview-question.obj-completion', '.preview-question.sub-completion', '.preview-upload-question'
        ]
        $(arr).map((i, el) => {
            //合并检查分数和少选统一给分
            let $els = Array.from($(el + ' .setting-score .score input'), (v) => $(v))
                .concat(Array.from($(el + ' .setting-score .item:not(.dis) .long input'), (v) => $(v)))

            $els.map((v,index) => {

                if ($(v).val() == '') {
                    vaild = false;
                    $(v).addClass('fail');
                    new WarnTip($(v).parent(), '分数不能为空', {
                        width: '75px'
                    });
                }else{
                    let score = parseFloat($(v).val()),
                        reg = new RegExp(/^\d{1,3}($|\.\d?$)/)
                    if (!reg.test(score)) {
                        vaild = false;
                        $(v).addClass('fail').val('');
                        new WarnTip($(v).parent(), '请输入至多一位小数的正数', {
                            width: '150px'
                        });
                    }else if(score<=0){
                        vaild = false;
                        $(v).addClass('fail').val('');
                        new WarnTip($(v).parent(), '分数不能小于或者等于0', {
                            width: '80px'
                        });
                    }else if(score>1000){
                        vaild = false;
                        $(v).addClass('fail').val('');
                        new WarnTip($(v).parent(), '分数不能大于1000', {
                            width: '110px'
                        });
                    }
                }
            });

            if (i < 2) {
                $(el + ' .preview-options').map((index, v) => {
                    if ($(v).find('input:checked').length == 0) {
                        vaild = false;
                        $(v).parents('.preview-question').addClass('failure')
                    }
                });
            }
            if (i == 2) {
                $(el + ' .preview-options').map((index, v) => {
                    $(v).find('textarea').map((j, k) => {
                        if ($.trim($(k).val()) == '') {
                            vaild = false;
                            $(v).parents('.preview-question').addClass('failure')
                        }
                    });
                });
                $(el + ' .setting .cui-radioGroupContainer').map((index, v) => {
                    if ($(v).find('input:checked').length == 0) {
                        vaild = false;
                        $(v).parents('.preview-question').addClass('failure')
                    }
                });
            }
        });
        return vaild;
    }
    //获取数据
    getValue() {
        let self = this,
            arr = [],
            model = {
                score: $('#totalScore').text(),
                dOptions: [], //选择题集合
                dAttachments: [], //附加题
                dBlanks: [], //填空题
            };
        //单选
        $('.preview-question.single').map((i, v) => {
            model.dOptions.push({
                "dOptionScoreSetting": {
                    "answer": $(v).find('.preview-option input:checked').val(),
                    "score": $(v).find('.setting-score .cui-textBoxContainer.score input').val(),
                    "scoreRule": 0,
                    "subScore": -999
                },
                "unicode": $(v).data('code'),
                "type": 4
            })
        });

        let getDefaultSelectValue = (index) => {
            let defaultModel = {
                value: 0
            };
            if (self.selectBoxes[index]) {
                let chooseDefaultKey = self.selectBoxes[index].$el.find('.result').html();
                switch (chooseDefaultKey) {
                    case '少选按比例分给分':
                        defaultModel.value = 2;
                        break;
                    case '少选统一给分':
                        defaultModel.value = 1;
                        break;
                    default: //全部答对才给分 value= 0
                }
            }
            return defaultModel;
        }

        //多选
        $('.preview-question.multiple').map((i, v) => {
            let _i = $(v).index('.preview-question.multiple');
            let answers = Array.from($(v).find('.preview-option input:checked'), (k) => $(k).val());
            model.dOptions.push({
                "dOptionScoreSetting": {
                    "answers": answers,
                    "score": $(v).find('.setting-score .cui-textBoxContainer.score input.total').val(),
                    "scoreRule": (self.selectBoxes[_i].getValue() || getDefaultSelectValue(_i)).value,
                    "subScore": $(v).find('.setting-score .cui-textBoxContainer.long input.sub').val() || -999
                },
                "unicode": $(v).data('code'),
                "type": 5
            })
        });

        //客观填空题
        $('.preview-question.obj-completion').map((i, v) => {
            let total = 0;
            let dBlankScoreDetails = Array.from($(v).find('.preview-option'), (k) => {
                let _i = parseInt($(k).find('.option-index').text())
                let score = $(v).find('.setting-score .cui-textBoxContainer.score').eq(--_i).find('input').val()
                total += parseInt(score)
                return {
                    "seqNo": $(k).find('textarea').data('code'),
                    "answer": $(k).find('textarea').val(),
                    "score": score
                }
            })
            model.dBlanks.push({
                "dBlankScoreSetting": {
                    "dBlankScoreDetails": dBlankScoreDetails,
                    "score": total,
                    "scoreRule": $(v).find('.setting .cui-radioContainer input:checked').val(),
                    "explanation": ''
                    // "explanation": $(v).find('.analysis-content textarea').val()
                },
                "unicode": $(v).data('code'),
                "type": 6
            })
        })

        //主观填空题
        $('.preview-question.sub-completion').map((i, v) => {
            let total = 0;
            let dBlankScoreDetails = Array.from($(v).find('.setting-score .cui-textBoxContainer.score'), (k) => {
                // let _i = parseInt($(k).find('.option-index').text())
                let score = $(k).find('input').val()
                total += parseInt(score)
                return {
                    "seqNo": $(k).find('input').data('code'),
                    // "answer": $(k).find('textarea').val(),
                    "answer": '',
                    "score": score
                }
            })
            model.dBlanks.push({
                "dBlankScoreSetting": {
                    "dBlankScoreDetails": dBlankScoreDetails,
                    "score": total,
                    "scoreRule": 2,
                    "explanation": $(v).find('.analysis-content textarea').val()
                },
                "unicode": $(v).data('code'),
                "type": 6
            })
        })

        //上传题
        $('.preview-question.preview-upload-question').map((i,v) => {
            model.dAttachments.push({
                "dAttachmentScoreSetting": {
                    "score": $(v).find('.cui-textBoxContainer.score input').val(),
                    "scoreRule": $(v).find('.analysis-content textarea').val()
                },
                "unicode": $(v).data('code'),
                "type": 7
            })
        });

        return JSON.stringify(model)
    }
    save(type) {
        let self = this;
        if (!self.checkScore()) {
            self.move()
            cui.popTips.error('还有题目未设置答案或分数')
            return;
        }
        let paperUnicode = $('#paperUnicode').val()
        let value = self.getValue();

        loading.open()
        session.customer()
            .then((res) => {
                if (type == 1)
                    return dalExamList.savePaperScore(paperUnicode, res.accessToken, value)
                return dalExamList.setQuestionFlush({
                    paperUnicode,
                    stepNo: 3,
                    accessToken: res.accessToken,
                    jsonStr: value
                })
            })
            .then((res) => {
                loading.close()
                if (res && res.code == 0) {
                    new SuccessTip('操作成功', function() {
                        if (type == 1)
                            window.location.href = `/customer/examList/setPaperRemark/${paperUnicode}?mode=` + $('#mode').val() + '&paperId=' + $('#paperId').val()
                        else
                            window.location.href = `/customer/examList/setCompletion/${paperUnicode}?mode=` + $('#mode').val() + '&paperId=' + $('#paperId').val()
                    }, null, 800)
                } else {
                    cui.popTips.error(res.message ? res.message : '操作失败');
                }
            }, (err) => {
                loading.close()
                cui.popTips.error(err.message ? err.message : '操作失败');
            })
    }
    watch() {
        let self = this,
            updateScore = () => {
                let total = 0;

                $('.cui-textBoxContainer.score input').map((i,v) => {
                    let val = $(v).val()
                    if (val != '') {
                        let s = (parseInt(parseFloat(val) * 10))
                        total += s
                    }
                })
                $('#totalScore').text(total / 10)
            }
        //输入限制和判断
        $('.sp-question')
            .on('focus', '.cui-textBoxContainer.score_type input', (e) => {
                $(e.target).removeClass('fail succ')
            })
            .on('keydown', '.cui-textBoxContainer.score_type input', (e) => {
                if (e.keyCode == 8 || e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 190 || e.keyCode == 110 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                    return true;
                }
                return false;
            })
            .on('keyup', '.cui-textBoxContainer.score_type input', (e) => {
                let val = e.target.value;
                if (val != '') {
                    let reg = new RegExp(/^\d{1,3}($|\.\d?$)/)
                    // let reg = new RegExp(/^\d{1,3}$|^\d{1,3}\.\d?$/)
                    // let reg = new RegExp(/^(\d{1,3}\.\d{1})$|^(\d{1,3}[\.])$|^(\d{1,3})$/)
                    if (!reg.test(val)) {
                        e.target.value = '';
                        new WarnTip($(e.target).parent(), '请输入至多一位小数的正数', {
                            width: '150px',
                            top: '41px'
                        });
                    }
                }
            })
            .on('blur', '.cui-textBoxContainer.score_type input', (e) => {
                let val = e.target.value;
                if (val == '') {
                    updateScore()
                }

                let reg = new RegExp(/^\d{1,3}($|\.\d?$)/)
                // let reg = new RegExp(/^\d{1,3}$|^\d{1,3}\.\d?$/)
                // let reg = new RegExp(/^(\d{1,3}[\.]\d{1})$|^(\d{1,3}[\.])$|^(\d{1,3})$/)

                if (!reg.test(val)) {
                    $(e.target).addClass('fail').val('')
                    new WarnTip($(e.target).parent(), '请输入至多一位小数的正数', {
                        width: '150px',
                        top: '41px'
                    });
                } else {
                    let score = parseFloat(val)
                    if (score<=0||score>1000){
                        $(e.target).addClass('fail').val('')
                        new WarnTip($(e.target).parent(), score<=0?'分数不能小于或者等于0':'分数不能大于1000', {
                            width: score<=0?'80px':'100px',
                            top: '41px'
                        });
                    }
                    else if ($(e.target).hasClass('sub')) { //多选题子题分数
                        let total = $(e.target).parents('.setting-score').find('.item:first input').val();
                        if (total == '' || parseFloat(total) < parseFloat(val)) {
                            $(e.target).addClass('fail').val('')
                            new WarnTip($(e.target).parent(), '不能大于本题总分', {
                                width: '100px',
                                top: '41px'
                            });
                        } else {
                            $(e.target).addClass('succ').val(parseFloat(val))
                        }
                    } else {
                        updateScore()
                        $(e.target).addClass('succ').val(parseFloat(val))
                    }
                }
            })

        //清除警告
        $('.preview-question.single .preview-option').on('click', '.cui-radioContainer i', (e) => {
            $(e.target).parents('.preview-question.single').removeClass('failure')
        }).on('click', '.option-content', (e) => {
            $(e.target).parents('.preview-question.single').removeClass('failure')
        })

        $('.preview-question.multiple .preview-option').on('click', '.cui-checkboxContainer i', (e) => {
            $(e.target).parents('.preview-question.multiple').removeClass('failure')
        }).on('click', '.option-content', (e) => {
            $(e.target).parents('.preview-question.multiple').removeClass('failure')
        })

        $('.preview-question.obj-completion').on('focus', '.preview-option textarea', (e) => {
            $(e.target).parents('.preview-question.obj-completion').removeClass('failure')
        }).on('click', '.setting .cui-radioContainer label>i,.setting .cui-radioContainer label>span', (e) => {
            $(e.target).parents('.preview-question.obj-completion').removeClass('failure')
        })

        $('.setting-score .cui-textBoxContainer.score input').on('focus', (e) => {
            $(e.target).parents('.preview-question').removeClass('failure')
        })


        //多选题
        for (let v of self.selectBoxes) {
            v.$el.on('click', '.cui-options li', (e) => {
                let $el = $(e.target);
                if ($el.data('value') == '1') {
                    v.$el.parent().next().removeClass('dis').find('input').val('');
                } else {
                    v.$el.parent().next().addClass('dis');
                }
            })
        }

        //检查分数、下一步、完成
        $('#checkScore').on('click', () => {
            if (self.checkScore()) {
                return new SuccessTip('检查通过')
            } else {
                this.move()
                return cui.popTips.error('还有题目未设置答案或分数')
            }
        })

        $('.setting-action').on('click', '.next', (e) => {
            self.save(1)
        }).on('click', '.save', (e) => {
            self.save(2)
        })


        //选中内容触发选中选项
        $('.option-content').on('click', (e) => {
            let $el = $(e.target).hasClass('option-content') ? $(e.target) : ($(e.target).parents('.option-content')),
                $option = $el.prev('.cui-checkboxContainer').length > 0 ? $el.prev('.cui-checkboxContainer') : $el.prev('.cui-radioContainer')
            $option.find('input').click()
        })
    }
}
new SetScore()
