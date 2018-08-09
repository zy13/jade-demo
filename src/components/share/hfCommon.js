/*
 * @Author: zyuan
 * @Date:   2016-11-25 10:06:56
 * @Last modified by:   Jet.Chan
 * @Last modified time: 2016-12-05T11:33:06+08:00
 */

'use strict';

import 'c-ui/assets/style.css'
import 'c-ui'
import '../hfCommon/layout'
import '../hfCommon/header'
import '../hfCommon/footer'
import '../toTop/index'
import Pagination from '../pagination/index'

//设置footer定位
$(() => {
    let hgs = 0,
        winHei = 0;
    if ($('.special-wrap').length > 0) { //pc
        hgs = $('.special-wrap').height();
        winHei = $(window).height()
    } else if ($('#ex-header-out').next('.wrap').length > 0) { //考官
        hgs = $('#ex-header-out').next('.wrap').height();
        winHei = $(window).height()
    } else {
        hgs = $('.ex-content-right').height() + 70;
        winHei = $(window.parent.document).find('#ex-content').height();
    }
    if (hgs > winHei) {
        $('#ex-footer').removeClass('fixed');
    }
    $('#ex-footer').show()

    //浏览器自带回退键
    if (window.location.pathname == '/customer/login' || window.location.pathname == '/customer/user/login') {
        window.history.pushState('forward', null, '/customer/login');
    }
    $(window).on('popstate', function() {
        if (window.location.pathname == '/customer/login' || window.location.pathname == '/customer/user/login') {
            window.history.pushState('forward', null, '/customer/login');
            window.location.reload();
        }
    });
})
const hrCommon = {
    pagination: new Pagination()
}

export default hrCommon
