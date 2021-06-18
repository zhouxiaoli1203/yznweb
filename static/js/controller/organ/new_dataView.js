define(['laydate', 'echarts', 'Circles','mySelect', 'countup','remarkPop'], function(laydate, echarts,Circles) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout',function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var colors = [
//      [背景，数据]
            ['rgba( 221, 218, 244, 1)', '#5447C8'], ['rgba(255, 233, 204, 1)', '#FF8F00'], [ '#EFFAD7','#75A500'],[ '#DAE5F3','#467EC4'],
        ], circles = [];
        var orderName = "total",orderType = "desc";
        $scope.thisDisable = true;
        init();
        function init(){
             $scope.nameListThead = [{
                'name': '排名',
                'width': '10%',
                'align':'center'
            }, {
                'name': '校区名称',
                'width': '30%'
            }, {
                'name': '报课金额',
                'width': '20%',
                'issort': true,
                'id':'coursePrice'
            }, {
                'name': '学杂售卖',
                'width': '20%',
                'issort': true,
                'id':'goodsPrice'
            }, {
                'name': '合计',
                'width': '20%',
                'issort': true,
                'sort': 'desc',
                'id':'total',
                'align':'center'
            }];
            $scope.nav_datas = [];//nav图数据
            $scope.sale_data = [];//销售分析
            $scope.schoolData = [];
            $scope.classAffair = [];//教务分析
            $scope.financeData = [];//财务分析
            $scope._data = {
                _time: Thisweekdate($.format.date(yznDateAdd(new Date(),-7), "yyyy-MM-dd")),  //时间范围
            };
            $scope.TimeFrameEvent = TimeFrameEvent; //日期选择事件
            $scope.sortCllict = sortCllict;//点击校区业绩排序
            //时间筛选控件
            laydate.render({
                elem: '#sch_time_frame', //指定元素
                eventElem: '.sch_time_frame_text span',
                trigger: 'click',
                value: $.format.date(yznDateAdd(new Date(),-7), "yyyy-MM-dd"),
                max:Thisweekdate($.format.date(yznDateAdd(new Date(),-7), "yyyy-MM-dd")).split(" 到 ")[1],
                btns: [],
                done: function(value) {
                    $scope._data._time = Thisweekdate(value);
                    if($scope._data._time.split(" 到 ")[1]>=Thisweekdate($.format.date(yznDateAdd(new Date(),-7), "yyyy-MM-dd")).split(" 到 ")[1]){
                        $scope.thisDisable = true;
                    }else{
                        $scope.thisDisable = false;
                    }
                    getDataGail();
                }
            });
            getDataGail();
        }
        //日期时间选择事件
        function TimeFrameEvent(type) {
            
            var _t = '';
            switch(type) {
                case 1: //上周
                    $scope.thisDisable = false;
                    _t = yznDateAddWithFormat($('#sch_time_frame').val(), -7, "yyyy-MM-dd");
                    $('#sch_time_frame').val(_t);
                    $scope._data._time = Thisweekdate(_t);
                    break;
                case 2: //下周
                    if($scope.thisDisable){
                        return;
                    }
                    _t = yznDateAddWithFormat($('#sch_time_frame').val(), 7, "yyyy-MM-dd");
                    $('#sch_time_frame').val(_t);
                    $scope._data._time = Thisweekdate(_t);
                    if($scope._data._time.split(" 到 ")[1]>=Thisweekdate($.format.date(yznDateAdd(new Date(),-7), "yyyy-MM-dd")).split(" 到 ")[1]){
                        $scope.thisDisable = true;
                    }
                    break;
                case 3: //重置上周
                    $scope.thisDisable = true;
                    _t = $.format.date(yznDateAdd(new Date(),-7), "yyyy-MM-dd");
                    $('#sch_time_frame').val(_t);
                    $scope._data._time = Thisweekdate(_t);
                    break;
            };
            getDataGail();
        }
         function sortCllict(data){
             orderName = data.id;
             orderType = data.sort;
            $scope.dataGilInfo.shopWeekDataList =  getNewTable(orderName,orderType,$scope.dataGilInfo.shopWeekDataList);
             
        }
        function getDataGail(){
             $.hello({
                url: CONFIG.URL + "/api/org/statistics/dataGail",
                type: "get",
                data:{
                    'beginTime': $scope._data._time.split(' 到 ')[0],
                },
                success: function(data) {
                    if(data.status == "200"){
                        $scope.dataGilInfo = data.context;
                        $scope.nav_datas = [
                            {data:data.context.addPotentialCustomer,rate:data.context.addCustomerWeekRate},
                            {data:data.context.addNewContract ,rate:data.context.addNewContractWeekRate},
                            {data:data.context.namingCourseTimes ,rate:data.context.namingCourseWeekRate},
                            {data:data.context.allCoursePrice ,rate:data.context.allCoursePriceWeekRate},
                        ];
                        if(data.context.shopWeekDataList && data.context.shopWeekDataList.length>0){
                            angular.forEach(data.context.shopWeekDataList,function(v){
                                v.total = v.coursePrice + v.goodsPrice;
                            });
                            $scope.dataGilInfo.shopWeekDataList = getNewTable(orderName,orderType,data.context.shopWeekDataList);
                        }
//                      $scope.sale_data = [
//                          {name:"销售成单率",data:data.context.contractRate ,color:['#D3B6C6', '#4B253A']},
//                          {name:"试听到课率",data:data.context.auditionRate  ,color:['#FCE6A4', '#EFB917']},
//                          {name:"新生比",data:data.context.newContractRate  ,color:['#BEE3F7', '#45AEEA']},
//                          {name:"新报金额比",data:data.context.newCoursePriceRate  ,color:['#D3B6C6', '#4B253A']},
//                      ];
                        $timeout(function(){
                            for (var i = 1; i <=  4; i++) {
                                var child = $('#circles-' + i),
                                    percentage = child.attr("value");
                                circles.push(Circles.create({
                                    id:         child[0].id,
                                    value:      percentage,
                                    radius:     45,
                                    width:      10,
                                    colors:    colors[i-1] 
                                }));
                            }
                        });
                    }
                }
            })
        }
        
    }]
})