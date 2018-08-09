/**
 * @Author: Jet.Chan
 * @Date:   2017-02-16T13:51:18+08:00
 * @Email:  guanjie.chen@talebase.com
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-03-16T11:23:56+08:00
 */


//防作弊功能组件

'use strict';
import './style.less';
import cui from 'c-ui';
import exerciseDao from '../../dao/examManagement/exercise';
import loading from '../loading';
import session from '../../dao/sessionContext';
import moment from 'moment';

import juicer from 'juicer';
import suspendTipsTpl from './tpl/suspendTips.html';
import endSubmitTipsTpl from './tpl/endSubmitTips.html';

import * as tools from '../share/tools';

class AntiCheating {
    constructor(setting) {
        this.setting = Object.assign({
            fileTag: 'input[type=file]',
            fileBtn: '',
            currSuspendCount: 0,
            totalCount: 10,
            isOpenFileChoise: false,
            supervisoryWindow: window,
            totalTimeLength: 90,
            data: {},
            processHanlderData: null
        }, setting);
    }
    initEvents() {
        //当总数为空或者是-1时，等于不开启防作弊
        if (this.setting.totalCount < 0 || this.setting.totalCount == undefined) {
            return;
        } else if (this.setting.currSuspendCount > this.setting.totalCount) {
            this.checkBeakOffCount();
            return;
        }

        let blur_fn = (e) => {
            setTimeout(() => {
                if (!this.setting.isOpenFileChoise) {
                    // this.setting.currSuspendCount++;

                    //提交终端次数
                    // loading.open();
                    //console.log(this.setting.currSuspendCount);
                    //记录行为
                    this.actionRecord().then(r => {
                        // this.checkBeakOffCount(r)
                        // loading.close()
                        let $cui_modal = $('.cui-modalContainer');
                        if (this.modal && $cui_modal.length > 0 && $('.cui-panelContainer .cui-panel-header >span', $cui_modal).is('.showSuspendTips') && !$cui_modal.is(':hidden')) {
                            // this.actionRecord();
                        } else {
                            this.showSuspendTips()
                            // this.checkBeakOffCount();
                        }
                    }).catch(r => {
                        cui.popTips.error('服务端发生错误');
                        // loading.close()
                    })

                }
            }, 20)
        }
        $(this.setting.supervisoryWindow).on('blur', blur_fn);

        //90秒选择文件计时
        let timerStat_fn = args => {
                timerCount++;
                if (timerCount >= this.setting.totalTimeLength) {
                    timerCount = 0;
                    if (this.setting.currSuspendCount > this.setting.totalCount) {
                        if (this.timer)
                            clearInterval(this.timer);
                    }
                    this.checkBeakOffCount();
                }
            },
            timerCount = 0;

        let click_fn = e => {
                this.setting.isOpenFileChoise = true;
                this.timer = setInterval(timerStat_fn, 1000);
                timerCount = 0;
            },
            change_fn = e => {
                this.setting.isOpenFileChoise = false;
                clearInterval(this.timer);
                timerCount = 0;
            },
            focus_fn = e => {
                setTimeout(() => {
                    if (this.setting.isOpenFileChoise) {
                        this.setting.isOpenFileChoise = false;
                        clearInterval(this.timer);
                        timerCount = 0;
                    }
                }, 10);

            }
        if (this.setting.fileTag || this.setting.fileBtn) {
            if (tools.pageHelper.getBrowserInfo().appname == 'chrome' || tools.pageHelper.getBrowserInfo().appname == 'opera') {
                if (this.setting.fileTag && !this.setting.fileBtn) {
                    $('body').on('click', this.setting.fileTag, click_fn).on('change', this.setting.fileTag, change_fn).on('focus', this.setting.fileTag, focus_fn)
                } else if (this.setting.fileTag && this.setting.fileBtn) {
                    $('body').on('change', this.setting.fileTag, change_fn);
                    $('body').on('click', this.setting.fileBtn, click_fn).on('focus', this.setting.fileBtn, focus_fn)
                }
            }
            if (tools.pageHelper.getBrowserInfo().appname == 'msie') {
                click_fn = e => {
                    this.setting.isOpenFileChoise = true;
                    this.startTimer = moment();
                    $(this.setting.supervisoryWindow).off('blur')
                };
                change_fn = e => {
                    this.setting.isOpenFileChoise = false;
                };
                focus_fn = e => {
                    setTimeout(() => {
                        if (this.setting.isOpenFileChoise) {
                            this.setting.isOpenFileChoise = false;
                            this.endTimer = moment();
                            timerStat_fn();
                            $(this.setting.supervisoryWindow).on('blur', blur_fn);
                            //$('body').append(`<div>focus</div>`)
                        }
                    }, 120);
                };
                timerStat_fn = args => {
                    if (this.endTimer.diff(this.startTimer, 'second') > this.setting.totalTimeLength) {
                        this.checkBeakOffCount();
                    }
                };
                if (this.setting.fileTag && !this.setting.fileBtn) {
                    $('body').on('click', this.setting.fileTag, click_fn).on('change', this.setting.fileTag, change_fn).on('focus', this.setting.fileTag, focus_fn)
                } else if (this.setting.fileTag && this.setting.fileBtn) {
                    $('body').on('change', this.setting.fileTag, change_fn);
                    $('body').on('click', this.setting.fileBtn, click_fn).on('focus', this.setting.fileBtn, focus_fn)
                }
            }
        }
    }
    showSuspendTips() {
        $('.cui-modalContainer').remove();

        const currCount = this.setting.currSuspendCount + 1
        const totalCount = this.setting.totalCount

        let tpljuicer = juicer(suspendTipsTpl),
            html = tpljuicer.render({
                currCount,
                totalCount
            });

        let modalPanel = new cui.Panel($(`<span class='showSuspendTips'>温馨提示</span>`), $(html));
        let modalBrocken = new cui.Brocken();
        let modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css({
            width: '500px',
            height: '280px'
        });
        modal.$el.on('click', '.btns', () => {
            modal.close()
            this.modal = undefined;
            this.checkBeakOffCount()
        })
        modal.open();
        this.modal = modal;
        this.modal.$container.find('.cui-brocken').off('click');
        this.modal.$el.find('.cpf-icon-thin-close.cui-modal-close').remove();
    }
    showEndTips() {
        $('.cui-modalContainer').remove();

        let tpljuicer = juicer(endSubmitTipsTpl),
            html = tpljuicer.render();

        let modalPanel = new cui.Panel($('<span>温馨提示</span>'), $(html));
        let modalBrocken = new cui.Brocken();
        let modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css({
            width: '500px',
            height: '280px'
        });
        modal.open();
        this.modal = modal;
    }
    checkBeakOffCount() {
        let showModal = e => {
            this.showEndTips();
            this.modal.$container.find('.cui-brocken').off('click');
            this.modal.$el.find('.cpf-icon-thin-close.cui-modal-close').remove();
            if (this.timer)
                clearInterval(this.timer);
        }

        let autoSubmit = () => {
            //自动提交
            this.processAutSubmit = true;
            this.setting.processHanlderData(4, code => {
                if (code == 0) {
                    this.modal.$container.find('.cui-button').html('<span>确定</span>').on('click', (e) => {
                        this.modal.close();
                    })
                } else if (code == 27002007) {
                    this.processAutSubmit = false
                    this.modal.$container.find('.tips-conten>p').html('由于网络原因，考试关闭前未能及时保存<br>部分题目可能保存失败');
                    this.modal.$container.find('.cui-button').html('<span>确定</span>').on('click', (e) => {
                        this.modal.close();
                        window.location.href = `/exam/taskList`;
                    })
                }
            });
        }

        if (this.processAutSubmit) return;
        session.user().then(r => {
            return exerciseDao.change({
                accessToken: r.accessToken,
                taskId: this.setting.data.taskId,
                paperId: this.setting.data.paperId,
                type: 0
            })
        }).then(r => {
            this.setting.currSuspendCount = r.response.curCount;
            this.setting.totalCount = r.response.limitCount;
            return r
        }).then(r => {
            if (this.setting.currSuspendCount > this.setting.totalCount) {
                showModal();
                //TODO:自动提交
                autoSubmit();
            } else {
                if (r.code == 27002012) {
                    showModal();
                    //TODO:自动提交
                    autoSubmit();
                } else if (r.code != 0) {
                    // this.setting.currSuspendCount--;
                    cui.popTips.error(r.message);
                }
            }
        })

    }
    actionRecord() {
        return session.user().then(r => {
            return exerciseDao.change({
                accessToken: r.accessToken,
                taskId: this.setting.data.taskId,
                paperId: this.setting.data.paperId,
                type: 1
            });
        }).then(r => {
            this.setting.currSuspendCount = r.response.curCount;
            this.setting.totalCount = r.response.limitCount;
            return r
        })
    }
}

export default AntiCheating;
