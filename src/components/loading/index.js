/*
 * @Author: sihui.cao
 * @Date:   2016-12-07 15:54:34
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-02-16T14:36:25+08:00
 */

'use strict';
import './style.less'

const loading = {
    open(isM) {
        if (isM) {
            $(`<div class="loading loadingM">
                        <img src="/images/loadingM.gif">
            </div>`).appendTo($('body'));
        } else {
            $(`<div class="loading">
                        <div class="loading-wrap"></div>
                        <div class="load-img">
                            <img src="/images/loading.gif"></div>
            </div>`).appendTo($('body'));
        }
    },
    close() {
        $('body>.loading').remove()
    }
}
export default loading;
