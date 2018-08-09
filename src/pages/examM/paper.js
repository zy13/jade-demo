/*
 * @Author: zyuan
 * @Date:   2017-01-12 10:44:36
 * @Last Modified by:   zyuan
 * @Last Modified time: 2017-08-03 18:18:06
 */

'use strict';

import '../../components/share/layoutM'
import './paper.less'
import './finish.less'

import $ from 'jquery'
import cui from 'c-ui'
import session from '../../dao/sessionContext'
import paperDao from '../../dao/examManagement/exercise'
import ajaxFileUpload from '../../components/ajaxFileUpload/index'
import moment from 'moment'
import loading from '../../components/loading'
import WarmTip from '../../components/tips/deleteTip'
import cookie from 'cookie_js'

const appConfig = AppConfig || {}
const gloabalMoment = moment();
let toGetRequestTime = null;

class PaperDemo {
    constructor() {
        this.init()
    }
    init() {
        this.txtBoxes = Array.from($('.choice-body .item .cui-textBoxContainer.swer'), (v) => new cui.TextBox($(v)));
        this.handleEvents();
    }
    handleEvents() {
        this.countDown(); //倒计时

        $('.exam-content').on('click', '.item .sel', (e) => { //选择题
            e.preventDefault();
            let $this = $(e.currentTarget);

            if ($this.closest('.item').is('.muti-item')) {
                if ($this.is('.cur')) {
                    $this.removeClass('cur');
                } else {
                    $this.addClass('cur');
                }
            }
            if ($this.closest('.item').is('.sgl-item')) {
                $this.addClass('cur').siblings('.sel').removeClass('cur');
            }

        }).on('paste propertychange input keyup keydown', '.cui-textBoxContainer textarea', (e) => { //填空题-字数限制
            let blankLimit = parseInt($(e.currentTarget).siblings('.wordLengthLimit').val(), 10) || ''

            if (blankLimit != null && blankLimit > 0) {
                if ($(e.currentTarget).val().length < (blankLimit + 1)) {
                    let countLen = blankLimit - $(e.currentTarget).val().length;
                    $(e.currentTarget).siblings('div.blankLimit').find('p').text(countLen);
                }
                if ($(e.currentTarget).val().length > blankLimit) {
                    $(e.currentTarget).val($(e.currentTarget).val().substring(0, blankLimit));
                }
            } else if ($(e.target).val().length > 5000) {
                $(e.target).val($(e.target).val().substr(0, 5000))
                return cui.popTips.warn(`答案过长，请保持每个答案在5000个字以下`)
            }

        }).on('change', '.choice-body .upload-item .togetpath', (e) => { //上传题
            let $this = $(e.currentTarget),
                size = Math.ceil(parseInt(e.target.files[0].size) / 1024),
                maxSize = 1024 * 5, //单位K
                commonData = this.handleCommonData(),

                opts = {
                    taskId: commonData.taskId,
                    paperId: commonData.paperId,
                    fileName: '',
                    suffix: '',
                    seqNo: commonData.seqNo
                };

            if (size > maxSize) {
                cui.popTips.warn(`文件大小不能超过5M`);
                $this.val('');
                return false;
            }
            if ($this.val()) {
                let fileExt = (/[.]/.exec($this.val())) ? /[^.]+$/.exec($this.val().toLowerCase()) : '';
                opts.fileName = $this.val().replace(/^.+?\\([^\\]+?)(\.[^\.\\]*?)?$/gi, "$1");

                opts.suffix = fileExt[0].toLowerCase();

                if (opts.suffix == 'jpg' || opts.suffix == 'jpeg' || opts.suffix == 'png' || opts.suffix == 'gif' || opts.suffix == 'bmp') {
                    let fn = (filePath) => {
                            $('#uploadFile').append(`<a href='javascript:void(0)'>
                            <img src=${filePath} data-src='${filePath};${opts.fileName}.${opts.suffix};img;${size}k' data-name='${opts.fileName}' data-suffix='${opts.suffix}'/>
                            <span class='close'>
                                <i class='cpf-icon cpf-icon-thin-close'></i>
                            </span>
                        </a>`).on('click', '.close i', (ev) => {
                                let $self = $(ev.currentTarget);
                                session.user().then(r => {
                                    if (r && r.accessToken) {
                                        opts = Object.assign(opts, {
                                            accessToken: r.accessToken
                                        })
                                        paperDao.deleteFile(opts).then((r) => {
                                            if (r && r.code == 0) {
                                                $self.closest('a').remove();
                                            } else {
                                                return cui.popTips.warn(r.message);
                                            }
                                        }).catch(err => {
                                            return cui.popTips.warn('服务器繁忙!')
                                        })
                                    } else {
                                        return cui.popTips.warn('网络错误！')
                                    }
                                })

                            })
                        }

                    session.user().then(r => {
                        if (r && r.accessToken) {
                            paperDao.uploadFile('uploadFileId', {
                                taskId: parseInt(commonData.taskId, 10),
                                paperId: parseInt(commonData.paperId, 10),
                                seqNo: parseInt(commonData.seqNo, 10),
                                accessToken: r.accessToken,
                                fileName: `${opts.fileName}.${opts.suffix}`
                            }).then(res1 => {
                                if (res1 && res1.code == 0) {
                                    fn(res1.response.split(';')[0])
                                } else {
                                    return cui.popTips.warn(res1.message)
                                }
                            }).catch((err) => {
                                return cui.popTips.warn('服务器繁忙！')
                            });
                        } else {
                            return cui.popTips.warn('网络错误！')
                        }
                    }).catch(err => {
                        return cui.popTips.warn('网络错误！')
                    });
                } else {
                    return cui.popTips.warn(`只能上传图片`);
                }
            }

        }).on('click', '.div-footer .div-right a', (e) => { //跳题
            e.preventDefault();
            let $this = $(e.currentTarget)
            let opts = this.handleCommonData();

            $this.hide().closest('.div-footer').toggleClass('f-shrink bgcolor')
                .find('.div-jump-detail').toggleClass('dis');

            if (cookie.cookie.get('browserCurrentTime')) {
                cookie.cookie.set('browserCurrentTime', '')
            }
            $this.closest('.div-footer').find('.a-groups a').on('click', (ev) => {
                loading.open(true)
                let seqNo = $(ev.currentTarget).data('seqno');
                let opts = this.handleCommonData();

                session.user().then(r => {
                    if (r && r.accessToken) {
                        opts = Object.assign(opts, {
                            accessToken: r.accessToken
                        })
                        paperDao.getPaperDetail(opts).then((res) => {
                            if (res.code == 0)
                                window.location.href = `/exam/paper?taskId=${opts.taskId}&paperId=${opts.paperId}&seqNo=${seqNo}&browserRequestTime=${moment()}`
                            else {
                                loading.close();
                                return cui.popTips.warn(res.message);
                            }
                        }).catch(err => {
                            loading.close()
                            return cui.popTips.warn('服务器繁忙！')
                        });
                    } else {
                        loading.close()
                        return cui.popTips.warn('网络错误！')
                    }
                }).catch(err => {
                    loading.close()
                    return cui.popTips.warn('网络错误！')
                })
            })

        }).on('click', '.div-footer .div-jump-detail .extend', (e) => {
            let $this = $(e.currentTarget)
            $this.closest('.div-footer').toggleClass('f-shrink bgcolor')
                .find('.div-jump-detail').toggleClass('dis').siblings('.div-u-like').find('a').show()
        }).on('click', '.a-button .cui-button', (e) => { //保存
            loading.open(true)
            e.preventDefault();
            let $this = $(e.currentTarget);
            let opts = this.handleCommonData();

            session.user().then(r => {
                if (r && r.accessToken) {
                    opts = Object.assign(opts, {
                        accessToken: r.accessToken
                    })
                    paperDao.getPaperDetail(opts).then((res) => {
                        if (res.code == 0) {
                            if (cookie.cookie.get('browserCurrentTime')) {
                                cookie.cookie.set('browserCurrentTime', '')
                            }
                            if ($this.is('.next')) { //下一题
                                //设置cookie
                                window.location.href = `/exam/paper?taskId=${opts.taskId}&paperId=${opts.paperId}&seqNo=${opts.seqNo+1}&browserRequestTime=${moment()}`
                            }

                            if ($this.is('.prev')) { //上一题
                                window.location.href = `/exam/paper?taskId=${opts.taskId}&paperId=${opts.paperId}&seqNo=${opts.seqNo-1}&browserRequestTime=${moment()}`
                            }

                            if ($this.is('.submit')) { //提交
                                let qleft = $('#qLeft').data('left')
                                let data = {
                                    taskId: opts.taskId,
                                    paperId: opts.paperId,
                                    accessToken: opts.accessToken
                                }
                                let fn = () => {
                                    paperDao.submitPaper(data).then((r) => {
                                        if (r && r.code == 0) {
                                            $('.modal').remove();
                                            this.handleFinishPage(r.response);
                                        } else {
                                            $('.modal').remove();
                                            this.handleFinishPage();
                                        }
                                        loading.close()
                                    })
                                }
                                let answers = JSON.parse(opts.jsonStr)[0].answers;
                                for (let i = 0; i < answers.length; i++) {
                                    if (answers[i] && qleft > 0) {
                                        qleft--;
                                    }
                                }

                                if (qleft > 0) {
                                    loading.close()
                                    new WarmTip(fn, {
                                        content: `您还有${qleft}道题未答<br/>是否确定提交?`,
                                        tip: '提交成功'
                                    })
                                } else {
                                    fn();
                                }
                            }
                        } else {
                            loading.close()
                            return cui.popTips.warn(res.message)
                        }
                    }).catch(err => {
                        loading.close()
                        return cui.popTips.warn('服务器繁忙，请稍后再试！');
                    })
                } else {
                    loading.close()
                    return cui.popTips.warn('网络错误！')
                }
            }).catch(err => {
                loading.close()
                return cui.popTips.warn('网络错误！')
            })
        });

        $('#uploadFile').find('a').map((i, v) => { //删除上传题附件
            $(v).find('.close i').on('click', (ev) => {
                e.preventDefault();
                let $self = $(ev.currentTarget);
                let fileName = $self.closest('.close').siblings('img').data('name');
                let suffix = $self.closest('.close').siblings('img').data('suffix');

                paperDao.deleteFile({
                    accessToken: res.accessToken,
                    taskId: this.handleCommonData().taskId,
                    paperId: this.handleCommonData().paperId,
                    fileName: fileName,
                    suffix: suffix,
                    seqNo: this.handleCommonData().seqNo
                }).then((r) => {
                    if (r && r.code == 0) {
                        $self.closest('a').remove();
                    } else {
                        cui.popTips.warn(r.message);
                    }
                })
            })
        });

        //处理兼容性
        $('body').on('focus', 'input,textarea', () => {
            $('.f-shrink').hide();
        }).on('blur', 'input,textarea', () => {
            $('.f-shrink').show();
        })
    }
    countDown() {
        let javaSystemTime = moment($('.leftTime').data('javasystemtime')),
            paperEndTime = moment($('.leftTime').data('paperendtime')),
            networkDifference = moment().diff(toGetRequestTime) / 2,
            difference = javaSystemTime.diff(toGetRequestTime) - networkDifference;

        if (paperEndTime.diff(javaSystemTime) > 0) {
            let lefttime;

            lefttime = setInterval(() => {
                let browserSystemTime = moment();
                let timer = paperEndTime.diff(browserSystemTime + difference);

                if (timer > 0) {
                    let hour = parseInt(timer / 60 / 60 / 1000);
                    let min = parseInt((timer % 3600000) / 60000);
                    let sec = parseInt((timer % 3600000) % 60000 / 1000);

                    if (hour < 10)
                        hour = '0' + hour;
                    if (min < 10)
                        min = '0' + min;
                    if (sec < 10)
                        sec = '0' + sec;
                    if (hour > 0 || min > 0 || sec >= 0) {
                        $('.div-u-like .div-3 .leftTime').text(`${hour}:${min}:${sec}`)
                    }
                    if ((hour == 0 && min == 1 && sec == 0) || (hour == 0 && min == 0)) {
                        $('.div-u-like .div-3 .leftTime').css({
                            color: 'red'
                        })
                    }
                } else {
                    $('.div-u-like .div-3 .leftTime').text(`00:00:00`);

                    clearInterval(lefttime);
                    this.showTip();
                }
            }, 1000)
        } else {
            $('.div-u-like .div-3 .leftTime').text(`00:00:00`);
            this.showTip();
        }
    }
    showTip() {
        let response, $html = `<div class='modal'>
                        <div class='content'>
                            <div class='button preset-blue'>
                                <div class='tono'>答题时间已结束<br>系统将自动帮你交卷</div>
                                <a href='javascript:void(0)'>
                                    <span>确定</span>
                                </a>
                            </div>
                        </div>
                    </div>`;
        session.user().then(r => {
            if (r && r.accessToken) {
                let opts = {}
                opts = Object.assign({}, this.handleCommonData(), {
                    accessToken: r.accessToken
                })
                paperDao.getPaperDetail(opts).then(() => {
                    return cui.popTips.warn('服务器繁忙！')
                });
                paperDao.submitPaper({
                    taskId: opts.taskId,
                    paperId: opts.paperId,
                    accessToken: opts.accessToken
                }).then((r) => {
                    if (r && r.code == 0) {
                        $('body').append($html).on('click', '.button.preset-blue a', (e) => {
                            $('.modal').remove();
                            this.handleFinishPage(r.response);
                        });
                    } else {
                        $('body').append($html).on('click', '.button.preset-blue a', (e) => {
                            $('.modal').remove();
                            this.handleFinishPage();
                        });
                    }
                }).catch((err) => {
                    cui.popTips.warn('服务器繁忙!', 1500)
                    setTimeout(() => {
                        window.location.href = '/exam/taskList'
                    }, 2000)
                })
            } else {
                return cui.popTips.warn('网络错误！')
            }
        }).catch(err => {
            return cui.popTips.warn('网络错误！')
        })
    }
    handleCommonData() {
        let jsonStr = [{
                seqNo: '',
                type: '',
                answers: []
            }],
            opts = {};

        jsonStr[0].seqNo = $('#seqNo').val();
        jsonStr[0].type = $('.choice-body #type').data('type');
        jsonStr[0].id = $('#exspecial').data('value');

        //单选题-多选
        if (Array.from($('.choice-body .item .sel')).length) {
            Array.from($('.choice-body .item .sel'), (v) => {
                if ($(v).is('.cur')) {
                    jsonStr[0].answers.push($(v).find('.div .exam-maskcode').data('maskcode'))
                } else {
                    jsonStr[0].answers.push('')
                }
            });
        }

        //填空题-主观、客观
        if (this.txtBoxes && this.txtBoxes.length) {
            this.txtBoxes.map((i, v) => {
                if (i.getValue()) {
                    jsonStr[0].answers.push(i.getValue());
                } else {
                    jsonStr[0].answers.push('');
                }
            });
        }

        //上传题
        if ($('#uploadFile a') && $('#uploadFile a').length > 0) {
            Array.from($('.imgs-group a img'), (v) => {
                if ($(v).attr('src')) {
                    jsonStr[0].answers.push($(v).data('src'))
                }
            })
        }
        opts = {
            taskId: $('#taskId').val(),
            paperId: $('#paperId').val(),
            seqNo: parseInt($('#seqNo').val(), 10),
            jsonStr: JSON.stringify(jsonStr)
        }

        return opts;
    }
    handleFinishPage(data) {
        let renderData = data != undefined ? data : '由于网络原因，考试关闭前未能及时保存,部分题目可能保存失败'
        $('body').css('background-color', '#fff')
            .find('.exam-content').hide()
            .siblings('.finishedPage').show()
            .find('.p p').html(renderData)
        $('body').find('.header-more').remove();
    }
}

