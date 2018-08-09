/*
 * @Author: zyuan
 * @Date:   2016-11-25 10:07:50
 * @Last Modified by:   sihui.cao
 * @Last Modified time: 2017-03-01 14:45:08
 */

'use strict';

import './header.less'
import session from '../../dao/sessionContext'
import cui from 'c-ui'
import dao from '../../dao/user/login'

$(() => {

    //考官界面-修改密码
    $('body #ex-header-out').on('mouseover','.ul ul',(e)=>{
        let $this = $(e.currentTarget);
        $($this).find('.change-psw,.person_info').removeClass('dis');
    }).on('mouseout', '.ul ul', (e) => {
        let $this = $(e.currentTarget);
        $($this).find('.change-psw,.person_info').addClass('dis');
    });

    //退出
    $('.special-wrap #ex-header-out').on('click', '.ul .logout', (e) => {
        let $this = $(e.currentTarget);

        if($this.data('type')==0){  //考官
            session.customer().then((res) => {
                dao.logout(res.accessToken).then((r)=>{
                    if(r && r.code==0){
                        $.ajax({
                            type: 'post',
                            url: '/customer/session/logout',
                            data: {
                                accessToken: res.accessToken
                            }
                        }).done((res) => {
                            if (res && res.status) {
                                window.location.href = '/customer/login'
                            } else {
                                return cui.popTips.warn(res.message)
                            }
                        })
                    }
                })
            })
        }
        if($this.data('type')==1){ //考生
            session.user().then((res) => {
                dao.logout(res.accessToken).then((r)=>{
                    if(r && r.code==0){
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
        }

    });
})
