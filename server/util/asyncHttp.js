/*
 * @Author: dser.wei
 * @Date:   2016-06-29 17:04:48
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-11-16T12:03:52+08:00
 */

'use strict';

import q from "q"

const asyncHttp = {
    async when(promises) {
        const r = await q.allSettled(promises),
            resList = []

        r.forEach((item) => {
            if (item.state == 'fulfilled') {
                resList.push(item.value);
            } else {
                resList.push(null);
            }
        })

        return resList;
    }
}
export default asyncHttp
