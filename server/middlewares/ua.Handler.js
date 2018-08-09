/**
 * @Author: Jet.Chan
 * @Date:   2017-02-13T16:29:20+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-02-15T11:09:16+08:00
 */


import 'babel-polyfill';

let uaHandler = async(ctx) => {
    let ua = ctx.request.headers['user-agent'],
        $ = {};

    if (/mobile/i.test(ua))
        $.Mobile = true;

    if (/like Mac OS X/.test(ua)) {
        $.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
        $.iPhone = /iPhone/.test(ua);
        $.iPad = /iPad/.test(ua);
    }

    if (/Android/.test(ua)) {
        $.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];
    }

    if (/webOS\//.test(ua)) {
        $.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];
    }

    if (/(Intel|PPC) Mac OS X/.test(ua)) {
        $.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;
    }

    if (/Windows NT/.test(ua)) {
        $.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];
    }
    return ($.Mobile || $.iOS || $.iPhone || $.iPad || $.Android);
};

export default uaHandler;
