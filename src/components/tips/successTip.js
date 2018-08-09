/*
 * @Author: zyuan
 * @Date:   2016-11-30 16:06:49
 * @Last Modified by:   zyuan
 * @Last Modified time: 2017-02-08 19:17:51
 */

'use strict';

import $ from 'jquery'
import cui from 'c-ui'

class Success {
    constructor(tipContent, doSth, isUpdate, time) {
        this.isUpdate = isUpdate || false;
        this.tipContent = tipContent;
        this.doSth = doSth;
        this.time = time!=undefined ? time: 2000;
        this.show()
    }
    show() {
        let self = this;
        cui.popTips.success(this.tipContent,1000);
        $('.cui-popTips-con').css({
            backgroundColor: '#000',
            opacity: '0.75',
            fontSize: '15px'
        });
        $('.success').css({
            zIndex: 9999
        })
        setTimeout(() => {
            if(self.doSth)
                self.doSth();
            if(this.isUpdate){
                window.location.reload();
            }

        }, self.time)
    }
}

export default Success
