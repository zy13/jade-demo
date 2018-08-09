/**
 * @Author: Jet.Chan
 * @Date:   2016-11-29T11:17:35+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-10T11:20:42+08:00
 */



import $ from 'jquery'
import cui from 'c-ui'
import 'c-ui/assets/style.css'
import dao from '../../dao/user/login'
import session from '../../dao/sessionContext'
import store from 'store2'
import juicer from 'juicer'
// import 'babel-polyfill'

import '../../components/hfCommon/layout'
import '../../components/hfCommon/header'
import '../../components/hfCommon/footer'
// import '../../components/share/hfCommon'
import './index.less'

let store_iframe_url_key = 'iframe_lastOptionUrl_key';


$(() => {

    // $('#ex-iframe').on('load', () => {
    //     $(window.frames["ex-iframe"]).contents().find("body").css('height', 'auto');
    // })

    let lastURL = store.get(store_iframe_url_key),
        ifmTargetUrl = $('#ifmTargetUrl').val();
        // console.log($('#ifmTargetUrl'));
        // console.log('lastURL',lastURL);
    if (lastURL) {
        $('iframe[name=ifmContent]').attr('src', lastURL);
        if (lastURL.indexOf('/examList/') > -1) {
            $('.ex-content-detail ul li.cur').removeClass('cur').next().addClass('cur');
        }
    } else {
      // console.log('ifmTargetUrl',ifmTargetUrl);
        if (ifmTargetUrl)
            $('iframe[name=ifmContent]').attr('src', ifmTargetUrl);
        else
            $('iframe[name=ifmContent]').attr('src', '/customer/admin/group');//都没有权限则显示管理员tab中的分组列表
            //$('iframe[name=ifmContent]').attr('src', '/customer/projectList/index');//没有权限显示/customer/projectList/index列表会报错

    }


    let ifm = document.getElementById('ex-iframe'),
        ifmOnload = (e) => {
            document.title = ifm.contentWindow.document.title
            $(ifm.contentWindow.document).find("body").css('height', 'auto');

            let lastOptionUrl = $('iframe[name=ifmContent]')[0].contentWindow.location.href,
                store_lastOptionUrl = store.get(store_iframe_url_key);

            if (store_lastOptionUrl && store_lastOptionUrl == lastOptionUrl) return;

            if (lastOptionUrl) {
                store.set(store_iframe_url_key, lastOptionUrl);
            }

        };

    if (ifm.attachEvent) {
        ifm.attachEvent("onload", ifmOnload);
    } else {
        ifm.onload = ifmOnload;
    }

    $('.ex-content-detail ul>li>a').click((eve) => {
        let $this = $(eve.currentTarget);
        $this.parent().addClass('cur').siblings().removeClass('cur');
        $('iframe[name=ifmContent]').attr('src', $this.data('href'));
    });

    $('#ex-header .ex-content-rgt').on('click', '.logout', function() {
        session.customer().then((r) => {
            dao.logout(r.accessToken).then(function(res) {
                if (res && res.code == 0) {
                    $.ajax({
                        method: 'POST',
                        url: '/customer/session/logout',
                        dataType: 'json',
                        data: {
                            accessToken: r.accessToken
                        }
                    }).done(function(data) {
                        if (data.status) {
                            store.remove(store_iframe_url_key);
                            window.location.href = '/customer/user/login';
                        } else {
                            cui.popTips.error(data.message)
                        }
                    });
                }
            });
        })
    });

    let showTip = () => { //温馨提示
        session.customer().then((r) => {
            let data = {
                tip: r.tips,
                neverShow: store.get('neverShow') && store.get('neverShow') == `${r.companyId}${r.account}` ? true : false
            }
            if (r.read || data.neverShow || !r.tips) { //已经阅读过或者选择不再显示或者tip为空
                return;
            }

            let tpljuicer = juicer(require('./tpl/showTip.html'));
            let html = tpljuicer.render(data);

            let tmpHeader = $('<span>温馨提示</span>');
            let tmpContent = $(html);
            let modalPanel = new cui.Panel(tmpHeader, tmpContent);
            let modalBrocken = new cui.Brocken();
            let modal = new cui.Modal(modalBrocken.getBrocken(), modalPanel.getPanel());
            let checkBoxes = Array.from($('.warmTip .cui-checkboxContainer'), (v) => new cui.Checkbox($(v)))
            modal.$container.css({
                'z-index': 10001
            })
            modalPanel.getPanel().css({
                width: '500px',
                height: '300px'
            });
            modal.open();

            modal.$el.on('click', '.btns .sure', (e) => {
                $.ajax({
                    type: 'post',
                    url: '/customer/session/update',
                    data: {
                        accessToken: r.accessToken,
                        read: true
                    }
                }).done((res) => {
                    if (!res.status) {
                        return;
                    }

                    modal.request = true;
                    if ($(e.target).hasClass('sure') && checkBoxes.length > 0 && checkBoxes[0].getValue()) {
                        store.set('neverShow', `${r.companyId}${r.account}`)

                        //温馨提示到使用统计中查阅
                        let countConsultPanel = new cui.Panel(tmpHeader, $(tpljuicer.render({
                            neverShow: true
                        })));
                        let countConsultModal = new cui.Modal(new cui.Brocken().getBrocken(), countConsultPanel.getPanel());

                        countConsultPanel.getPanel().css({
                            width: '500px',
                            height: '300px'
                        })
                        countConsultModal.$el.on('click', '.btns .sure,.cancle', () => {
                            countConsultModal.close()
                        })
                        countConsultModal.open()

                    }
                    modal.close()
                })
            }).on('click', '.btns .cancle', () => {
                modal.close()
            })

            modal.on('modalClose', () => {
                if (!modal.request) {
                    $.ajax({
                        type: 'post',
                        url: '/customer/session/update',
                        data: {
                            accessToken: r.accessToken,
                            read: true
                        }
                    })
                }
            })


        })
    }

    showTip()
})
