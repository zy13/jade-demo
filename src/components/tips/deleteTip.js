/*
 * @Author: zyuan
 * @Date:   2016-12-06 19:12:44
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-11T15:22:03+08:00
 */

'use strict';


import $ from 'jquery'
import cui from 'c-ui'
import './deleteTip.less'
import _ from 'lodash'

import SuccessTip from './successTip'

class Delete {
    constructor(fn, data = {}) {
        this.data = {
            title: data && data.title ? data.title : '提示',
            content: data && data.content ? data.content : '请确认是否删除！',
            tip: data && data.tip ? data.tip : '删除成功',
            isReload: data && data.isReload ? data.isReload : false,
            time: data && data.time ? data.time : null,
            isAuto: data.isAuto == undefined ? true : data.isAuto,
            cancel: data && data.cancel,
            style: data &&data.style ? data &&data.style :null,
            isAnotherFn: data && data.isAnotherFn ? data.isAnotherFn : false
        };
        this.$fn = fn || {};
        this.eventList = {}
        this.initModal();
        this.confirm();
        this.cancel();
    }
    initModal() {
        let tplHtml = `<div class='del'>
                            <p>${this.data.content}</p>
                            <p class='btn'>
                                <a class="cui-button preset-blue confirm">
                                    <span>确定</span>
                                </a>
                                <a class="cui-button cancel">
                                    <span>取消</span>
                                </a>
                            </p>
                        </div>`;
        let tmpHeader = $(`<span>${this.data.title}</span>`);
        let tmpContent = $(tplHtml);
        let modalPanel = new cui.Panel(tmpHeader, tmpContent);
        let modalBrocken = new cui.Brocken();


        this.modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());

        modalPanel.getPanel().css(this.data.style || {
            height: '250px',
            width: '550px'
        });

        this.modal.open();
        this.modal.on('modalClose', () => {
            this.modal.$container.remove()
        })
    }
    confirm() {
        this.modal.$el.on('click', '.confirm',() => {
            let fn = () => {
                if(!this.data.isAnotherFn){
                    this.modal.$container.remove()
                }
                if (this.$fn) {
                    this.$fn();
                }
            }
            if (this.data.isAuto) {
                new SuccessTip(this.data.tip, fn, this.data.isReload, this.data.time)
            } else {
                fn();
            }

            if (this.eventList.confirm)
                this.emit('confirm')
        })
    }
    cancel() {
        let self = this
        this.modal.$el.on('click', '.cancel',() => {
            if(self.data.cancel)
                self.data.cancel()
            this.modal.$container.remove()
        })
    }
    on(event, fn) {
        this.eventList[event] = fn;
    }
    emit(event) {
        this.eventList[event]();
    }

}

export default Delete
