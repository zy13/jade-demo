/*
 * @Author: zyuan
 * @Date:   2016-11-25 13:06:01
 * @Last Modified by:   zyuan
 * @Last Modified time: 2017-02-21 16:32:06
 */

'use strict';

import './layout.less'

$(() => {
    $('.ex-more').on('mouseover',()=>{
        $('.online-detail').removeClass('displayn');
    }).on('mouseout',()=>{
        $('.online-detail').addClass('displayn');
    })
})
