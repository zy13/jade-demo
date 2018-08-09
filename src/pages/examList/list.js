/*
 * @Author: zyuan
 * @Date:   2016-12-26 11:01:23
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-10T11:58:04+08:00
 */

'use strict';

import '../../components/share/hfCommon'
import '../../components/commonTab/style.less'
import './list.less'

import cui from 'c-ui'
import juicer from 'juicer'
import SlideSwitch from '../../components/slide-switch/index'
import SuccessTip from '../../components/tips/successTip'
import DeleteTip from '../../components/tips/deleteTip'
import session from '../../dao/sessionContext'
import examListDao from '../../dao/examManagement/examList'
import WarnTip from '../../components/tips/warnTip'
import moment from 'moment'
import {
    FormOptions
} from '../../components/share/tools';
import * as tools from '../../components/share/tools'
const fo = new FormOptions();
import ph from '../../components/share/placeholder';

class ListDemo {
    constructor() {
        this.init();
        ph();
    }
    init() {
        this.slideList = Array.from($('.mainInfo .item .slideBtn'), (e) => new SlideSwitch(e));
        this.selBox = Array.from($('.search-filter .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)));
        this.getContext();
        this.handleOperation();
    }
    getContext() {
        let self = this;
        session.customer().then((res) => {
            self.context = res;
        })
    }
    handleOperation() {
        $('.wrap').on('click', '.search-ent button,.search-status .status a', (e) => { //搜索
            if ($(e.target).parents('.search-status').length > 0)
                $(e.target).addClass('cur').siblings().removeClass('cur')
            let searchModel = new Object();
            searchModel.key1Begin = $('#startDate').val() ? $('#startDate').val() : '';
            searchModel.key1End = $('#endDate').val() ? $('#endDate').val() : '';
            searchModel.key2 = encodeURIComponent($('.key2').val() ? $('.key2').val() : '');
            searchModel.searchType1 = 'createdDate';
            searchModel.searchType2 = this.selBox[0].getValue() ? this.selBox[0].getValue().value : $('.searchType2').val();
            searchModel.status = $('.search-status .status .cur').data('value')
            searchModel.p = 1;
            if (tools.pageHelper.urlContext()['pagesize'])
                searchModel.pageSize = tools.pageHelper.urlContext()['pagesize']
            window.location.href = `/customer/examList/list?${fo.toPostString(searchModel)}`;
        }).on('click', '.item .btn.copy', (e) => { //复制试卷
            let $el = $(e.target)
            if (!this.context) {
                return cui.popTips.warn('网络错误！');
            } else {
                let $this = $(e.currentTarget);
                let pName = $this.closest('.item').find('.proname span').text();
                let sysTime = `[${moment(new Date()).format('YYYY/MM/DD HH:mm:ss')}]`;
                let paperctName = pName.substr(0,100-sysTime.length) + sysTime

                this.handleCopy(paperctName);

                $('.copyProject .cui-textBoxContainer input').blur((ev) => {
                    this.blurChecked = true;
                    let name = ev.currentTarget.value;
                    if (name != '') {
                        session.customer().then((r) => {
                            return examListDao.checkPaperNameUnique({
                                accessToken: r.accessToken,
                                newName: name,
                                paperId: $this.closest('.item').attr('id')
                            })
                        }).then((r) => {
                            if (r.code == 28007004) {
                                $(ev.currentTarget).addClass('fail')
                                new WarnTip($(ev.currentTarget).parent(), '试卷名称已存在', {
                                    left: 230,
                                    top: 50,
                                    'z-index': 10000
                                })
                            }
                            else {
                              this.blurChecked = false;
                              $(ev.currentTarget).removeClass('fail')
                            }
                        })
                    }
                })
                $('.copyProject').on('keyup', '.cui-textBoxContainer input', (e) => {
                    let $this = $(e.currentTarget);
                    if ($this.val().length >= 100) {
                        cui.popTips.warn('试卷名称长度不能超过100位')
                    }
                }).on('click', '.confirm', (e) => {
                    setTimeout(() => {
                        if (!this.blurChecked) {
                            let opts = {
                                accessToken: this.context.accessToken,
                                newName: this.copyTxtBox[0].getValue(),
                                paperId: $this.closest('.item').attr('id'),
                                paperUnicode: $el.parents('.item').data('unicode')
                            }
                            examListDao.copyPaper(opts).then((res) => {
                                if (res && res.code == 0) {
                                    new SuccessTip('复制成功', '', true);
                                } else {
                                    return cui.popTips.error(res.message)
                                }
                            })
                        }
                    }, 100)
                })
            }
        }).on('click', '.item .btn.export', (e) => { //导出试卷
            let $this = $(e.currentTarget);
            let opts = {
                paperId: $this.closest('.item').attr('id'),
                accessToken: this.context.accessToken
            }
            examListDao.checkExportPaperStatus($this.closest('.item').data('unicode'), opts.accessToken).then((r) => {
                if (r.code == 0) {
                    return examListDao.exportPaper(opts);
                } else {
                    cui.popTips.error(r.message);
                }
            }).catch((err) => {
                cui.popTips.error('服务器繁忙，请稍后重试');
                console.log(err);
            })

        }).on('click', '.item .btn.del', (e) => { //删除试卷
            let $this = $(e.currentTarget);
            let opts = {
                paperId: $this.closest('.item').attr('id'),
                accessToken: this.context.accessToken
            }
            let fn = () => {
                examListDao.deletePaper(opts).then((res) => {
                    if (res && res.code == 0) {
                        let del = () => {
                            $this.closest('.item').remove();
                        }
                        new SuccessTip('删除成功', del, true, 1000);
                    } else {
                        return cui.popTips.error(res.message)
                    }
                })
            }
            new DeleteTip(fn, {
                isAuto: false
            });
        }).on('click', '.addonRight', () => {
            $('input[name=createdDate]').focus().blur();
        }).on('click', '.search-ent .addonRight', (e) => {
            $(e.currentTarget).siblings('input').focus();
        });

        this.handleSlide(); //状态切换
    }
    handleSlide() {
        //状态切换
        for (let v of this.slideList) {
            v.$el.on('click', (e) => {
                if ($(e.currentTarget).data('mode') == 1) {
                    return cui.popTips.warn('请先完成试卷的所有设置');
                }
                if (!this.context) return cui.popTips.error('网络出错')
                examListDao.changeStatus({
                    paperId: v.$el.closest('.item').attr('id'),
                    accessToken: this.context.accessToken,
                    status: !v.get()
                }).then((res) => {
                    if (res && res.code == 0) {
                        v.toggleClass()
                    } else {
                        cui.popTips.error(res.message)
                    }

                }, () => {
                    cui.popTips.error('请稍后重试')
                })
            })
        }


    }
    handleCopy(paperName) {
        let tplHtml = $(juicer(this.copyTpl(paperName)).render()),
            tmpHeader = $(`<span>复制试卷</span>`),
            modalPanel = new cui.Panel(tmpHeader, $(tplHtml)),
            modalBrocken = new cui.Brocken();

        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
        modalPanel.getPanel().css({
            width: '610px'
        });
        this.modal.open();
        this.modal.$container.find('input[name=newPaperName]').val(paperName);
        this.copyTxtBox = Array.from($('.copyProject .cui-textBoxContainer'), (v) => new cui.TextBox($(v)));
        this.modal.on('modalClose', () => this.modal.$container.remove());
        $('.cancel').on('click', () => this.modal.$container.remove());
    }
    copyTpl(paperName) {
        return `<div class='copyProject'>
                    <div class='project-name'>
                        <div class="cui-textBoxContainer" data-rule="required" data-tips="请输入新的试卷名称">
                            <span>请输入新的试卷名称：</span>
                            <input type="text" name='newPaperName' placeholder='请输入新的试卷名称' value="" maxlength="100"/>
                        </div>
                    </div>
                    <div class='oporation'>
                        <a class="cui-button preset-blue confirm">
                            <span>确定</span>
                        </a>
                        <a class="cui-button cancel">
                            <span>取消</span>
                        </a>
                    </div>
                </div>`
    }
}
let listIns = new ListDemo();
