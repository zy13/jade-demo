/*
* @Author: zyuan
* @Date:   2016-12-19 11:05:08
* @Last Modified by:   zyuan
* @Last Modified time: 2016-12-19 11:09:40
*/

'use strict';

import http from '../../util/http';

const setGlobalAccountDao = {

    async setGlobalAccount(accessToken) {

        if (!accessToken) {
            return new Promise().reject('err:param error');
        }

        return http.get('/osexamer/examers',{accessToken})
    }


}

export default setGlobalAccountDao
