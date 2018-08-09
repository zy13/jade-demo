/*
* @Author: zyuan
* @Date:   2017-01-11 19:02:23
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-09T18:21:15+08:00
*/

'use strict';

import '../../components/share/layoutM'
import './taskList.less'

import $ from 'jquery'
import cui from 'c-ui'
import session from '../../dao/sessionContext'
import SuccessTip from '../../components/tips/successTip'
import moment from 'moment'
import cookie from 'cookie_js'
import {
    FormOptions
} from '../../components/share/tools';

const fo = new FormOptions();
class taskListDemo {
    constructor(){
        this.init();
    }
    init(){
        this.watch();
    }
    watch(){
        $('.div-item .div-project').on('click',(e)=>{
            let $this = $(e.currentTarget);

            $this.find('.shrink i').toggleClass('cpf-icon-extend cpf-icon-shrink');

            if($this.find('.shrink i').is('.cpf-icon-extend')){ //收缩
                $this.closest('.div-t').siblings('.div-b').addClass('dis');
                $this.siblings('.div-task').addClass('dis');
                $this.toggleClass('up all');
                this.autoFooter();
            }

            if($this.find('.shrink i').is('.cpf-icon-shrink')){ //展开
                $this.closest('.div-t').siblings('.div-b').removeClass('dis');
                $this.siblings('.div-task').removeClass('dis');
                $this.toggleClass('up all');
                this.autoFooter();
            }

        })
        $('.div-item .div-task').on('click',(e)=>{
            let $this = $(e.currentTarget);
            let isUpdate =  $this.find('.div-lr .data span').text()=='未开始' ? true : false;
            let searchModel = new Object();

            searchModel.taskId = $(e.currentTarget).data('taskid');
            searchModel.paperId = $(e.currentTarget).data('paperid');
            searchModel.seqNo = 1;
            searchModel.browserRequestTime = moment();

            if(cookie.cookie.get('browserCurrentTime')){
                cookie.cookie.set('browserCurrentTime','')
            }

            if($this.is('.no')) {
                new SuccessTip($this.find('.div-lr').data('tip'),'',isUpdate);
            }
            if($this.is('.yes')) {
                window.location.href = `/exam/paper?${fo.toPostString(searchModel)}`;
            }
        })
    }
    autoFooter() {
        let winHeight = $(window).height();
        let contHeight = $('.exam-header').height() + $('.exam-content').height() + $('.exam-footer').height()+81;

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
}


$(()=>{
    new taskListDemo();
})
