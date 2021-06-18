define(['laydate','oldCalendar'], function(laydate) {
    creatPopup({
        el: 'viewPend',
        openPopupFn: 'view_pend',
        htmlUrl: './templates/popup/view_pend.html',
        controllerFn: function($scope, props) {
            var myPendCalendar = new SimpleCalendar('#pendContainer'); //载入日历控件
        }
    });
});