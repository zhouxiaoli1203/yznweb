define([], function() {
    creatPopup({
        el: 'photoPop',
        openPopupFn: 'viewPhotos',
        htmlUrl: './templates/popup/photos_pop.html',
        controllerFn: function($scope,props, SERVICE, $timeout, $state, $sce) {
            $scope.props = {};
            $scope.props = angular.copy(props);
            
            var unbingWatch = $scope.$watch('props.list',function(n, o){
                if(n === o) {
                    unbingWatch();
                };   //防止第一次重复监听
                $scope.pic = 0;
                $scope.imglist = [];
                $scope.imglist = $scope.props.list.length>0?setUrlist($scope.props.list):[];
                console.log($scope.imglist);
                var picList = $scope.props.list.length>0?$scope.props.list:[];
                $scope.imgSrc = "";
                
                var $ul = $("#c_ul")[0],
                    $li = $("#c_ul").find("li"),
                    $li_w = props.liwidth?props.liwidth:880,
                    $ul_w = $li_w*$scope.imglist.length;
                $ul.style.width = $ul_w+"px";
                $ul.style.left = getCurrentPicleft();
                $ul.style.transition = "none";
                init();
                function init(){
                    $scope.next = next;
                    $scope.prev = prev;
                    $scope.down = down;
                    
                }
                function down(){
                   window.open(addFilename($scope.imgSrc));
                }
                function addFilename(v){
                    var ptype = v.match(RegExp(/picture/));
                    var atype = v.match(RegExp(/voice/));
                    var vtype = v.match(RegExp(/video/));
                    if (ptype) {
                        return v+"?attname="+new Date().getTime()+".jpg";
                    }
                    if (atype) {
                        return v+"?attname="+new Date().getTime()+".mp3";
                    }
                    if (vtype) {
                       return v+"?attname="+new Date().getTime()+".mp4";
                    }
                }
                function getCurrentPicleft(){
                    var num = 0;
                    for(var i = 0,len=picList.length;i<len;i++){
                        var str = picList[i];
                        var value = str.substring(str.lastIndexOf("/")+1,str.length)
                        if($scope.props.val == value){
                            $scope.imgSrc = str;
                            num = -(i*$li_w)+"px";
                            $scope.pic = i;
                            break;
                        }
                    }
                    return num;
                }
                function next(){
                    if($scope.pic === $scope.imglist.length-1){
                        return layer.msg("此照片已经是最后一张！");
                    }
                    $scope.pic+=1;
                    animate('next');
                }
                function prev(){
                    if($scope.pic === 0){
                        return layer.msg("此照片已经是第一张！");
                    }
                    $scope.pic-=1;
                    animate('prev');
                }
                function animate(t){
                    var newLeft;
                    var imgStr = $scope.imglist[$scope.pic],
                        vStr = imgStr.value;
                    var ptype = vStr.match(RegExp(/picture/));
                    var atype = vStr.match(RegExp(/voice/));
                    var vtype = vStr.match(RegExp(/video/));
                    if (ptype) {
                        $scope.imgSrc = imgStr.imageUrl;
                    }
                    if (atype) {
                        $scope.imgSrc = imgStr.audioUrl;
                    }
                    if (vtype) {
                       $scope.imgSrc = imgStr.videoUrl;
                    }
                    $ul.style.transition = "all 1s";
                    if(t == 'next'){
                        newLeft = parseInt($ul.style.left) - $li_w;
                    }else{
                        newLeft = parseInt($ul.style.left) + $li_w;
                    }
                    $ul.style.left = newLeft + 'px';
                }
                function setUrlist(list) {
                    var urlList = [];
                    angular.forEach(list, function(v) {
                        var obj = {};
                        var ptype = v.match(RegExp(/picture/));
                        var atype = v.match(RegExp(/voice/));
                        var vtype = v.match(RegExp(/video/));
                        if (ptype) {
                            urlList.push({
                                imageUrl: v,
                                value:v.substring(v.lastIndexOf("/")+1,v.length)
                            });
                        }
                        if (atype) {
                            urlList.push({
                                audioUrl: v,
                                audioUrl_: $sce.trustAsResourceUrl(v),
                                value:v.substring(v.lastIndexOf("/")+1,v.length)
                            });
                        }
                        if (vtype) {
                            urlList.push({
                                videoUrl: v,
                                videoUrl_: $sce.trustAsResourceUrl(v),
                                value:v.substring(v.lastIndexOf("/")+1,v.length)
                            });
                        }
                    });
                    return urlList;
                }
            });
        }
    })
})