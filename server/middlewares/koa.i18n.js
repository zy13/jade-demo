/**
 * @Author: Jet.Chan
 * @Date:   2016-12-01T11:08:25+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2016-12-16T14:04:09+08:00
 */




import locale from "koa-locale";
import convert from "koa-convert";
import i18n from "koa-i18n";

//TODO: 注意事项，注册此国际化语言的中间件必须要在 路由注册前注册，否则参数获取不了

export default (app) => {
    locale(app);
    /*
       'query',                //  optional detect querystring - `/?locale=en-US`
       'subdomain',            //  optional detect subdomain   - `zh-CN.koajs.com`
       'cookie',               //  optional detect cookie      - `Cookie: locale=zh-TW`
    */
    app.use(convert(i18n(app, {
        directory: `config/locales`,
        locales: ['zh-cn', 'en', 'zh-tw'],
        modes: ['query', 'subdomain', 'cookie'],
        //query: true
    })));
}
