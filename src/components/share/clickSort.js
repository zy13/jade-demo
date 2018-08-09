/**
 * @Author: Jet.Chan
 * @Date:   2016-12-26T14:08:46+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-13T10:42:01+08:00
 */



(function($) {
    $.fn.clickSort = function(opts) {
        let defaults = {
            speed: 200, //移动速度,
            beforeFunc: undefined
        }
        let option = $.extend(defaults, opts);
        this.each(function() {
            let _this = $(this),
                isMove = false;

            _this.on('click', '.moveup', function(e) {

                if (isMove) {
                    return;
                } else {
                    isMove = true;
                }
                if (defaults.beforeFunc && !defaults.beforeFunc(e)){
                    isMove = false;
                    return;
                }
                let parent = $(this).parents('.sortableitem');
                let prevItem = parent.prev('.sortableitem');
                if (prevItem.length == 0) {
                    isMove = false;
                    return;
                }
                let parentTop = parent.position().top;
                let prevItemTop = prevItem.position().top;
                parent.css('visibility', 'hidden');
                prevItem.css('visibility', 'hidden');
                parent.clone().insertAfter(parent).css({
                    position: 'absolute',
                    visibility: 'visible',
                    top: parentTop,
                    width: $(parent).width()
                }).animate({
                    top: prevItemTop
                }, option.speed, function() {
                    $(this).remove();
                    parent.insertBefore(prevItem).css('visibility', 'visible');
                    isMove = false;
                    if (option.callback) option.callback(parent, prevItem);
                });
                let targetTop = parent.height() + parentTop - prevItem.height();
                prevItem.clone().insertAfter(prevItem).css({
                    position: 'absolute',
                    visibility: 'visible',
                    top: prevItemTop,
                    width: $(prevItem).width()
                }).animate({
                    top: targetTop
                }, option.speed, function() {
                    $(this).remove();
                    prevItem.css('visibility', 'visible');
                    if(defaults.afterFunc)
                        defaults.afterFunc()
                });
            });
            _this.on('click', '.movedown', function(e) {
                if (isMove) {
                    return;
                } else {
                    isMove = true;
                }
                if (defaults.beforeFunc && !defaults.beforeFunc(e)){
                    isMove = false;
                    return;
                }
                let parent = $(this).parents('.sortableitem');
                let nextItem = parent.next('.sortableitem');
                if (nextItem.length == 0) {
                    isMove = false;
                    return;
                }
                let parentTop = parent.position().top;
                let nextItemTop = nextItem.position().top;
                parent.css('visibility', 'hidden');
                nextItem.css('visibility', 'hidden');
                let targetTop = nextItemTop + nextItem.height() - parent.height();
                parent.clone().insertAfter(parent).css({
                    position: 'absolute',
                    visibility: 'visible',
                    top: parentTop,
                    width: $(parent).width()
                }).animate({
                    top: targetTop
                }, option.speed, function() {
                    $(this).remove();
                    parent.insertAfter(nextItem).css('visibility', 'visible');
                    isMove = false;
                    if (option.callback) option.callback();
                });
                nextItem.clone().insertAfter(nextItem).css({
                    position: 'absolute',
                    visibility: 'visible',
                    top: nextItemTop,
                    width: $(nextItem).width()
                }).animate({
                    top: parentTop
                }, option.speed, function() {
                    $(this).remove();
                    nextItem.css('visibility', 'visible');
                    if(defaults.afterFunc)
                        defaults.afterFunc()
                });
            });

        });
    }
})($)
