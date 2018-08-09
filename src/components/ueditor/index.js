/**
 * @Author: Jet.Chan
 * @Date:   2016-11-29T13:30:00+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-11-30T12:08:23+08:00
 */


//服务器资源路径
window.UEDITOR_HOME_URL = '/ueditor/';

const appConfig = AppConfig || {};
// if (process.env.NODE_ENV == 'production' && appConfig.static.staticDomain.includes('cdn')) {
window.UEDITOR_HOME_URL = `${location.hostname}/ueditor`
// }
//上传地址
window.UEDITOR_HOME_SERVERURL = appConfig.static.euditorServerUrl || '';


((ue) => {
    if (ue) {
        ue.registerUI("autosave", function(a) {
            if (a.options.enableAutoSave) {
                var b = null,
                    c = null;
            }
        })
    }
})(UE);
