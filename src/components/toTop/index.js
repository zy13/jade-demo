/*
* @Author: sihui.cao
* @Date:   2017-01-07 16:10:23
* @Last Modified by:   sihui.cao
* @Last Modified time: 2017-02-14 10:30:00
*/

'use strict';
import './style.less'

$(()=>{
    var winWidth = $(window).width();
    let width = $('.ex-content-right').width()
    var offsetWidth = ((winWidth - 240) - width) / 2 - 60;
    var toTop = $('.go-to-top');
    toTop.on('click', function() {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var duaration = scrollTop % 100 == 0 ? scrollTop / 100 * 15 : (scrollTop / 100 + 1) * 15;
        //console.log(scrollTop,duaration);
        $('body,html').animate({
            scrollTop: '0px'
        }, duaration);
    });

    var toBottom = $('.go-to-bottom');
    toBottom.on('click', function() {
        let scroll = $('body').height() - $(window).height()
        var duaration = scroll % 100 == 0 ? scroll / 100 * 15 : (scroll / 100 + 1) * 15;

        $('body,html').animate({
            scrollTop: scroll+'px'
        }, duaration);
    });

    //页面中的位置
    // $('.go-to-top').css({
    //     right: 0 + 'px'
    // })

    // $(window).on('resize', function() {

    //     var wWidth = $(window).width();
    //     var width = (wWidth - 980) / 2 - 72;

    //     $('.cc-hang').css({
    //         right: width + 'px'
    //     })

    // });

    let hgs = 0 ,winHei = 0;
    if($('.special-wrap').length>0){
        hgs = $('.special-wrap').height();
        winHei = $(window).height()
    }else if($('#ex-header-out').next('.wrap').length>0){
        hgs = $('#ex-header-out').next('.wrap').height();
        winHei = $(window).height()
    }else{
        hgs = $('.ex-content-right').height();
        winHei = $(window.parent.document).find('#ex-content').height();
    }
    if (hgs > winHei) {
        $('.go-to-bottom').show();
    }

    //控制右边浮动
    $(window).on('scroll', function() {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var height = ($(window).height()) / 3;
        //console.log(scrollTop,height);
        if (height < scrollTop) {
            $('.go-to-top').show()
        } else {
            $('.go-to-top').fadeOut();
        }
    })
})
