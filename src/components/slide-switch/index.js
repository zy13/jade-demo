/*
 * @Author: sihui.cao
 * @Date:   2016-11-25 14:19:43
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-20T16:19:44+08:00
 */

'use strict';
import Events from 'events'
import SuccessTip from '../tips/successTip'
import './style.less'

class SlideSwitch extends Events {
    constructor(obj, cls = "active") {
        super();
        this.obj = obj;
        this.$el = $(obj);
        this.cls = cls;
        this.init()
    }
    init() {
        $(this.obj).on('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            // this.toggleClass()
        })
    }
    judge() {
        return !!this.obj.className.match(new RegExp('(\\s|^)' + this.cls + '(\\s|$)'));
    }

    set(status = true) {
        var self = this;
        if (!this.judge() && status) this.obj.className += " " + this.cls;
        if (this.judge() && !status) {
            let reg = new RegExp('(\\s|^)' + this.cls + '(\\s|$)');
            this.obj.className = this.obj.className.replace(reg, ' ');
        }
        self.emit('statusChange')
    }

    get() {
        return this.judge();
    }

    toggleClass(tip = true) {
        this.set(!this.judge())
        if (tip)
            new SuccessTip(this.get() ? '已启用' : '已禁用')
    }
}
//SlideSwitch.prototype.__proto__ = events.EventEmitter.prototype;

export default SlideSwitch
