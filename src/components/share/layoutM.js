/*
 * @Author: zyuan
 * @Date:   2017-01-05 14:57:10
 * @Last Modified by:   zyuan
 * @Last Modified time: 2017-03-14 09:39:07
 */

'use strict';

import '../hfCommon/layoutM.less'
import 'c-ui/assets/style.css'
import session from '../../dao/sessionContext'
import dao from '../../dao/user/login'

class HeadeDemo {
    constructor() {
        this.init();
    }
    init() {
        $('body').on('click', '.exam-header .exam-hellip', (e) => {
            if(!$('body').find('div').is('.header-more')){
                $('body').append(this.handleHtml()).on('click','.header-more',(e)=>{
                    if($(e.target)!=$('.a-group')){
                        $('body').find('.header-more').remove();
                    }
                })
            }else{
                $('body').find('.header-more').remove();
            }
        }).on('click', '.header-more .back', () => { //退出
            session.user().then((res) => {
                dao.logout(res.accessToken).then((r) => {
                    if (r && r.code == 0) {
                        $.ajax({
                            type: 'post',
                            url: '/exam/session/logout',
                            data: {
                                accessToken: res.accessToken
                            }
                        }).done((res) => {
                            if (res && res.status) {
                                window.location.href = '/exam/login'
                            } else {
                                return cui.popTips.warn(res.message)
                            }
                        })
                    }
                })
            })
        });

        this.autoFooter();
    }
    autoFooter() {
        let headerH = $('.exam-header').height() ? $('.exam-header').height() : 0;
        let winHeight = $(window).height();
        let contHeight = headerH + $('.exam-content').height() + $('.exam-footer').height() + 81;

        if (contHeight > winHeight) {
            $('.exam-footer').removeClass('abs').addClass('rel');
        } else {
            $('.exam-footer').addClass('abs').removeClass('rel');
        }

        if ($('.exam-footer').is('.abs')) {
            $('body').on('focus', 'input', () => {
                $('.exam-footer').hide();
            }).on('blur', 'input', () => {
                $('.exam-footer').show();
            })
        }
    }
    handleHtml(){
        return `<div class='header-more'>
                    <div class='a-group'>
                        <a class='edit-userInfo' href='/exam/userInfo?isEditUserInfo=true'>
                            <span>修改个人信息</span>
                        </a>
                        <a class='edit-psw' href='/exam/resetPassword'>
                            <span>修改密码</span>
                        </a>
                        <a class='back' href='javascript:void(0)'>
                            <span>退出</span>
                        </a>
                    </div>
                </div>`
    }
}

$(() => {
    let headerIns = new HeadeDemo();

    if (window.location.pathname == '/exam/login') {
        window.history.pushState('forward', null, '/exam/login');
    }
    //浏览器自带回退键
    $(window).on('popstate', function() {
        /*if (window.location.pathname == '/exam/paper' || window.location.pathname == '/exam/paper/finish') {
            window.history.pushState('forward', null, '/exam/taskList');
            window.location.reload();
        }*/
        if (window.location.pathname == '/exam/login') {
            window.history.pushState('forward', null, '/exam/login');
            window.location.reload();
        }
    });
})
