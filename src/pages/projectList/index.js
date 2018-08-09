/*
 * @Author: zyuan
 * @Date:   2016-12-06 10:13:44
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2017-03-09T17:51:55+08:00
 */

'use strict';

import juicer from 'juicer'
import cui from 'c-ui'
import SlideSwitch from '../../components/slide-switch/index'
import Del from '../../components/tips/deleteTip'
import proDao from '../../dao/projectManagement/projectList'
import session from '../../dao/sessionContext'
import SendInform from '../../components/sendInform/index'
import DeleteTip from '../../components/tips/deleteTip'
import SuccessTips from '../../components/tips/successTip'

import CopyProject from './mod/copyProject'
import moment from 'moment'
import store from 'store2'
import '../../components/share/hfCommon'
import '../../components/commonTab/style.less'
import './index.less'

import ph from '../../components/share/placeholder';

class ProDemo {
    constructor() {
        this.slideList = Array.from($('.do-sth .slideBtn'), (elem) => new SlideSwitch(elem))
        this.getContext();
        this.initSelectBoxes();
        this.delProject();
        this.delTask();
        this.handleSlide();
        this.search();
        this.sendInform();
        this.copyProject();
        // this.showTip();
        this.updatePaper();
        ph();
    }
    getContext() {
        let self = this;
        session.customer().then((res) => {
            self.context = res;
        })
    }
    initSelectBoxes() {
        this.selectBoxes = Array.from($('.search-filter .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
    }
    delProject() {
        let self = this;
        $('.m-title .del').map((index, i) => {
            $(i).on('click', () => {
                if (!self.context) {
                    return cui.popTips.error('网络出错')
                }
                let opts = {
                    accessToken: self.context.accessToken,
                    projectId: $(i).closest('.m-detail').attr('id')
                }
                let fn = () => {
                    proDao.deleteProject(opts).then((res) => {
                        if (res && res.code == 0) {
                            new SuccessTips('删除成功');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500)
                        } else {
                            cui.popTips.warn(res.message);
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500)
                        }
                    })
                }
                new Del(fn, {
                    isAuto: false,
                    isAnotherFn: true
                });
            })
        })
    }
    delTask() {
        let self = this;
        $('.m-item .del').map((index, i) => {
            $(i).on('click', () => {
                if (!self.context) {
                    return cui.popTips.error('网络出错')
                }
                let opts = {
                    accessToken: self.context.accessToken,
                    taskId: $(i).closest('.m-item').attr('id')
                }
                let fn = () => {
                    proDao.deleteTask(opts).then((res) => {
                        if (res && res.code == 0) {
                            new SuccessTips('删除成功');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500)
                        } else {
                            cui.popTips.warn(res.message);
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500)
                        }
                    });
                }
                new Del(fn, {
                    isAuto: false,
                    isAnotherFn: true
                });
            })
        })
    }
    handleSlide() {
        let self = this;
        self.slideList.map((v) => {
            v.$el.on('click', (e) => {

                if (!self.context) {
                    return cui.popTips.error('网络出错')
                }

                let newStatus = v.$el.is('.active') ? 0 : 1

                //项目开关
                if (v.$el.closest('.m-title').is('.project')) {
                    let opts = {
                        projectId: v.$el.closest('.m-detail').attr('id'),
                        accessToken: self.context.accessToken,
                        newStatus: newStatus
                    }

                    proDao.handleProjectStatus(opts).then((res) => {
                        if (res && res.code == 0) {
                            v.toggleClass()
                            let vT = v.$el.closest('.m-title').siblings('.m-item');
                            if (opts.newStatus == 1) { //开启项目是不用管任务的；但是停止项目的话就会相关的任务都停止
                                vT.map((index, i) => {
                                    if (!$(i).find('.slideBtn').is('.active')) {
                                        $(i).find('.slideBtn').addClass('active');
                                    }
                                })
                            } else {
                                vT.map((index, i) => {
                                    if ($(i).find('.slideBtn').is('.active')) {
                                        $(i).find('.slideBtn').removeClass('active');
                                    }
                                })
                            }
                        } else {
                            cui.popTips.error(res.message)
                        }
                    })
                }
                //任务开关
                else if (v.$el.closest('.m-item').is('.task')) {
                    if (!v.$el.closest('.m-item').siblings('.m-title').find('.slideBtn').hasClass('active')) {
                        cui.popTips.error("请先开启项目")
                        return;
                    }

                    let opts = {
                        taskId: v.$el.closest('.m-item').attr('id'),
                        accessToken: self.context.accessToken,
                        newStatus: newStatus
                    }

                    proDao.handleTaskStatus(opts).then((res) => {
                        if (res && res.code == 0) {
                            v.toggleClass()
                            let vT = Array.from(v.$el.closest('.m-detail').children('.m-item'), v => v),
                                validate = false;

                            for (let i in vT) {
                                if ($(vT[i]).find('.slideBtn').is('.active')) {
                                    validate = true
                                }
                            }

                            if (!validate)
                                v.$el.closest('.m-detail').find('.m-title .slideBtn').click()
                        } else {
                            cui.popTips.error(res.message)
                        }
                    })
                }
            })
        });
    }
    urlParam(name, newVal) {
        return window.location.origin + window.location.pathname + '?' + name + '=' + newVal
    }
    search() {
        $('.search-filter').on('click', '.btn', () => {
            setTimeout(() => {
                let searchVal = $('.search-filter .txt').val();
                let searchName = this.selectBoxes[0].getValue() ? this.selectBoxes[0].getValue().value : $('input[name=searchType]').val();
                searchVal = encodeURIComponent(searchVal)
                window.location.href = `/customer/projectList/index?${searchName}=${searchVal}`;
            }, 100)
        })
    }
    sendInform() {
        $('.notice').on('click', (e) => {
            new SendInform({
                type: 'examiner',
                taskId: $(e.target).data('taskid'),
                accessToken: this.context ? this.context.accessToken : '',
                projectId: $(e.target).data('projectid'),
                projectName: $(e.target).data('projectname'),
                taskName: $(e.target).data('taskname')
            })
        })
    }
    copyProject() {
        $('.m-detail .do-sth').on('click', '.copy', (e) => {
            let $this = $(e.currentTarget);
            if (!this.context) {
                return cui.popTips.error('网络错误！')
            } else {
                let $this = $(e.currentTarget);
                let data = {
                    accessToken: this.context.accessToken,
                    proName: $this.closest('.do-sth').siblings('.info').find('a').text(),
                    curTime: `[${moment(new Date).format('YYYY/MM/DD HH:mm:ss')}]`,
                    sourceProjectId: $this.data('projectid')
                }
                new CopyProject(data);
            }
        })
    }

    updatePaper() { //版本更新
        this.proDao = proDao;
        $('.m-item').on('click', '.update', (e) => {
            let $this = $(e.currentTarget);
            let taskId = $this.data('taskid')
            if (!this.context) {
                return cui.popTips.error('网络错误！')
            } else {
                let checkBoxes;
                let callFunc = () => {
                    this.proDao.updatePaperReference(taskId, this.context.accessToken).then((res) => {
                        if (res && res.code == 0) {
                            new SuccessTips('更新成功', '', true);
                            if (checkBoxes && checkBoxes[0].getValue()) {
                                store.set('not_show_update_paper_ref', 1);
                            }
                        } else {
                            return cui.popTips.error(res.message);
                        }
                    })
                }
                if (store.get('not_show_update_paper_ref') == 1) {
                    callFunc();
                    return false;
                }

                let data = {
                    tip: '当前试卷有新版本，是否需要更新？',
                    neverShow: false
                }
                let tpljuicer = juicer(require('./tpl/showTip.html'));
                let html = tpljuicer.render(data);

                let tmpHeader = $('<span>更新提示</span>');
                let tmpContent = $(html);
                let modalPanel = new cui.Panel(tmpHeader, tmpContent);
                let modalBrocken = new cui.Brocken();
                let modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
                checkBoxes = Array.from($('#warmTip .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)))
                modalPanel.getPanel().css({
                    width: '500px',
                    height: '300px'
                });
                modal.open();

                modal.$el.on('click', '.btns .sure', () => {
                    callFunc()

                }).on('click', '.btns .cancle', () => {
                    modal.close()
                })
            }
        })
    }

}
let proIns = new ProDemo();