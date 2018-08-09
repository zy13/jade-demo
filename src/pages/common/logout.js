/*
 * @Author: zyuan
 * @Date:   2017-01-13 14:20:20
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-15T16:49:21+08:00
 */

'use strict';


import '../../components/share/layoutM'
import './logout.less'

import $ from 'jquery'
import cui from 'c-ui'
import session from '../../dao/sessionContext'
import store from 'store2'

class LogoutDemo {
    constructor() {
        this.init()
        if (store.get(store_iframe_url_key))
            store.remove(store_iframe_url_key);
    }
    init() {
        let countdown = parseInt($('.must-color').text(), 10);

        setInterval(() => {
            if (countdown > 0) {
                $('span.must-color').text(`${countdown--}`);
            } else {
                session.user().then((res)=>{
                    $.ajax({
                        type: 'post',
                        url: '/exam/session/logout',
                        data: {
                            accessToken: res.accessToken
                        }
                    }).done((res)=>{
                        if(res && res.status){
                            window.location.href='/exam/login'
                        }else{
                            return cui.popTips.warn(res.message)
                        }
                    })
                })
            }
        }, 1000);
    }
}

let logoutIns = new LogoutDemo()
