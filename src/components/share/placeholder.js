/**
 * @Author: Jet.Chan
 * @Date:   2017-03-07T19:37:33+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-03-08T10:36:59+08:00
 */

import $ from 'jquery';

//placeholder兼容性
let attr = 'placeholder',
    nativeSupported = attr in document.createElement('input');
$.fn.placeholderPlugin = function(options) {
    return this.each(function() {
        let $input = $(this)

        if (typeof options === 'string') {
            options = {
                text: options
            }
        }

        let opt = $.extend({
            text: '',
            style: {},
            namespace: 'placeholder',
            useNative: true,
            hideOnFocus: true
        }, options || {})

        if (!opt.text) {
            opt.text = $input.attr(attr)
        }

        if (!opt.useNative) {
            $input.removeAttr(attr)
        } else if (nativeSupported) {
            // 仅改变文本
            $input.attr(attr, opt.text)
            return
        }

        let width = $input.width(),
            height = $input.height()
        let box_style = ['marginTop', 'marginLeft', 'paddingTop', 'paddingLeft', 'paddingRight', 'height', 'line-height']

        let show = function() {
            $layer.show()
        }
        let hide = function() {
            $layer.hide()
        }
        let is_empty = function() {
            return !$input.val()
        }
        let check = function() {
            is_empty() ? show() : hide()
        }

        let position = function() {
            let pos = $input.position()
            if (!opt.hideOnFocus) {
                // 按鍵隱藏的情况，需要移動光標两像素
                pos.left += 2
            }
            $layer.css(pos)
            $.each(box_style, function(i, name) {
                $layer.css(name, $input.css(name))
            })
        }

        let layer_style = {
            color: 'gray',
            cursor: 'text',
            textAlign: 'left',
            position: 'absolute',
            fontSize: $input.css('fontSize'),
            fontFamily: $input.css('fontFamily'),
            display: is_empty() ? 'block' : 'none'
        }

        // create
        let layer_props = {
            text: opt.text,
            width: width,
            height: 'auto'
        }

        // 确保只绑定一次
        let ns = '.' + opt.namespace,
            $layer = $input.data('layer' + ns)
        if (!$layer) {
            $input.data('layer' + ns, $layer = $('<div>', layer_props).appendTo($input.parent()))
        }

        // activate
        $layer
            .css($.extend(layer_style, opt.style))
            .unbind('click' + ns)
            .bind('click' + ns, function() {
                opt.hideOnFocus && hide()
                $input.focus()
            })

        $input
            .unbind(ns)
            .bind('blur' + ns, check)

        if (opt.hideOnFocus) {
            $input.bind('focus' + ns, hide)
        } else {
            $input.bind('keypress keydown' + ns, function(e) {
                    let key = e.keyCode
                    if (e.charCode || (key >= 65 && key <= 90)) {
                        hide()
                    }
                })
                .bind('keyup' + ns, check)
        }

        // 由于 ie 记住密码的特性，需要监听值改变
        // ie9 不支持 jq bind 此事件
        $input.get(0).onpropertychange = check

        position()
        check()
    })
}

export default () => {
    $('input[placeholder]').placeholderPlugin({
        useNative: true,
        hideOnFocus: false,
        style: {
            textShadow: 'none'
        }
    })
}