$(() => {
    //设置cookie
    $(window).on('beforeunload', () => {
        cookie.cookie.set('browserCurrentTime', new Date().getTime())
    });

    if (cookie.cookie.get('browserCurrentTime') && cookie.cookie.get('browserCurrentTime') != null) {
        toGetRequestTime = parseInt(cookie.cookie.get('browserCurrentTime'));
    } else {
        toGetRequestTime = $('.leftTime').data('browserrequesttime');
    }

    //显示倒计时
    let javaSystemTime = moment($('.leftTime').data('javasystemtime')),
        paperEndTime = moment($('.leftTime').data('paperendtime')),
        networkDifference = moment().diff(toGetRequestTime) / 2,
        difference = javaSystemTime.diff(toGetRequestTime) - networkDifference

    if (paperEndTime.diff(javaSystemTime) > 0) {
        let browserSystemTime = moment();

        let time = paperEndTime.diff(browserSystemTime + difference);
        let hour = parseInt(time / 60 / 60 / 1000);
        let min = parseInt((time % 3600000) / 60000);
        let sec = parseInt((time % 3600000) % 60000 / 1000);

        if (hour < 10)
            hour = '0' + hour;
        if (min < 10)
            min = '0' + min;
        if (sec < 10)
            sec = '0' + sec;
        if (hour > 0 || min > 0 || sec >= 0) {
            $('.div-u-like .div-3 .leftTime').text(`${hour}:${min}:${sec}`)
        }
        if ((hour == 0 && min == 1 && sec == 0) || (hour == 0 && min == 0)) {
            $('.div-u-like .div-3 .leftTime').css({
                color: 'red'
            })
        }
    } else {
        $('.div-u-like .div-3 .leftTime').text(`00:00:00`);
    }

    if ($('#code').data('code') == 0) {
        new PaperDemo();
    }
    loading.close();
    $('.exam-content').css({
        opacity: '1'
    });
    $('.exam-header').css({
        opacity: '1'
    });

})
