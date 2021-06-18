var ImgCut = function(config) {
	this.cutSelector = config.cutSelector;
	this.fileSelector = config.fileSelector;
	this.cutSize = config.cutSize;
	this.cutCall = config.cutCall;
	this.compress = config.compress;
	this.compressSize = config.compressSize;
	this.beforeCut = config.beforeCut;
	this.validateCut = config.validateCut;

	var _this = this,
		imgSrc, canvas, context, file;
	var range = $('<input type="range" class="imgCut" name="slider" id="silder" value="0.4" max="0.9" min="0" step="0.005"/>');
	range.css({
		"position": "absolute",
		'-ms-transform': "rotate(90deg)",
		/* Internet Explorer */
		"-moz-transform": "rotate(90deg)",
		/* Firefox */
		"-webkit-transform": "rotate(90deg)",
		/* Safari 和 Chrome */
		"-o-transform": "rotate(90deg)"
			/* Opera */
	})
	var scale = $(range).val();
	var x0, y0;
	$(this.fileSelector).change(function() {
		if(_this.validateCut&& typeof _this.validateCut=="function"){
			if(_this.validateCut(this)===false){
				return;
			}
		}
		var reader = new FileReader();
		file = this.files[0];
		renderCutBox();
		reader.onload = function() {
			imgSrc = reader.result;
			if(_this.compress === true) {
				compress(imgSrc);
			} else {
				creatImg(scale);
			}
			if(_this.beforeCut&&typeof _this.beforeCut=="function"){
				_this.beforeCut();
			}
		};
		reader.readAsDataURL(file);
	});

	function compressedCall(src) {
		imgSrc = src;
		creatImg(scale);
	}

	$(range).mousedown(function() {
		this.onmousemove = function() {
			scale = this.value;
			creatImg(scale);
		}
	})

	function creatImg(scale) {
		var myImg = new Image();
		myImg.src = imgSrc;
		myImg.onload = function() {
			var imgh, imgw;
			//					if(this.width > 800 || this.heigh > 600) {
			//
			//					}
			var imgh = this.height * scale;
			var imgw = this.width * scale;
			var x = canvas.width / 2 - imgw / 2;
			var y = canvas.height / 2 - imgh / 2
			context.clearRect(0, 0, canvas.width, canvas.height);
			//					context.drawImage(myImg, x, y)
			context.drawImage(myImg, x, y, imgw, imgh)
		}
	}

	function compress(imgData) {
		if(!_this.compressSize) {
			compressedCall(imgData)
			return;
		}
		var com_rate = 1;
		if(file.size > _this.compressSize) {
			com_rate = _this.compressSize / file.size;
		}
		if(!imgData) return;
		var img = new Image();
		img.onload = function() {
			if(com_rate != 1) { //按最大高度等比缩放
				var rate = Math.sqrt(com_rate);
				img.width *= rate;
				img.height *= rate;
			}
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext("2d");
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.clearRect(0, 0, canvas.width, canvas.height); // canvas清屏
			ctx.drawImage(img, 0, 0, img.width, img.height);
			compressedCall(canvas.toDataURL("image/jpeg"));
		};
		img.src = imgData;
	}

	function clearCanvas() {
		context.fillStyle = "#000000";
		context.beginPath();
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.closePath();
	}

	function renderCutBox() {

		$(_this.cutSelector).empty();
		$(_this.cutSelector).width(860).height(600).css({
			"position": "relative"
		});
		var cutArea = $("<div></div>"),
			ctrlArea = $("<div></div>"),
			cancelBtn=$("<button class='btn imgcancelbtn btn-warning'>取消</button>"),
			button = $("<button class='btn imgcutbtn  btn-success'>裁剪</button>");
		canvas = document.createElement("canvas");
		context = canvas.getContext("2d");
		canvas.height = 600;
		canvas.width = 800;
		$(canvas).css({
			"cursor": "move"
		})
		var cutW = _this.cutSize[0];
		var cutH = _this.cutSize[1];
		cutW = cutW > 800 ? 800 : cutW;
		cutH = cutH > 600 ? 600 : cutH;
		var shadowW = (800 - cutW) / 2;
		var shadowH = (600 - cutH) / 2;
		var left = $("<div class='imgcut_shade'></div>").css({
			"border-top": shadowH + "px solid rgba(0, 0, 0, .5)",
			"border-right": shadowW + "px solid rgba(0, 0, 0, .5)",
			"border-bottom": shadowH + "px solid rgba(0, 0, 0, .5)",
			"border-left": shadowW + "px solid rgba(0, 0, 0, .5)",
			"box-sizing": "border-box"
		});
		cutArea.width(800).height(600).css({
			"position": "absolute",
			"left": "0px",
			"top": "0px"
		}).append(canvas).append(left);
		//				.append(right).append(top).append(bottom);
		$(_this.cutSelector).append(cutArea).append(ctrlArea);
		ctrlArea.width(60).height(600).css({
			"position": "absolute",
			"left": "800px",
			"top": "0px",
			"display": "inline-block"
		}).append(cancelBtn).append(range).append(button);
		var offset = $(canvas).offset();
		$('.imgcut_shade').mousedown(function(e) {
			x0 = e.clientX - offset.left;
			y0 = e.clientY - offset.top;
			$('.imgcut_shade').mousemove(function(e) {
				var x = e.clientX - offset.left;
				var y = e.clientY - offset.top;
				context.translate(x - x0, y - y0);
				x0 = x;
				y0 = y;
				creatImg(scale);
			})
		})
		$('.imgcut_shade').mouseup(function() {
			$('.imgcut_shade').unbind("mousemove");
		}).mouseout(function() {
			$('.imgcut_shade').unbind("mousemove");
		})
		cancelBtn.click(function(){
			layer.close(cutDialog);
		});
		button.click(function() {
			var data = canvas.toDataURL();
			var imgC = new Image();
			imgC.src = data;
			console.log("x0: ", x0);
			console.log("y0: ", y0);
			imgC.onload = function() { //必须onload之后再画
				var can = document.createElement("canvas");
				can.width = cutW;
				can.height = cutH;
				var canDraw = can.getContext("2d");
				canDraw.drawImage(imgC, shadowW, shadowH, cutW, cutH, 0, 0, cutW, cutH);
				var imgRes = can.toDataURL();
				//						window.open(imgRes);
				if(typeof _this.cutCall == "function") {
					_this.cutCall(imgRes);
				}
			};
		});
	}
};