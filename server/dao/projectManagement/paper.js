/*
* @Author: sihui.cao
* @Date:   2016-12-09 19:12:55
* @Last Modified by:   sihui.cao
* @Last Modified time: 2016-12-12 19:53:25
*/

'use strict';

import http from '../../util/http';

const paperDao = {


    async getPapers(accessToken) {

        if (!accessToken) {
            return new Promise().reject('err:param error');
        }

        return http.post('/ospaper/question/papers',{accessToken})
    }


}

export default paperDao
