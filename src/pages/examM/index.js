/*
 * @Author: zyuan
 * @Date:   2017-01-19 09:56:15
 * @Last Modified by:   zyuan
 * @Last Modified time: 2017-02-09 15:41:35
 */

'use strict';

import '../../components/share/layoutM'
import './index.less'

import $ from 'jquery'
import cui from 'c-ui'
import loading from '../../components/loading'

class IndexDemo {
    constructor() {
        this.init();
    }
    init() {
        this.start();
    }
    start() {
        let count = 3;

        $('body').on('click', '.jump', () => {
            window.location.href = '/exam/login';
        });

        setInterval(() => {
            if (count > 1) {
                $('.loadingM .jump span').text(`${--count}秒`);
            } else {
                window.location.href='/exam/login';
            }
        }, 1000)
    }
}

$(() => {
    loading.open(true);
    setTimeout(() => {
        loading.close();
        $('.loadingM').css({
            display: 'block'
        });
    }, 300);
    let indexIns = new IndexDemo();
})
