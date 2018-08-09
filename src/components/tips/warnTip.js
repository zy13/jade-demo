/*
* @Author: sihui.cao
* @Date:   2016-11-28 15:05:33
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-11-29T16:32:42+08:00
*/

'use strict';

import './warnTip.less'

class WarnTip{
    constructor(obj,tip,style={},time=1200,noReplace=false){
        this.obj = obj
        this.tip = tip
        this.style = style
        this.time = time
        if(this.obj.find('.warnTips').length>0&&noReplace)
            return;
        this.init()
    }
    init(){
        let html=`<div class="warnTips" style="top: 39px;left:50%; max-width: 192px;display:block">
        <div class="valid-tips-arrow"></div><div class="valid-tips-inner">`+this.tip+`</div></div>`
        this.elem = $(html);
        this.elem.appendTo(this.obj).css(this.style);

        if(!(this.elem.css('left')=='0px')){
            let _width = this.elem.outerWidth()
            this.elem.css({
                'margin-left':-(_width/2)+'px'
            })
        }
        this.fadeOut();
    }
    fadeOut(){
        this.timer = setTimeout(()=>{
            this.elem.fadeOut(()=>{
                this.elem.remove()
            })
        },this.time)
    }
}

export default WarnTip
