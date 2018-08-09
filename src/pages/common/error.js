/*
 * @Author: zyuan
 * @Date:   2017-01-13 14:22:14
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-02T10:27:55+08:00
 */

'use strict';

import '../../components/share/layoutM'
import './error.less'

import $ from 'jquery'
import cui from 'c-ui'
import store from 'store2'
let store_iframe_url_key = 'iframe_lastOptionUrl_key';

class ErrorDemo {
    constructor() {
        this.init()
        if (store.get(store_iframe_url_key))
            store.remove(store_iframe_url_key);
    }
    init() {

    }
}

let logoutIns = new ErrorDemo()
