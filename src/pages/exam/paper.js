/*
 * @Author: sihui.cao
 * @Date:   2017-02-07 18:35:34
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-03-13T11:04:15+08:00
 */

'use strict';
import '../../components/share/hfCommon'
import './paper.less'

import cui from 'c-ui'
import juicer from 'juicer'
import session from '../../dao/sessionContext'
import paperDao from '../../dao/examManagement/exercise'
import ajaxFileUpload from '../../components/ajaxFileUpload/index'
import moment from 'moment'
import loading from '../../components/loading'
import tips from '../../components/tips/deleteTip'
import WarnTip from '../../components/tips/warnTip'
import SuccessTip from '../../components/tips/successTip'
import * as tools from '../../components/share/tools'
import CheckImgs from '../../components/ckeckImgs/index'
import cookie from 'cookie_js'
import AntiCheating from '../../components/paper-Anti-Cheating'

let toGetRequestTime = null;

class Paper {
    constructor() {
        this.init();
        this.maxSize = 5 //单位M
    }
    init() {
        this.textBoxs = Array.from($('.cui-textBoxContainer'), (v) => new cui.TextBox($(v))) || '';
        this.radios = Array.from($('.cui-radioGroupContainer'), (v) => new cui.RadioGroup($(v))) || '';
        this.checkboxes = Array.from($('.cui-checkboxContainer'), (v) => new cui.Checkbox($(v))) || '';
        this.watch()
        this.countDown()
        this.toQues(tools.pageHelper.urlContext()['quesNo'])

    }
    judgeType(fileName, type) { //判断文件类型
        let fileType,
            fileSuffix = fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase(); //后缀
        if (fileSuffix == 'xls' || fileSuffix == 'xlsx') {
            fileType = 3;
        } else if (fileSuffix == 'doc' || fileSuffix == 'docx') {
            fileType = 2;
        } else if (fileSuffix == "jpg" || fileSuffix == "jpeg" || fileSuffix == "png" || fileSuffix == "gif" || fileSuffix == "bmp") {
            fileType = 1;
        }
        if (type.includes(`${fileType}`))
            return fileType;
        let typeName = (type.includes(1) ? '图片 ' : '') + (type.includes(2) ? '文档 ' : '') + (type.includes(3) ? '表格 ' : '');
        cui.popTips.warn(`文件类型有误,只支持${typeName}`);
        return false;
    }
    judgeFooter() {
        let hgs = $('.special-wrap>.special-content').outerHeight() + 70,
            winHei = $(window).height()
        if (hgs <= winHei) {
            $('#ex-footer').addClass('fixed');
        } else {
            $('#ex-footer').removeClass('fixed');
        }
    }
    watch() {
        let self = this;
        $('.wrap').on('click', '.slide', (e) => { //收起展开
            if ($(e.target).is('.cpf-icon-shrink')) {
                $(e.target).addClass('cpf-icon-extend').removeClass('cpf-icon-shrink');
            } else {
                $(e.target).addClass('cpf-icon-shrink').removeClass('cpf-icon-extend');
            }
            $('.select-ques-wrap').toggleClass('dis')
            this.judgeFooter()
        }).on('click', '.more', (e) => { //加载更多

            $(e.target).hide()
            $('.select-ques').height('auto')

        }).on('input', '.blankInput', (e) => { //填空题字数限制
            let blankLimit = $(e.target).data('limit')
            if (blankLimit) {
                if ($(e.target).val().length > blankLimit) {
                    $(e.target).val($(e.target).val().substr(0, blankLimit));
                    return cui.popTips.warn(`字数上限为${blankLimit}`)
                } else {
                    $(e.target).next('.limit').find('span').text(blankLimit - $(e.target).val().length)
                }
            } else if ($(e.target).val().length > 5000) {
                $(e.target).val($(e.target).val().substr(0, 5000))
                return cui.popTips.warn(`答案过长，请保持每个答案在5000个字以下`)
            }

        }).on('change', '.blankInput', (e) => { //填空题字数限制
            let blankLimit = $(e.target).data('limit')
            if (blankLimit) {
                if ($(e.target).val().length > blankLimit) {
                    $(e.target).val($(e.target).val().substr(0, blankLimit));
                    return cui.popTips.warn(`字数上限为${blankLimit}`)
                } else {
                    $(e.target).next('.limit').find('span').text(blankLimit - $(e.target).val().length)
                }
            } else if ($(e.target).val().length > 5000) {
                $(e.target).val($(e.target).val().substr(0, 5000))
                return cui.popTips.warn(`答案过长，请保持每个答案在5000个字以下`)
            }

        }).on("change", ".file", (e) => { //选择文件
            if ($(e.target).val()) {
                let fileType = $(e.target).data('type'),
                    file = e.target.files ? e.target.files[0] : $(e.target).val(),
                    fileName = e.target.files ? file.name : file.slice(file.lastIndexOf("\\") + 1),
                    type = self.judgeType(fileName, `${fileType}`)

                if (type) {
                    $(e.target).prev('.block').val(fileName).data('type', type == 1 ? 'img' : type == 2 ? 'word' : 'xls');
                } else {
                    $(e.target).prev('.block').val('');
                }
            } else {
                $(e.target).prev(".block").val('')
            }
        }).on('click', '.uploadBtn', (e) => { //上传附件
            if (!$(e.target).prevAll('.block').val()) {
                $('.cui-popTips').remove()
                cui.popTips.warn('请先选择文件')
                return;
            }

            loading.open()
            session.user().then((r) => {
                let opts = {
                    taskId: $('#taskId').val(),
                    paperId: $('#paperId').val(),
                    seqNo: $(e.target).data('seqno'),
                    accessToken: r.accessToken,
                    fileName: $(e.target).prevAll('.block').val()
                }
                return paperDao.uploadFile(`file${$(e.target).data('id')}`, opts)
            }).then((res) => {
                loading.close()
                if (res.code == 0) {
                    let size = res.response.split(';')[1],
                        arr = res.response.split('/'),
                        newName = arr[arr.length - 1].split(';')[0]
                    size = Math.ceil(size / 1024)

                    self.addUploadFile({
                        seqNo: $(e.target).data('seqno'),
                        newName: newName,
                        name: newName.substr(newName.split('_')[0].length + 1, newName.length),
                        el: `#quesNo${$(e.target).data('seqno')}`,
                        size: size + 'K',
                        type: $(e.target).prevAll('.block').data('type'),
                        src: res.response.split(';')[0]
                    })
                    new SuccessTip('上传成功', null, false);
                } else {
                    cui.popTips.error(res.message)
                }
                $(e.target).prevAll('.block').val('')
                $(e.target).prevAll('.file')[0].outerHTML = $(e.target).prevAll('.file')[0].outerHTML
                $(e.target).prevAll('.file').val('')
            }).catch((err) => {
                loading.close()
                $(e.target).prevAll('.block').val('')
                $(e.target).prevAll('.file')[0].outerHTML = $(e.target).prevAll('.file')[0].outerHTML
                $(e.target).prevAll('.file').val('')
            })
        }).on('click', '.upload .delFile', (e) => { //删除附件
            let fn = () => {
                loading.open()
                let accessToken;
                session.user().then((r) => {
                    accessToken = r.accessToken;
                    let opts = {
                        accessToken: r.accessToken,
                        taskId: $('#taskId').val(),
                        paperId: $('#paperId').val(),
                        fileName: $(e.target).data('name'),
                        suffix: $(e.target).data('suffix'),
                        seqNo: $(e.target).data('seqno')
                    }
                    return paperDao.deleteFile(opts);
                }).then((r) => {
                    if (r && r.code == 0) {
                        $(e.target).parents('.file-item').remove()
                        let opts = this.handleCommonData(); //删除成功之后调保存接口
                        opts.accessToken = accessToken
                        return paperDao.getPaperDetail(opts)
                    } else {
                        loading.close()
                        cui.popTips.error(r.message)
                    }
                }).then((r) => {
                    loading.close()
                    if (r && r.code == 0) {
                        new SuccessTip('删除成功', null, false)
                        self.judgeFooter()
                    } else {
                        cui.popTips.error(r.message)
                    }
                }).catch((err) => {
                    loading.close()
                })
            }

            new tips(fn, {
                isAuto: false,
                content: '请确认是否删除附件？'
            });
        }).on('click', '.next,.submit,.prev', (e) => { //提交

            let $this = $(e.target);
            let type = $this.is('.next') ? 0 : $this.is('.prev') ? 1 : 2
            this.showTip(type)
        }).on('click', '.option-content', (e) => {
            let $el = $(e.currentTarget).parent('.option-item').find('input')
            if ($el.length) {
                let value = $el.length ? $el[0].checked : null;
                $el[0].checked = !value;
            }
        }).on('click', '.uploaded-files .item-content[data-type="img"]', (e) => {
            new CheckImgs({
                $elem: $(e.currentTarget),
                taskId: $('#taskId').val(),
                paperId: $('#paperId').val(),
                seqNo: $(e.target).parents('.upload.question').data('num')
            })
        }).on('click', '.option-content', (e) => { //选中答案
            let $el = $(e.currentTarget)
            if ($el.prev('.cui-radioContainer').length > 0) {
                let value = $el.prev('.cui-radioContainer').find('input')[0].checked;
                $el.prev('.cui-radioContainer').find('input')[0].checked = !value;
            }
            if ($el.prev('.cui-checkboxContainer').length > 0) {
                let value = $el.prev('.cui-checkboxContainer').find('input')[0].checked;
                $el.prev('.cui-checkboxContainer').find('input')[0].checked = !value;
            }
        })




        $('.select-ques .item').on('click', (e) => { //跳题
            let val = parseInt($(e.target).text()),
                arr = $('#pagesNum').data('value'),
                p = parseInt(tools.pageHelper.urlContext()['pageNo']) || 1,
                paperId = $('#paperId').val(),
                taskId = $('#taskId').val(),
                count = 0;
            for (let i = 0; i < arr.length; i++) {
                count += arr[i]
                if (count >= val) {
                    if (p != i + 1) {
                        this.saveQues(`/exam/paper?taskId=${taskId}&paperId=${paperId}&pageNo=${i+1}&quesNo=quesNo${val}&browserRequestTime=${moment()}`)
                    } else {
                        this.toQues(`quesNo${val}`)
                    }
                    return;
                }
            }
        })
        $('.jumpPage').on('blur', 'input', (e) => { //跳页
            let page = $(e.target).val(),
                paperId = $('#paperId').val(),
                taskId = $('#taskId').val()
            if (page != '') {
                this.saveQues(`/exam/paper?taskId=${taskId}&paperId=${paperId}&pageNo=${page}&browserRequestTime=${moment()}`)
            }
        }).on('keydown', 'input', (e) => {
            if (e.keyCode == 8 || e.keyCode == 37 || e.keyCode == 39 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                return true
            }
            return false;
        }).on('keyup', 'input', (e) => {
            let val = parseInt(e.target.value),
                totalPage = parseInt($('.jumpPage .total').text()),
                paperId = $('#paperId').val(),
                taskId = $('#taskId').val()

            if (e.target.value != '') {
                let reg = new RegExp(/^\d+/)
                if (isNaN(val) || !reg.test(val)) {
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '请输入正整数', {
                        'min-width': '72px',
                        top: '48px'
                    });
                } else if (!isNaN(totalPage) && val > totalPage) {
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '不能大于总页数', {
                        'min-width': '86px',
                        top: '48px'
                    });
                } else if (val == 0) {
                    e.target.value = '';
                    new WarnTip($(e.target).parent(), '不能小于1', {
                        'min-width': '57px',
                        top: '48px'
                    });
                } else if (e.keyCode == 13) {
                    this.saveQues(`/exam/paper?taskId=${taskId}&paperId=${paperId}&pageNo=${val}`)
                }
            }
        })

        $(window).on('scroll', () => {
            let scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
                hide = $('.progress-wrap').position().top,
                show = $('.questions').position().top
            if (scrollTop <= hide) {
                $('.alertClock').fadeOut(100)
            } else if (scrollTop >= show) {
                $('.alertClock').fadeIn()
            }
        })
    }
    saveQues(url) { //跳题和跳页保存答案
        let opts = this.handleCommonData()
        session.user().then((r) => {
            opts.accessToken = r.accessToken
            return paperDao.getPaperDetail(opts) //其实是调用答题的接口，不要被名称混淆了
        }).then((res) => {
            window.location.href = url
        })
    }
    toQues(name) {
        setTimeout(() => {
            if ($(`#${name}`).length > 0) {
                $("html,body").scrollTop($(`#${name}`).position().top - 72);
            }
        }, 0)

    }
    autoSubmit() {
        let self = this;
        $('.remainTime span').text(`00:00:00`);

        this.autoSubmitTip = this.confirmTip({
            title: '自动交卷提示',
            content: '考试时间已到，系统正在帮您交卷，请稍后确定。',
            btn: ['请稍后...'],
            locked: [true]
        })
        this.autoSubmitTip.one('click', '.confirm', () => {
            self.modal.$container.remove()
            $('.questions,.confirm,.select-ques-wrap,.slide,.alertClock,.go-to-bottom').hide();
            $('.finish-contain').removeClass('dis')
            self.judgeFooter()
        })
        this.showTip(3);
    }
    countDown() {
        this.canAuto = true;
        let javaSystemTime = moment($('#times').data('javasystemtime')), //后台系统时间
            paperEndTime = moment($('#times').data('paperendtime')),
            networkDifference = moment().diff(toGetRequestTime) / 2,
            difference = javaSystemTime.diff(toGetRequestTime) - networkDifference;

        let fn = () => {
            let browserSystemTime = moment();
            let time = paperEndTime.diff(browserSystemTime + difference);

            if (time > 1000) {
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
                    $('.remainTime span,.alertTime').text(`${hour}:${min}:${sec}`)
                }
                if ((hour == 0 && min == 1 && sec == 0) || (hour == 0 && min == 0)) {
                    $('.remainTime,.alertTime').addClass('urgent')
                    $('.alertClock img').attr('src', '/images/alert.gif').addClass('urgent')
                }
            } else {
                $('.remainTime span,.alertTime').text('00:00:00')
                if (this.timer)
                    clearInterval(this.timer);
                if (this.canAuto)
                    this.autoSubmit()
            }
        }
        if (paperEndTime.diff(javaSystemTime) > 0) {
            fn()
            this.timer = setInterval(fn, 1000)
        } else {
            this.autoSubmit()
        }
    }
    showTip(type, callbackFunc) {
        this.canAuto = false;
        let self = this;
        let fn = () => {
            if (type < 3)
                loading.open()
            let opts = this.handleCommonData()
            session.user().then((r) => {
                opts.accessToken = r.accessToken
                if (type == 4 && callbackFunc)
                    opts.ignoreLimit = this.ignoreLimit;
                return paperDao.getPaperDetail(opts) //其实是调用答题的接口，不要被名称混淆了
            }).then((res) => {
                if (res && res.code == 0) {
                    if (type == 0) { //下一页
                        loading.close()
                        window.location.href = `/exam/paper?taskId=${opts.taskId}&paperId=${opts.paperId}&pageNo=${opts.pageNo+1}`
                    } else if (type == 1) { //上一页
                        loading.close()
                        window.location.href = `/exam/paper?taskId=${opts.taskId}&paperId=${opts.paperId}&pageNo=${opts.pageNo-1}`
                    } else {
                        let submitFn = () => {
                            let data = {
                                taskId: opts.taskId,
                                paperId: opts.paperId,
                                accessToken: opts.accessToken
                            }
                            paperDao.submitPaper(data).then((r) => { //提交
                                loading.close()
                                $(window).off('blur')
                                if (r && r.code == 0) {
                                    if (type == 3) {
                                        this.autoSubmitTip.find('.confirm').removeClass('locked').text('确定')
                                        $('.finish-contain .word').html(r.response)
                                    } else {
                                        clearInterval(this.timer)
                                            //更新进度条
                                        let total = parseInt($('.progress-wrap .total').text()),
                                            finish = parseInt((total - this.undoNum) / total * 100) + '%'
                                        $('.progress-wrap .done').text(total - this.undoNum)
                                            .parents('.progress-wrap').find('.progress .block').width(finish)
                                            .parent().find('span').width(finish).text(finish)

                                        $('.questions,.confirm,.select-ques-wrap,.slide,.alertClock,.go-to-bottom').hide();
                                        $('.finish-contain').removeClass('dis').find('.word').html(r.response)
                                        self.judgeFooter()
                                        if (callbackFunc) callbackFunc(r.code);
                                    }
                                } else {
                                    if (type == 3 || type == 4) {
                                        if (r.code == 27002007) {
                                            self.autoSubmitTip.find('.confirm').hide()
                                                .parent().prev().html(`由于网络原因，考试关闭前未能及时保存<br>部分题目可能保存失败`)
                                            setTimeout(() => {
                                                window.location.href = `/exam/taskList`;
                                            }, 5000);
                                        } else if (r.code == 27002012 && callbackFunc) {
                                            callbackFunc(r.code);
                                        } else {
                                            cui.popTips.warn(res.message)
                                            setTimeout(() => {
                                                window.location.href = `/exam/taskList`;
                                            }, 2000);
                                        }
                                    } else {
                                        this.canAuto = true; //防止手动提交和自动提交并发 & 确保手动提交失败后自动提交
                                        if (!this.timer) {
                                            this.autoSubmit()
                                        }
                                    }
                                }
                            })
                        }
                        this.undoNum = self.getUndoNum(opts)
                        if (type == 2 && this.undoNum > 0) {
                            loading.close()
                            self.confirmTip({
                                title: '确认提示',
                                btn: ['确定', '取消'],
                                content: `您还有${this.undoNum}道题未答，请确认是否提交？`
                            }).one('click', '.confirm', () => {
                                self.modal.$container.remove()
                                submitFn()
                            }).one('click', '.cancel', () => {
                                self.modal.$container.remove()
                            })
                        } else {
                            submitFn()
                        }
                    }
                } else {
                    loading.close()
                    if (type == 3 || type == 4) {
                        if (res.code == 27002007) { //保存晚于系统自动交卷
                            self.autoSubmitTip.find('.confirm').hide()
                                .parent().prev().html(`由于网络原因，考试关闭前未能及时保存<br>部分题目可能保存失败`)
                            setTimeout(() => {
                                window.location.href = `/exam/taskList`;
                            }, 5000);

                        } else if (r.code == 27002012 && callbackFunc) {
                            callbackFunc(r.code);
                        } else {
                            cui.popTips.warn(res.message);
                            setTimeout(() => {
                                window.location.href = `/exam/taskList`;
                            }, 2000);
                        }
                    } else {
                        if (res.code == 27002007) {
                            cui.popTips.warn(res.message);
                            setTimeout(() => {
                                window.location.href = `/exam/taskList`;
                            }, 1000);
                        } else {
                            this.canAuto = true; //防止手动提交和自动提交并发 & 确保手动提交失败后自动提交
                            if (!this.timer) {
                                this.autoSubmit()
                            }
                        }
                    }
                }
            }).catch((err) => {
                loading.close()
                cui.popTips.warn('服务器错误!')
                if (type == 3) {
                    self.autoSubmitTip.find('.confirm').hide()
                        .parent().prev().html(`由于网络错误，此次提交失败`)
                    setTimeout(() => {
                        window.location.href = `/exam/taskList`;
                    }, 2000);
                } else {
                    this.canAuto = true; //防止手动提交和自动提交并发 & 确保手动提交失败后自动提交
                    if (!this.timer) {
                        this.autoSubmit()
                    }
                }
            })
        }
        fn()
    }
    confirmTip(data) {
        let tplHtml = `<div class='del'>
                            <p>${data.content}</p>
                            <p class='btn'>
                                <a class="cui-button preset-blue confirm">
                                    <span>${data.btn[0]}</span>
                                </a>
                                <a class="cui-button cancel">
                                    <span>${data.btn[1]}</span>
                                </a>
                            </p></div>`;
        let tmpHeader = $(`<span>${data.title}</span>`);
        let tmpContent = $(tplHtml);
        let modalPanel = new cui.Panel(tmpHeader, tmpContent);
        let modalBrocken = new cui.Brocken();


        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
        this.modal.$broken.off('click');


        if (data.btn.length == 1) {
            this.modal.$el.find('.cancel').hide()
            this.modal.$el.find('.cui-modal-close').hide()
        }

        for (let i in data.locked) {
            if (data.locked[i])
                this.modal.$el.find(`.cui-button:eq(${i})`).addClass('locked')
        }


        modalPanel.getPanel().css({
            height: '250px',
            width: '550px'
        });

        this.modal.open();
        this.modal.on('modalClose', () => {
            this.modal.$container.remove()
        })
        return this.modal.$el
    }
    handleCommonData() {
        let jsonStr = [],
            opts = {};

        //单选-多选

        if ($('.single.question,.multiple.question').length) {
            Array.from($('.single.question,.multiple.question'), (v) => {
                let answers = Array.from($('input', $(v)), (k) => k.checked ? k.value : '')
                jsonStr.push({
                    seqNo: $(v).data('num'),
                    type: $(v).data('type'),
                    answers: answers,
                    id: $(v).data('id')
                })
            });
        }

        //填空题-主观、客观
        if ($('.obj-fill.question,.sub-fill.question').length) {
            Array.from($('.obj-fill.question,.sub-fill.question'), (v) => {
                let answers = Array.from($('.blankInput', $(v)), (k) => k.value || '')
                jsonStr.push({
                    seqNo: $(v).data('num'),
                    type: $(v).data('type'),
                    answers: answers,
                    id: $(v).data('id')
                })
            });
        }

        //上传题
        if ($('.upload.question').length) {
            Array.from($('.upload.question'), (v) => {
                let answers = Array.from($('.file-item', $(v)), (k) => {
                    return $(k).data('src') + ';' + $(k).data('name') + ';' + $(k).data('type') + ';' + $(k).data('size')
                })
                jsonStr.push({
                    seqNo: $(v).data('num'),
                    type: $(v).data('type'),
                    answers: answers,
                    id: $(v).data('id')
                })
            })
        }
        opts = {
            taskId: $('#taskId').val(),
            paperId: $('#paperId').val(),
            seqNo: 0,
            pageNo: parseInt(tools.pageHelper.urlContext()['pageNo']),
            jsonStr: JSON.stringify(jsonStr),
            data: jsonStr
        }

        return opts;
    }
    getUndoNum(data) {
        let undoNum = 0,
            prevQuesNum = [],
            currentData = data,
            arr = $('#pagesNum').data('value'), //每页个数
            pageNo = parseInt($('#pageNo').val()) //当前页

        for (let i = 0, cur = 1; i < arr.length; i++) { //除当前页以外的所有题号
            if (pageNo == (i + 1)) {
                cur += arr[i]
                continue;
            }
            for (let j = 0; j < arr[i]; j++, cur++)
                prevQuesNum.push(cur)
        }
        for (let i = 0; i < prevQuesNum.length; i++) {
            if (!$(`.select-ques .item:eq(${prevQuesNum[i]-1})`).is('.active'))
                undoNum++;
        }
        for (let i = 0; i < currentData.data.length; i++) {
            let validate = false;
            for (let j = 0; j < currentData.data[i].answers.length; j++) {
                if (currentData.data[i].answers[j])
                    validate = true
            }
            if (!validate)
                undoNum++;
        }
        return undoNum
    }
    addUploadFile(data) {
        let arr = data.name.split('.'),
            suffix = arr[arr.length - 1],
            name = data.name.substr(0, data.name.length - suffix.length - 1)
        let html = `<li class="file-item cui-textBoxContainer" data-src="${data.src}" data-type="${data.type}" data-name="${data.name}" data-size="${data.size}">` +
            (data.type == 'img' ? `<div class="item-content isImg" data-type="${data.type}" data-href="${data.src}" data-name="${data.newName}">` : `<div class="item-content" data-type="${data.type}">`) +
            `<div class="detail">
                                <p>${data.name}</p>
                                <p>${data.size}</p>
                            </div>
                            <div class="icon ${data.type}">
                                <img src="${data.type=='img'?data.src:data.type=='word'?'/images/word.png':'/images/xls.png'}" />
                            </div>
                        </div>
                        <i class="cpf-icon cpf-icon-thin-close delFile" data-name="${name}" data-suffix="${suffix}" data-seqNo="${data.seqNo}"></i>
                    </li>`;
        $(html).appendTo($('.uploaded-files', $(data.el)))
        this.judgeFooter()
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
        toGetRequestTime = $('#times').data('browserrequesttime');
    }

    var paper = new Paper();
    let ac = new AntiCheating({
        fileTag: '.upload-file input.block',
        fileBtn: '.upload-file input.file',
        currSuspendCount: parseInt($('#curCount').val() || 0),
        totalCount: parseInt($('#limitCount').val() || 0),
        data: {
            taskId: $('#taskId').val(),
            paperId: $('#paperId').val()
        },
        processHanlderData(type, func) {
            paper.ignoreLimit = true;
            paper.showTip(type, func)
        }
    });

    ac.initEvents();
})
