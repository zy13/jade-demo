/*
 * @Author: sihui.cao
 * @Date:   2017-01-06 14:21:12
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-07T16:24:23+08:00
 */

'use strict';
import './notFound.less'

import store from 'store2'
let store_iframe_url_key = 'iframe_lastOptionUrl_key';

$(() => {
    if (store.get(store_iframe_url_key))
        store.remove(store_iframe_url_key);
})
