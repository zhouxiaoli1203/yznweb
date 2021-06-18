define(["cropper", 'qiniu'], function(Cropper, qiniu) {
    var szpUtil = szpUtil || {};
    //  var $image = $('#cropperImg')[0], $imageArr = $('#inputImages')[0], $input = $('#inputImage')[0], $confirmCut = $('.confirmCut'), $closeCut = $('.closeCut'), cutDialog, cropper;
    (function(global) {
        /*
         * 照片剪裁工具
         * 参数说明：
         * input: 隐藏的input标签（用于调取照片）
         * iscat: true 或者 false 用于判断是否要裁剪照片
         * fn: 回调方法
         * 例子：util_addImg($('#inputImage'), false, function(data) {
                    $scope.headImg.push({'src': data});
                    $scope.$apply();
                });
         * 
         */
        var qiniuToken;
        var qiniuTokenTime; //上次取得token的时间点，token默认是60分钟过期的，如果时间差超过60分钟自动重新获取token
        //options.multiple,type,maxSize
        global.util_addImg = function(iscat, fn, options, uploadObserver) {
            var globalData = { //变量
                $imgCropper: $('#cropperImg')[0], //裁剪框
                $imgInput: $('#inputImage')[0], //默认-$('#inputImage')[0]:上传一张图片, $('#inputImages')[0]:上传多张图片
                $confirmCut: $('.confirmCut'),
                $closeCut: $('.closeCut'),
                cutDialog: null,
                cropper: null,

                loading: null, //loading页
                files: [] //选择的文件

            };
            global.options = { //默认配置
                aspectRatio: 1 / 1,
                viewMode: 2,
                minContainerWidth: 700,
                minContainerHeight: 480,
            };

            if (!uploadObserver) {
                uploadObserver = {};
            }
            // var uploadObserver = {
            //     'filesSelected': null,//文件选择结果，返回文件列表
            //     'fail' : null, //文件上传失败
            //     'success' :  null,//文件上传成功
            //     'progress' : null //文件上传进度
            // };

            function setInit(config) {
                var canvas, judge, obj = {},
                    options, cropperImgData;
                if (config) {
                    options = angular.copy(config);
                    for (var i in global.options) { //默认配置和所传的参数配置进行比较合并
                        judge = true;
                        for (var j in options) {
                            if (i == j) {
                                judge = false;
                            }
                        }
                        if (judge) {
                            options[i] = global.options[i];
                        }
                    }
                } else {
                    options = angular.copy(global.options);
                }

                globalData.cropper = new Cropper(globalData.$imgCropper, options);
                globalData.$confirmCut.off().on('click', function() {
                    if (globalData.cropper) {
                        cropperImgData = globalData.cropper.getData(); //获取剪裁图片的数据
                        if (cropperImgData.width > 1920) { //如果剪裁的图片横像素大于1920像素则缩小图片的像素比例
                            globalData.cropper.setData({ scaleX: (1920 / cropperImgData.width), scaleY: (1920 / cropperImgData.width) });
                        }
                        canvas = globalData.cropper.getCroppedCanvas();
                        var fileType = 'image/jpeg';
                        if (globalData.files.length > 0 && globalData.files[0].file.type.toLocaleLowerCase() == 'image/png') {
                            fileType = 'image/png';
                        }
                        upLoadQIniu(canvas.toDataURL(fileType, 0.92));
                    }
                    if (globalData.cropper) {
                        globalData.cropper.destroy();
                        globalData.cropper = null;
                    }
                });
                globalData.$closeCut.off().on('click', function() {
                    if (globalData.cropper) {
                        globalData.cropper.destroy();
                        globalData.cropper = null;
                    }
                    layer.close(globalData.cutDialog);
                });
            };

            function setAspectRatio(val) {
                this.options.aspectRatio = val;
            };

            function setData(val) {
                globalData.$imgCropper.cropper("setCropBoxData", {
                    "left": val.left,
                    "top": val.top,
                    "width": val.width,
                    "height": val.height
                });
            };
            //根据file获取文件类型 image, audio ,video, pdf, word
            function getFileType(file) {
                var fileType = file.type;
                fileType = fileType.toLowerCase()
                if (fileType.indexOf('image') == 0) {
                    return "image";
                } else if (fileType.indexOf('audio') == 0) {
                    return "audio";
                } else if (fileType.indexOf('video') == 0) {
                    return "video";
                } else if (fileType.indexOf('pdf') >= 0) {
                    return "pdf";
                } else if (fileType.indexOf('word') >= 0) {
                    return "word";
                }

                //因为部分安装了wps的系统会导致file.type为空的
                var fileName = file.name.toLowerCase();
                if (fileName.lastIndexOf(".doc") == fileName.length - 4 ||
                    fileName.lastIndexOf(".docx") == fileName.length - 5) {
                    return "word";
                }

                return ""
            }

            function setImgSelectedCall(fn) {
                globalData.$imgInput.onchange = function(e) {
                    var files = e.target.files,
                        reader, file, url;
                    if (files && files.length > 0) {
                        file = files[0];
                        if (URL) {
                            done(URL.createObjectURL(file));
                        } else if (FileReader) {
                            reader = new FileReader();
                            reader.onload = function(e) {
                                done(reader.result);
                            };
                            reader.readAsDataURL(file);
                        }
                        var fileOject = {
                            'file': file,
                            'fileUrl': URL.createObjectURL(file),
                            'fileType': getFileType(file)
                        };

                        globalData.files.push(fileOject);
                    };

                    function done(url) {
                        globalData.$imgInput.value = '';
                        globalData.$imgCropper.src = url;
                        globalData.cropper.replace(url);
                        fn(url);
                    };
                }
            };


            var arr = [],
                options = options ? options : {};
            globalData.$imgInput = options.multiple ? $('#inputImages')[0] : globalData.$imgInput; //multiple判断是多选文件还是单选文件
            $(globalData.$imgInput).attr('accept', options.type ? options.type : ''); //筛选input需要上传的文件类型
            if (iscat == true) {
                if (options.multiple) {
                    layer.msg('裁剪图片只能单选图片');
                    globalData.$imgInput.value = '';
                    return;
                }

                setInit(options.options);
                setImgSelectedCall(function(url) {
                    globalData.cutDialog = layer.open({
                        type: 1,
                        title: '图片剪裁',
                        skin: 'layui-layer-demo', // 样式类名
                        closeBtn: 0, // 不显示关闭按钮
                        move: false,
                        resize: false,
                        anim: 0,
                        area: '700px',
                        offset: '30px',
                        shadeClose: false, // 开启遮罩关闭
                        content: $('#cropperContain')
                    });
                });
            } else { //不需要剪裁的数据
                globalData.$imgInput.onchange = function() {
                    if ($(globalData.$imgInput)[0].files.length > options.remain) {
                        layer.msg('当前最多还可选择' + options.remain + '张素材，请重新选择！');
                        return;
                    }
                    console.log($(globalData.$imgInput)[0].files);
                    var audioAndVideoFile = [];
                    for (var i = 0; i < $(globalData.$imgInput)[0].files.length; i++) {
                        var file = $(globalData.$imgInput)[0].files[i];
                        var type = file.type;
                        var fileSize = file.size ? (file.size / 1024) : 0;
                        var errorMsg;

                        //视频文件大小不能超过500M，其他文件大小不能超过50M
                        if (type.indexOf('video') == 0) {
                            if (fileSize > 500 * 1024) {
                                errorMsg = '上传视频文件不能超过500Mb'
                            }
                        } else if (fileSize > 50 * 1024) {
                            errorMsg = '上传文件不能超过50Mb'
                        }
                        if (errorMsg) {
                            // layer.msg(errorMsg + ',"' + file.name + '"文件大小超出了限制');
                            layer.alert(errorMsg + ',"' + file.name + '"文件大小超出了限制', { title: '错误提示', shadeClose: true });
                            globalData.$imgInput.value = '';
                            return;
                        }
                        var fileOject = {
                            'file': file,
                            'fileUrl': URL.createObjectURL(file),
                            'fileType': getFileType(file)
                        };

                        if (fileOject.fileType.length == 0) {
                            layer.alert(file.name + '"文件类型不支持', { title: '错误提示', shadeClose: true });
                            globalData.$imgInput.value = '';
                            return;
                        }


                        globalData.files.push(fileOject);

                        if (fileOject.fileType == 'audio' || fileOject.fileType == 'video') {
                            audioAndVideoFile.push(fileOject);
                        }

                    }

                    var getDuration = function() {
                        //如果没有语音或者视频需要获取时长，那么就开始上传文件

                        var isEdge = navigator.userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
                        //Edge浏览器不支持获取时长方法
                        if (audioAndVideoFile.length == 0 || isEdge) {
                            if (uploadObserver.filesSelected) {
                                uploadObserver.filesSelected(globalData.files);
                            }

                            for (var i = 0; i < $(globalData.$imgInput)[0].files.length; i++) {
                                upLoadQIniu_($(globalData.$imgInput)[0].files[i], i, options);
                            }
                            return;
                        }


                        var fileOject = audioAndVideoFile.shift();
                        try {
                            var audioElement = new Audio(fileOject.fileUrl);
                            var duration;
                            audioElement.addEventListener("loadedmetadata", function(_event) {
                                duration = audioElement.duration;
                                console.log("duration=" + duration);
                                if (duration > 0) {
                                    if (duration > 60 * 60) {
                                        layer.alert('"' + fileOject.file.name + '"文件时长不能超过1小时', { title: '错误提示', shadeClose: true });
                                        globalData.$imgInput.value = '';
                                        hasError = true;
                                        return;
                                    }
                                    fileOject.duration = duration;

                                }

                                getDuration();

                            });


                        } catch (e) {
                            console.log("exception" + e.message);
                            getDuration();
                        }
                    }

                    getDuration();

                }
            }
            $(globalData.$imgInput).trigger("click");
            //运用七牛上传文件
            function upLoadQIniu_(data, orderNum, options) {
                console.log(data);
                var filePath = data.name.split("."),
                    fileVal = filePath[0].replace(/\\/g, "/"), //上传文件截取
                    fileTypeName = '_picture';
                var key_,
                    observable, //七牛上传对象
                    subscription, //七牛上传状态方法回调
                    putExtra = { //七牛上传自定义配置信息
                        'fname': "",
                        'params': {},
                        'mimeType': [] || null
                    },
                    config = { //七牛上传配置
                        'useCdnDomain': true,
                        'region': qiniu.region.z2
                    },
                    limitBackCall = true; //限制回调次数
                timerBackCall = true; //限制回调次数


                if (!uploadObserver.filesSelected) {
                    globalData.loading = layer.msg('<span class="loadingHtml">0/100</span>', { //加载层
                        icon: 16,
                        shade: 0.01,
                        time: false,
                    });
                }

                var fileType = getFileType(data)
                if (fileType === 'image') {
                    fileTypeName = '_picture';
                } else if (fileType === 'audio') {
                    fileTypeName = '_voice';
                } else {
                    fileTypeName = '_' + fileType;
                }

                //如果是图片上传走图片上传的渠道
                //如果图片大小小于2M直接上传否则图片压缩后上传，gif文件不压缩

                var maxSize = 2 * 1024 * 1024; //默认图片文件最大2M
                if (options && options.maxSize) {
                    maxSize = options.maxSize;
                }
                if (data.type.indexOf('image') == 0 && data.type.indexOf('gif') == -1 && data.size > maxSize) {
                    photoCompress(data, {
                        'quality': 0.7,
                    }, function(base64Codes) {
                        var imgSize = parseInt(base64Codes.length - (base64Codes.length / 8) * 2) / 1024; //图片大小单位kb
                        //如果压缩后的图片大小还大于2mb则不上传该图片
                        if (imgSize > maxSize / 1024) {
                            var errorMsg = '压缩后图片还是超过' + maxSize / 1024 / 1024 + 'Mb,请手动压缩后再试';
                            globalData.files[orderNum].error = errorMsg;
                            if (uploadObserver.fail) {
                                uploadObserver.fail(globalData.files[orderNum].fileUrl, errorMsg)
                            }

                            checkAllCompleted();
                        } else {
                            upLoadQIniu(base64Codes, orderNum);
                        }
                    });
                    return;
                }

                key_ = key_ ? key_ : ("oa_" + localStorage.getItem("shopId") + "_" + (new Date().getTime() + orderNum) + fileTypeName); //上传文件名

                for (var i = 0; i < globalData.files.length; i++) {
                    if (data == globalData.files[i].file) {
                        var fileOject = globalData.files[i];
                        if (fileOject && fileOject.duration) {
                            key_ = key_ + '_' + Math.round(fileOject.duration);
                        }
                    }
                }

                console.log(data.name + '#key=' + key_ + '#type=' + data.type);
                upLoadQIniu2(data, orderNum, key_);


                /*
                 *三个参数
                 *file：一个是文件(类型是图片格式)，
                 *w：一个是文件压缩的后宽度，宽度越小，字节越小
                 *objDiv：一个是容器或者回调函数
                 *photoCompress()
                 */

                function photoCompress(file, w, objDiv) {
                    var ready = new FileReader();
                    /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
                    ready.readAsDataURL(file);
                    ready.onload = function() {
                        var re = this.result;
                        canvasDataURL(re, w, objDiv);
                    }

                    // canvasDataURL(URL.createObjectURL(file), w, objDiv);
                }

                //canvas处理旋转和压缩图片
                function canvasDataURL(path, obj, callback) {
                    var img = new Image();
                    img.src = path;
                    img.onload = function() {
                        var that = this;
                        // 默认按比例压缩
                        var MAX_IMAGE_LEGTH = 1440.0;
                        var w = that.width;
                        var h = that.height;

                        var min = Math.min(w, h);

                        if (min > MAX_IMAGE_LEGTH) {
                            if (that.width == min) {
                                w = MAX_IMAGE_LEGTH;
                                h = that.height / (that.width / MAX_IMAGE_LEGTH);
                            } else {
                                h = MAX_IMAGE_LEGTH;
                                w = that.width / (that.height / MAX_IMAGE_LEGTH);
                            }
                        }

                        w = parseInt(w);
                        h = parseInt(h);

                        // var w = that.width > 1920?1920:that.width,  //如果图片的宽度大于1920px则缩小图片的宽度至1920px，高等比例缩小
                        //     h = that.width > 1920?parseInt(1920 / that.width * that.height):that.height,
                        //     scale = w / h;
                        // w = obj.width || w;
                        // h = obj.height || (w / scale);
                        var quality = 0.7; // 默认图片质量为0.7
                        //生成canvas
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        // 创建属性节点
                        var anw = document.createAttribute("width");
                        var anh = document.createAttribute("height");

                        /*
                         *备注： EXIF插件使用，获取图片的元数据
                         * Orientation参数值表示图片需要旋转的角度
                         * 当需要顺时针或者逆时针旋转90度，则canvas的高度和宽度需要互换
                         * try错误防止EXIF插件未获取到元数据而报错图片无法上传
                         *
                         */
                        //因为使用的是URL.createObjectURL方法创建的图片，所以这里不需要调整方向
                        // try {
                        //     EXIF.getData(that, function(){
                        //         EXIF.getAllTags(that);
                        //         Orientation = EXIF.getTag(that,'Orientation');
                        //         console.log(Orientation);
                        //         switch (Orientation){
                        //             case 6: //图片需要顺时针（向左）90度旋转才是正常的
                        //                 anw.nodeValue = h;
                        //                 anh.nodeValue = w;
                        //                 canvas.setAttributeNode(anw);
                        //                 canvas.setAttributeNode(anh);
                        //                 ctx.rotate(90 * Math.PI / 180);
                        //                 ctx.drawImage(img, 0, -h, w, h);
                        //                 break;
                        //             case 8: //需要逆时针（向右）90度旋转
                        //                 anw.nodeValue = h;
                        //                 anh.nodeValue = w;
                        //                 canvas.setAttributeNode(anw);
                        //                 canvas.setAttributeNode(anh);
                        //                 ctx.rotate(-90 * Math.PI / 180);
                        //                 ctx.drawImage(img, -w, 0, w, h);
                        //                 break;
                        //             case 3: //图片是上下颠倒的
                        //                 anw.nodeValue = w;
                        //                 anh.nodeValue = h;
                        //                 canvas.setAttributeNode(anw);
                        //                 canvas.setAttributeNode(anh);
                        //                 ctx.rotate(180 * Math.PI / 180);
                        //                 ctx.drawImage(img, -w, -h, w, h);
                        //                 break;
                        //             default:    //不旋转
                        //                 anw.nodeValue = w;
                        //                 anh.nodeValue = h;
                        //                 canvas.setAttributeNode(anw);
                        //                 canvas.setAttributeNode(anh);
                        //                 ctx.drawImage(img, 0, 0, w, h);
                        //                 break;
                        //         }
                        //
                        //         // 图像质量
                        //         if(obj.quality && obj.quality <= 1 && obj.quality > 0){
                        //             quality = obj.quality;
                        //         }
                        //         // quality值越小，所绘制出的图像越模糊
                        //         var base64 = canvas.toDataURL('image/jpeg', quality);
                        //         // 回调函数返回base64的值
                        //         callback(base64);
                        //     });
                        // } catch (e) {
                        //     anw.nodeValue = w;
                        //     anh.nodeValue = h;
                        //     canvas.setAttributeNode(anw);
                        //     canvas.setAttributeNode(anh);
                        //     ctx.drawImage(img, 0, 0, w, h);
                        //     // 图像质量
                        //     if(obj.quality && obj.quality <= 1 && obj.quality > 0){
                        //         quality = obj.quality;
                        //     }
                        //     // quality值越小，所绘制出的图像越模糊
                        //     var base64 = canvas.toDataURL('image/jpeg', quality);
                        //     // 回调函数返回base64的值
                        //     callback(base64);
                        // }


                        anw.nodeValue = w;
                        anh.nodeValue = h;
                        canvas.setAttributeNode(anw);
                        canvas.setAttributeNode(anh);
                        ctx.drawImage(img, 0, 0, w, h);
                        // 图像质量
                        if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
                            quality = obj.quality;
                        }
                        // quality值越小，所绘制出的图像越模糊
                        var base64 = canvas.toDataURL('image/jpeg', quality);
                        // 回调函数返回base64的值
                        callback(base64);
                    }
                }
            }

            function checkAllCompleted() {
                var allFileCompelted = true;
                for (var i = 0; i < globalData.files.length; i++) {
                    if (!globalData.files[i].key && !globalData.files[i].error) {
                        allFileCompelted = false;
                        break;
                    }
                }
                if (allFileCompelted) {
                    if (options.multiple) {
                        var fileURLS = [];
                        for (var i = 0; i < globalData.files.length; i++) {
                            if (globalData.files[i].httpUrl) {
                                fileURLS.push(globalData.files[i].httpUrl);
                            }
                        }

                        fn(fileURLS);
                    } else {
                        fn(globalData.files[0].httpUrl, globalData.files[0].key);
                    }
                    if (globalData.loading) {
                        layer.close(globalData.loading);
                    }

                    globalData.$imgInput.value = '';

                    var errHtml = '';
                    for (var i = 0; i < globalData.files.length; i++) {
                        if (globalData.files[i].error) {
                            errHtml += '<li><span>' + (i + 1) + '、' + globalData.files[i].file.name + '</span><em>【' + globalData.files[i].error + '】</em></li>';
                        }
                    }

                    if (errHtml.length > 0) {
                        $('.upload_img_err').html(errHtml);
                        openPopByDiv('错误文件', '.upload_img_err', '560px');
                    }
                }
            }

            function upLoadQIniu2(data, orderNum, key_) {
                //因为超过4M以后文件会分片上传，所以要指定文件类型，不然七牛会根据算法自动个文件类型，那样文件大的word或excel会有问题
                var mimeTypes = [];
                mimeTypes.push(data.type)
                var putExtra = {
                    mimeType: mimeTypes
                };
                if (options.dataSource) {
                    putExtra.params = {};
                    putExtra.params['x:dataSource'] = options.dataSource;
                }

                var observable = qiniu.upload(data, key_, getQINIUToken(), putExtra); //上传数据
                var subscription = observable.subscribe({ //上传状态回调
                    next: function(res) { //上传中
                        if (uploadObserver.progress) {
                            var isStoped = uploadObserver.progress(globalData.files[orderNum].fileUrl, parseInt(res.total.percent));
                            if (isStoped) {
                                subscription.unsubscribe();
                                globalData.files[orderNum].error = '用户取消';
                            }
                        } else {
                            $('.loadingHtml').html(parseInt(res.total.percent) + '/100');
                        }
                        // console.log(res);
                    },
                    error: function(err) { //上传失败
                        qiniuToken = undefined;
                        globalData.files[orderNum].error = '上传失败';

                        if (uploadObserver.fail) {
                            uploadObserver.fail(globalData.files[orderNum].fileUrl, globalData.files[orderNum].error)
                        }

                        console.log(err);

                        checkAllCompleted();
                    },
                    complete: function(res) { //上传成功
                        globalData.files[orderNum].key = res.key;
                        globalData.files[orderNum].httpUrl = res.url;
                        if (uploadObserver.success) {
                            uploadObserver.success(globalData.files[orderNum].fileUrl, res.key)
                        }
                        if (iscat == true) { //需要剪裁的图片关闭剪裁弹框
                            layer.close(globalData.cutDialog);
                        }
                        checkAllCompleted();
                    }
                });
            }
            //上传剪裁或者压缩后的图片
            function upLoadQIniu(data, orderNum) {
                var buffer = atob(data.split(",")[1]).split("").map(function(char) {
                    return char.charCodeAt(0);
                });
                var blob = new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' });
                var key = "oa_" + localStorage.getItem("shopId") + "_" + new Date().getTime() + '_picture';
                if (!orderNum) {
                    orderNum = 0;
                }
                upLoadQIniu2(blob, orderNum, key);
            };

            function getQINIUToken() {
                if (qiniuToken) {
                    if (qiniuTokenTime) {
                        if (new Date().getTime() - qiniuTokenTime.getTime() < 3500 * 1000) {
                            return qiniuToken;
                        } else {
                            qiniuToken = undefined;
                        }
                    }
                }

                $.hello({
                    url: CONFIG.URL + "/api/oa/qiniu/getUploadToken",
                    type: "get",
                    async: false,
                    success: function(data) {
                        if (data.status == "200") {
                            qiniuToken = data.context;
                            qiniuTokenTime = new Date();
                            console.log('qiniuToken=' + qiniuToken);
                        }
                    }
                });
                return qiniuToken;
            };
        };

    })(szpUtil)
    window.szpUtil = szpUtil;
})