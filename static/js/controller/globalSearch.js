define(['potential_pop','classPop','coursePop'], function () {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function ($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var data_ = $stateParams.screenValue.params;
        $scope.currentVal = $stateParams.screenValue.val;
        init();
        function init() {
            if ($stateParams.screenValue) {
                $scope.searchParams_ = {
                    levels: data_.levels,
                    studentCenterList: data_.studentCenterList,
                    potentialCustomerList: data_.potentialCustomerList,
                    classInfoList: data_.classInfoList,
                    courseList: data_.courseList
                }
            } else {
                $scope.searchParams_ = {
                    levels : [],
                    studentCenterList: [],
                    potentialCustomerList : [],
                    classInfoList : [],
                    courseList : []
                }
            }

            $scope.searchContent = [...$scope.searchParams_.levels, ...$scope.searchParams_.studentCenterList, ...$scope.searchParams_.potentialCustomerList, ...$scope.searchParams_.classInfoList, ...$scope.searchParams_.courseList];
            /**pop对象中
             * myself:true，页面中的私有弹框，false公用弹框
             * direct公用弹框的组件名
             * param公用弹框需要传的参数
             * pageTab若一个页面中没有用路由切换tab则需要该参数判断tabd的值
             * title:私有弹框名称
             */
            var studentDrop = [
                {name:"缺席补课",sref:"edu_leave/makeup",authId:[45,46],needSearch:true},
                { name: "学员订单", sref: "edu_student", authId: "28", pop: { myself:false,el: 'pot-pop', id: 'potential_pop',width: '1060px', param: { 'page': 1, 'fromPage': 'studentPop', 'item': {},'tab':6}}},
                { name: "充值/退款", sref: "edu_student", authId: "30", pop: { myself:false,el: 'pot-pop', id: 'potential_pop', width: '1060px',param: { 'page': 1, 'fromPage': 'studentPop', 'item': {},'tab':1}}},
                { name: "学员请假", sref: "edu_leave", authId: "44",needSearch:true, pop: {myself:true,pop:"请假"}},
                {name:"学员休课",sref: "edu_student", authId: "30", pop: { myself:false,el: 'pot-pop', id: 'potential_pop',width: '1060px', param: { 'page': 1, 'fromPage': 'studentPop', 'item': {},'tab':4}}},
                {name:"学员相册",sref:"edu_student",authId:"28" ,pop: { myself:false,el: 'pot-pop', id: 'potential_pop',width: '1060px', param: { 'page': 1, 'fromPage': 'studentPop', 'item': {},'tab':8}}},
                {name:"转课",sref: "edu_student", authId: "30", pop: { myself:false,el: 'pot-pop', id: 'potential_pop',width: '1060px', param: { 'page': 1, 'fromPage': 'studentPop', 'item': {},'tab':4}}},
                {name:"退课",sref: "edu_student", authId: "30", pop: { myself:false,el: 'pot-pop', id: 'potential_pop',width: '1060px', param: { 'page': 1, 'fromPage': 'studentPop', 'item': {},'tab':4}}},
                {name:"结课",sref: "edu_student", authId: "30", pop: { myself:false,el: 'pot-pop', id: 'potential_pop',width: '1060px', param: { 'page': 1, 'fromPage': 'studentPop', 'item': {},'tab':4}}},
            ];
            var potailDrop = [
                {name:"充值/退款",sref: "potial_customer", authId: "14", pop: { myself:false,el: 'pot-pop', id: 'potential_pop',width: '1060px', param: { 'page': 0, 'fromPage': 'studentPop', 'item': {},'tab':1}}},
                {name:"预约来访",sref: "potial_customer", authId: "14", pop: { myself:false,el: 'pot-pop', id: 'potential_pop',width: '1060px', param: { 'page': 0, 'fromPage': 'studentPop', 'item': {},'tab':2}}},
                {name:"学员订单",sref: "potial_customer", authId: "12", pop: { myself:false,el: 'pot-pop', id: 'potential_pop',width: '1060px', param: { 'page': 0, 'fromPage': 'studentPop', 'item': {},'tab':6}}},
            ];
            var classDrop = [
                { name: "排课变更", sref: "edu_class", authId: "37", pop: { myself: false, el: "class-pop", id: "class_pop", width: '1060px', param: { 'location': "outside", 'item': {},'tab':2}}},
                { name: "班级课表", sref: "edu_class", authId: "32", pop: { myself: false, el: "class-pop", id: "class_pop", width: '1060px', param: { 'location': "outside", 'item': {},'tab':2}}},
                { name: "上课记录", sref: "edu_class", authId: "32", pop: { myself: false, el: "class-pop", id: "class_pop", width: '1060px', param: { 'location': "outside", 'item': {},'tab':2,'level2':2}}},
                {name:"缺席补课",sref:"edu_leave/makeup",authId:[45,46],needSearch:true},
                {name:"课堂展示",sref:"edu_classAffair/show",authId:"77",needSearch:true},
                {name:"课堂点评",sref:"edu_classAffair/comment",authId:"77",needSearch:true},
                {name:"课后作业",sref:"edu_classAffair/houseWk",authId:"77",needSearch:true},
                {name:"班级相册",sref:"edu_class",authId:"32",pop: { myself: false, el: "class-pop", id: "class_pop", width: '1060px', param: { 'location': "outside", 'item': {},'tab':4}}},
                {name:"升班",sref:"edu_class",authId:"34",pop: { myself: false, el: "class-pop", id: "class_pop", width: '1060px', param: { 'location': "outside", 'item': {},'tab':1}}},
                {name:"结业",sref:"edu_class",authId:"34",pop: { myself: false, el: "class-pop", id: "class_pop", width: '1060px', param: { 'location': "outside", 'item': {},'tab':1}}},
            ];
            $scope.studentDrop = studentDrop.filter(function (item) {
                if (item.authId instanceof Array && item.authId.length > 0) {
                    var arr = [];
                    angular.forEach(item.authId, function (v) {
                        if (checkAuthMenuById(v)) {
                            arr.push(v);
                        }
                    });
                    return arr.length>0;
                } else {
                    return checkAuthMenuById(item.authId);
                }
            });
            $scope.potailDrop = potailDrop.filter(function (item) {
                return checkAuthMenuById(item.authId);
            });
            $scope.classDrop = classDrop.filter(function (item) {
                if (item.authId instanceof Array && item.authId.length > 0) {
                    var arr = [];
                    angular.forEach(item.authId, function (v) {
                        if (checkAuthMenuById(v)) {
                            arr.push(v);
                        }
                    });
                    return arr.length>0;
                } else {
                    return checkAuthMenuById(item.authId);
                }
            });
            $scope.lookMoreFun = lookMoreFun;
            $scope.toPage = toPage;
            $scope.litoPage = litoPage;
            $scope.kuaijieToPage = kuaijieToPage;
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }

        }
        function lookMoreFun(route_) {
            var param = {
                name:"globalsearch",
                searchData: true,
            };
            $state.go(route_, { screenValue: param});
        }
        function toPage(type,d_) {
            switch (type) {
                case 1:
                    d_.sref = "edu_student";
                    break;
                case 2:
                    d_.sref = "potial_customer";
                    break;
                case 3:
                    d_.sref = "edu_class";
                    break;
                case 4:
                    d_.sref = "edu_course";
                    break;
            }

            if (checkAuthMenuById(d_.authId)) {
                if (!d_.pop.myself) {
                    let p_ = d_.pop;
                    let el = p_.el;
                    let id = p_.id;
                    let width = p_.width;
                    let data = p_.param;
                    // $state.go(d_.sref);
                    $timeout(function () {
                        window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                    },500);
                } else {
                    $state.go(d_.sref, { screenValue: {name:"globalsearch"}});
                }
            }
        }
        function litoPage(type,f, y) {
            let d_ = y;
            var param = {
                    name:"globalsearch",
                    from:type,
                    searchData: d_.needSearch ? f : undefined,
                };
                if (d_.pop) {
                    if (!d_.pop.myself) {
                        let p_ = d_.pop;
                        let el = p_.el;
                        let id = p_.id;
                        let width = p_.width;
                        p_.param.item = f;
                        let data = p_.param;
                        // $state.go(d_.sref, { screenValue: param });
                        $timeout(function () {
                            window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                        }, 500);
                    } else {
                        param["pop"] = d_.pop.pop;
                        $state.go(d_.sref, { screenValue: param });
                    }
                } else {
                    $state.go(d_.sref, { screenValue: param });
                }
        }
        function kuaijieToPage(d_) {
            var param = {
                name:"globalsearch",
                pop: d_.pop ? d_.pop : undefined,
                tab: d_.tab ? d_.tab : undefined,
                tab_:d_.tab2 ? d_.tab2 : undefined
            };
            $state.go(d_.sref, { screenValue: param });
        }
    }]
})