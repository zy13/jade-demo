/*
 * @Author: sihui.cao
 * @Date:   2016-11-28 16:17:28
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-19T11:28:12+08:00
 */

'use strict';
import cui from 'c-ui'
import WarnTip from '../tips/warnTip'
import _ from 'lodash'
import events from 'events'
import session from '../../dao/sessionContext'
import './style.less'
import {
    FormOptions
} from '../../components/share/tools';

const fo = new FormOptions();
class Pagination {
    constructor() {
        this.local = false;
        this.init();
    }
    init() {
        this.selectBoxes = Array.from($('.pagination .cui-selectBoxContainer'), (v) => new cui.SelectBox($(v)))
        this.textBoxes = Array.from($('.pagination .cui-textBoxContainer'), (v) => new cui.TextBox($(v)))
        this.watch();
    }
    urlParam(name, newVal, newUrl="") { //修改Url
        let search = newUrl?'?'+newUrl:window.location.search,
            reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"), //以 name 开头或者以 "&"+name 开头，中间是 "=" + 若干个非&的字符 ,后面是结尾 或者 以 "&"结尾
            r = search.substr(1).match(reg);
        if (r != null) {
            let oldVal = r[2];
            if (newVal) {
                return window.location.protocol + '//' + window.location.host + window.location.pathname + search.replace(name + "=" + oldVal, name + "=" + newVal); //一定要有属性名,为了避免修改了那些与这个值相同的其他参数
            } else {
                return unescape(oldVal)
            }
        } else {
            return window.location.protocol + '//' + window.location.host + window.location.pathname + (search != "" ? (search + '&' + name + '=' + newVal) : ('?' + name + '=' + newVal))
        }
    }
    watch() {
        let self = this;
        $('.pagination').on('click', '.search', () => { //点击确定按钮
                let p = $.trim($('.pagination .newpage').val()),
                    totalPage = parseInt($('.totalPage').html()),
                    jPi = parseInt(p || 1)
                if (p != '' && p <= totalPage && p > 0) {
                    if (this.local) {
                        self.sendRequest({
                            limit: self.selectBoxes[0].getValue() ? self.selectBoxes[0].getValue().text : self.selectBoxes[0].$el.find('.result').text(),
                            pageIndex: p
                        })
                    } else {
                        let jump = this.urlParam('p', p);
                        window.location.href = jump
                    }

                } else {
                    new WarnTip($('.pagination .cui-textBoxContainer'), '请输入正确页码', {
                        width: '85px',
                        left: '-32px'
                    })

                }
            })
            .on('keydown', '.newpage', (e) => { //限制输入框只能输入数字
                if (e.keyCode == 13) {
                    $('.pagination .search').trigger('click');
                }
                if (e.keyCode == 8 || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                    return true;
                }
                return false;
            })
            .on('keyup', '.newpage', (e) => { //限制中文和中文特殊字符
                let p = $('.pagination .newpage').val().replace(/[^u4e00-u9fa5w]/g, '');
                $('.pagination .newpage').val(p)
            })
            .on('click', '.cui-selectBoxContainer .cui-options li', (e) => { //每页显示数量
                var pagesize = self.selectBoxes[0].getValue() ? self.selectBoxes[0].getValue().text :
                    self.selectBoxes[0].$el.find('.result').text();
                if (self.local) {
                    self.sendRequest({
                        limit: pagesize,
                        pageIndex: 1
                    })
                } else {
                    let url = this.urlParam('pagesize',$(e.currentTarget).text())
                    url = this.urlParam('p',1,url.split('?')[1])
                    window.location.href = url
                }

            })
            .on('click', '.nor-button:not(.search)', (e) => {
                //是否异步刷新
                if (self.local) {
                    if (!$(e.target).hasClass('locked')) {
                        let limit = parseInt(self.selectBoxes[0].getValue() ? self.selectBoxes[0].getValue().text :
                            self.selectBoxes[0].$el.find('.result').text())
                        self.sendRequest({
                            limit: limit,
                            pageIndex: $(e.target).data('p')
                        })
                    }
                    e.preventDefault()
                }
            })
    }
    localRefresh(opts) {
        this.local = true;
        $('.pagination .nor-button').attr('href','javascript:void(0)')
        this.setting = {
            url: opts.url,
            data: opts.data
        }
    }
    sendRequest(_data) {
        let self = this;
        session.customer().then((res)=>{
            let data = _.extend(_data, self.setting.data)
            data.accessToken = res.accessToken;
            // console.log(data)
            self.setting.url(data).then((res) => {
                if (res.response) {
                    self.emit('refresh', res.response)
                    self.clear(res)
                } else {
                    cui.popTips.error('查询失败');
                }

            })
        })

    }
    clear(res) {
        var p = res.response.pageIndex
        var pageSize = parseInt(Math.ceil(res.response.total / res.response.limit)) || 100;
        $('.pagination .in-block:eq(1)').find('b:eq(0)').text(p).next().next().text(pageSize);
        if (p == 1) {

            $('.pagination .nor-button:lt(2)').addClass('locked')
        } else {
            $('.pagination .nor-button:lt(2)').removeClass('locked')
        }
        if (p == pageSize) {

            $('.pagination .nor-button:gt(1)').addClass('locked')
        } else {
            $('.pagination .nor-button:gt(1)').removeClass('locked')
        }


        //设置新的按钮页码数据
        if (p > 0 && p <= pageSize) {
            let $prevPageBtn = $('.pagination .nor-button:eq(1)'),
                $nextgeBtn = $('.pagination .nor-button:eq(2)');
            $prevPageBtn.data({
                p: p == 1 ? 1 : p - 1
            });
            $nextgeBtn.data({
                p: p == pageSize ? p : p + 1
            });
        }


        this.textBoxes[0].setValue('')
    }
    emit(event, data = {}) {
        this.eventList[event](data)
    }
    on(event, fn) {
        if (!this.eventList) {
            this.eventList = {}
        }
        this.eventList[event] = fn;
    }
}
//替换urlparam
//warntip
//遗漏回车键
//遗漏特殊字符
//渲染selectbox
export default Pagination
