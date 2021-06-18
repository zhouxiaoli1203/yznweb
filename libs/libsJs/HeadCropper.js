define(function() {
	'use strict';
	var ImgCropper = (function() {
		var cutCall, instantiated;
		var fileChangeCall, aspectRatio = 1 / 1;

		function init() {
			var $image = $('#imageCropper');
			var $download = $('#download');
			var $dataX = $('#dataX');
			var $dataY = $('#dataY');
			var $dataHeight = $('#dataHeight');
			var $dataWidth = $('#dataWidth');
			var $dataRotate = $('#dataRotate');
			var $dataScaleX = $('#dataScaleX');
			var $dataScaleY = $('#dataScaleY');
			var options = {
				aspectRatio: aspectRatio,
				preview: '.img-preview',
				cropBoxResizable: false,
				cropBoxMovable: false,
				dragMode: "move",
				crop: function(e) {
//					console.log(e);
					$dataX.val(Math.round(e.x));
					$dataY.val(Math.round(e.y));
					$dataHeight.val(Math.round(e.height));
					$dataWidth.val(Math.round(e.width));
					$dataRotate.val(e.rotate);
					$dataScaleX.val(e.scaleX);
					$dataScaleY.val(e.scaleY);
				}
			};

			// Tooltip
			//$('[data-toggle="tooltip"]').tooltip();

			// Cropper
			$image.on({
				'build.cropper': function(e) {
//					console.log(e.type);
				},
				'built.cropper': function(e) {
//					console.log(e.type);
				},
				'cropstart.cropper': function(e) {
//					console.log(e.type, e.action);
				},
				'cropmove.cropper': function(e) {
//					console.log(e.type, e.action);
				},
				'cropend.cropper': function(e) {
//					console.log(e.type, e.action);
				},
				'crop.cropper': function(e) {
//					console.log(e.type, e.x, e.y, e.width, e.height, e.rotate, e.scaleX, e.scaleY);
				},
				'zoom.cropper': function(e) {
//					console.log(e.type, e.ratio);
				}
			}).cropper(options);

			// Buttons
			if(!$.isFunction(document.createElement('canvas').getContext)) {
				$('button[data-method="getCroppedCanvas"]').prop('disabled', true);
			}

			if(typeof document.createElement('cropper').style.transition === 'undefined') {
				$('button[data-method="rotate"]').prop('disabled', true);
				$('button[data-method="scale"]').prop('disabled', true);
			}

			// Methods
			$('.docs-buttons').on('click', '[data-method]', function() {
				var $this = $(this);
				var data = $this.data();
				var $target;
				var result;

				if($this.prop('disabled') || $this.hasClass('disabled')) {
					return;
				}

				if($image.data('cropper') && data.method) {
					data = $.extend({}, data); // Clone a new one
					if(typeof data.target !== 'undefined') {
						$target = $(data.target);
						if(typeof data.option === 'undefined') {
							try {
								data.option = JSON.parse($target.val());
							} catch(e) {
//								console.log(e.message);
							}
						}
					}

					if(data.method === 'rotate') {
						$image.cropper('clear');
					}

					result = $image.cropper(data.method, data.option, data.secondOption);

					if(data.method === 'rotate') {
						$image.cropper('crop');
					}

					switch(data.method) {
						case 'scaleX':
						case 'scaleY':
							$(this).data('option', -data.option);
							break;

						case 'getCroppedCanvas':
							if(result) {
								if(cutCall && typeof cutCall == "function") {
									cutCall(result.toDataURL('image/jpeg'));
								}
								//							window.open(result.toDataURL('image/jpeg'));
								return;
								// Bootstrap's Modal
								$('#getCroppedCanvasModal').modal().find('.modal-body').html(result);

								if(!$download.hasClass('disabled')) {
									$download.attr('href', result.toDataURL('image/jpeg'));
								}
							}
							break;
					}

					if($.isPlainObject(result) && $target) {
						try {
							$target.val(JSON.stringify(result));
						} catch(e) {
							//						console.log(e.message);
						}
					}

				}
			});

			// Keyboard
			//		$(document.body).on('keydown', function(e) {
			//
			//			if(!$image.data('cropper') || this.scrollTop > 300) {
			//				return;
			//			}
			//
			//			switch(e.which) {
			//				case 37:
			//					e.preventDefault();
			//					$image.cropper('move', -1, 0);
			//					break;
			//
			//				case 38:
			//					e.preventDefault();
			//					$image.cropper('move', 0, -1);
			//					break;
			//
			//				case 39:
			//					e.preventDefault();
			//					$image.cropper('move', 1, 0);
			//					break;
			//
			//				case 40:
			//					e.preventDefault();
			//					$image.cropper('move', 0, 1);
			//					break;
			//			}
			//
			//		});

			// Import image
			var $inputImage = $('#inputImage');
			var URL = window.URL || window.webkitURL;
			var blobURL;
			//		console.log($image.data('cropper'));
			if(URL) {
				$inputImage.change(function() {
					var files = this.files;
					var file;
					if(!$image.data('cropper')) {
						return;
					}
					if(files && files.length) {
						file = files[0];

						if(/^image\/\w+$/.test(file.type)) {
							blobURL = URL.createObjectURL(file);
							$image.one('built.cropper', function() {
								// Revoke when load complete
								URL.revokeObjectURL(blobURL);
							}).cropper('reset').cropper('replace', blobURL);
							$inputImage.val('');
							if(fileChangeCall && typeof fileChangeCall == "function") {
								fileChangeCall();
							}
						} else {
							window.alert('Please choose an image file.');
						}
					}
				});
			} else {
				$inputImage.prop('disabled', true).parent().addClass('disabled');
			}

			return {
				setCutCall: function(call) {
					cutCall = call;
				},
				setImgSelectedCall: function(call) {
					fileChangeCall = call;
				},
				setAspectRatio: function(val) {
					aspectRatio = val;
					options.aspectRatio = val;
					$image.cropper('destroy').cropper(options);
				},
				setData: function(width, height) {
					$image.cropper("setCropBoxData", {
						"left": 82.5,
						"top": 48.875,
						"width": 200,
						"height": 200
					}).cropper('destroy').cropper(options);
				}
			}
		}
		return {
			getInstance: function() {
				if(!instantiated) {
					instantiated = init()
				}
				return instantiated;
			}
		}
	})();
	return ImgCropper
})