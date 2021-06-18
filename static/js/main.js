define(function() {
    var InitCtrl = {};
    InitCtrl.init = function() {
        /**
         * 全局公共效果
         */
        //侧滑  呼出
        $(function() {
            'use strict';

            $("body").on('click', '.table-hover>tbody>tr', function() {
                var $this = $(this);
                $this.addClass("actived").siblings("tr").removeClass("actived");
            });

            // 下拉框, 选中值，并赋值
            $('body').on('click', '.dropdown .dropdown-menu li', function() {
                var $this = $(this),
                    $a = $this.find('a'),
                    $dropdown = $this.closest('.dropdown');

                $dropdown.find('button').val($a.attr('value'));
                $dropdown.find('.fenBie').text($a.text());
            });
            //篩選下拉框寬度
            $('body').on('click', '.dropdown', function() {
                var $this = $(this),
                    width = $this.width();
                $('.dropdown-menu').css({
                    'min-width': width
                })
            })

            //tips提示
            $('body').on('mouseover', '.help_icon', function() {
                var $t = $(this),
                    offtop = $t.offset().top,
                    offleft = $t.offset().left,
                    html = $t.attr('data-tips');
                    $('.help_tip').removeClass("noneWidth");
                $('.help_tip').css({
                    'top': offtop +($(window).width() - offleft <200?75:30),
                    'left': offleft +  ($(window).width() - offleft <200?-250:30),
                    'display': 'block'
                });
                if($t.hasClass("noneWidth")){
                    $('.help_tip').addClass("noneWidth");
                }
                $('.help_tip').html(html);
            }).on('mouseout',function(){
                $('.help_tip').hide();
            })
        });
        //下拉搜索阻止事件冒泡
        $('body').on('click', '.screen_search', function(e) {
            e.stopPropagation();
        });
        //下拉搜索输入框阻止事件冒泡
        $('body').on('click', '.input-search-input', function(e) {
            e.stopPropagation();
        });
        
        //鼠标移入添加滚动条
        $('body').off('mouseover.scroll').on('mouseover.scroll', '.popup_form_content', function() {
            var _this = $(this);
            if(_this.find('.popup_scroll').attr('isScroll') == 'true') {
                if(_this.attr('hasScroll') != 'true') {
                    creatDarg(_this[0]);
                    _this.attr('hasScroll', 'true');
                } else {
                    creatDarg(_this[0], 'ture');
                }
            }
        })
        
        //阻止滚轮事件冒泡
        $('body').on('click', '.discount', function(e) {
            $('.discount_lis')[0].onmousewheel = function(e) {
                e.stopPropagation();
            }
        })
//      //窗口改变弹窗高度变化
        $(window).resize(function() {
//          manualOnresize();
//          for(var i = 0; i < $('.layui-layer-content').length; i++) {
//              $('.layui-layer-content').eq(i).height($('.layui-layer-content').eq(i).find('.popup_').height());
//              $('.layui-layer-content').eq(i).height($('.layui-layer-content').eq(i).find('.shade_').height());
//          }
        })
    }
    return InitCtrl;
})