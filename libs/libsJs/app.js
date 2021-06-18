(function(e) {
	e.fn.extend({
		slimScroll: function(f) {
			var a = e.extend({
				width: "auto",
				height: "250px",
				size: "7px",
				color: "#000",
				position: "right",
				distance: "1px",
				start: "top",
				opacity: .4,
				alwaysVisible: !1,
				disableFadeOut: !1,
				railVisible: !1,
				railColor: "#333",
				railOpacity: .2,
				railDraggable: !0,
				railClass: "slimScrollRail",
				barClass: "slimScrollBar",
				wrapperClass: "slimScrollDiv",
				allowPageScroll: !1,
				wheelStep: 20,
				touchScrollStep: 200,
				borderRadius: "7px",
				railBorderRadius: "7px"
			}, f);
			this.each(function() {
				function v(d) {
					if(r) {
						d = d || window.event;
						var c = 0;
						d.wheelDelta && (c = -d.wheelDelta / 120);
						d.detail && (c = d.detail / 3);
						e(d.target || d.srcTarget || d.srcElement).closest("." + a.wrapperClass).is(b.parent()) && n(c, !0);
						d.preventDefault && !k && d.preventDefault();
						k || (d.returnValue = !1)
					}
				}

				function n(d, e, f) {
					k = !1;
					var g = d,
						h = b.outerHeight() - c.outerHeight();
					e && (g = parseInt(c.css("top")) + d * parseInt(a.wheelStep) / 100 * c.outerHeight(), g = Math.min(Math.max(g, 0), h), g = 0 < d ? Math.ceil(g) : Math.floor(g), c.css({
						top: g + "px"
					}));
					l = parseInt(c.css("top")) / (b.outerHeight() - c.outerHeight());
					g = l * (b[0].scrollHeight - b.outerHeight());
					f && (g = d, d = g / b[0].scrollHeight * b.outerHeight(), d = Math.min(Math.max(d, 0), h), c.css({
						top: d + "px"
					}));
					b.scrollTop(g);
					b.trigger("slimscrolling", ~~g);
					w();
					q()
				}

				function x() {
					u = Math.max(b.outerHeight() / b[0].scrollHeight * b.outerHeight(), 30);
					c.css({
						height: u + "px"
					});
					var a = u == b.outerHeight() ? "none" : "block";
					c.css({
						display: a
					})
				}

				function w() {
					x();
					clearTimeout(B);
					l == ~~l ? (k = a.allowPageScroll, C != l && b.trigger("slimscroll", 0 == ~~l ? "top" : "bottom")) : k = !1;
					C = l;
					u >= b.outerHeight() ? k = !0 : (c.stop(!0, !0).fadeIn("fast"), a.railVisible && m.stop(!0, !0).fadeIn("fast"))
				}

				function q() {
					a.alwaysVisible || (B = setTimeout(function() {
						a.disableFadeOut && r || y || z || (c.fadeOut("slow"), m.fadeOut("slow"))
					}, 1E3))
				}
				var r, y, z, B, A, u, l, C, k = !1,
					b = e(this);
				if(b.parent().hasClass(a.wrapperClass)) {
					var p = b.scrollTop(),
						c = b.siblings("." + a.barClass),
						m = b.siblings("." + a.railClass);
					x();
					if(e.isPlainObject(f)) {
						if("height" in f && "auto" == f.height) {
							b.parent().css("height", "auto");
							b.css("height", "auto");
							var h = b.parent().parent().height();
							b.parent().css("height",
								h);
							b.css("height", h)
						} else "height" in f && (h = f.height, b.parent().css("height", h), b.css("height", h));
						if("scrollTo" in f) p = parseInt(a.scrollTo);
						else if("scrollBy" in f) p += parseInt(a.scrollBy);
						else if("destroy" in f) {
							c.remove();
							m.remove();
							b.unwrap();
							return
						}
						n(p, !1, !0)
					}
				} else if(!(e.isPlainObject(f) && "destroy" in f)) {
					a.height = "auto" == a.height ? b.parent().height() : a.height;
					p = e("<div></div>").addClass(a.wrapperClass).css({
						position: "relative",
						overflow: "hidden",
						width: a.width,
						height: a.height
					});
					b.css({
						overflow: "hidden",
						width: a.width,
						height: a.height
					});
					var m = e("<div></div>").addClass(a.railClass).css({
							width: a.size,
							height: "100%",
							position: "absolute",
							top: 0,
							display: a.alwaysVisible && a.railVisible ? "block" : "none",
							"border-radius": a.railBorderRadius,
							background: a.railColor,
							opacity: a.railOpacity,
							zIndex: 90
						}),
						c = e("<div></div>").addClass(a.barClass).css({
							background: a.color,
							width: a.size,
							position: "absolute",
							top: 0,
							opacity: a.opacity,
							display: a.alwaysVisible ? "block" : "none",
							"border-radius": a.borderRadius,
							BorderRadius: a.borderRadius,
							MozBorderRadius: a.borderRadius,
							WebkitBorderRadius: a.borderRadius,
							zIndex: 99
						}),
						h = "right" == a.position ? {
							right: a.distance
						} : {
							left: a.distance
						};
					m.css(h);
					c.css(h);
					b.wrap(p);
					b.parent().append(c);
					b.parent().append(m);
					a.railDraggable && c.bind("mousedown", function(a) {
						var b = e(document);
						z = !0;
						t = parseFloat(c.css("top"));
						pageY = a.pageY;
						b.bind("mousemove.slimscroll", function(a) {
							currTop = t + a.pageY - pageY;
							c.css("top", currTop);
							n(0, c.position().top, !1)
						});
						b.bind("mouseup.slimscroll", function(a) {
							z = !1;
							q();
							b.unbind(".slimscroll")
						});
						return !1
					}).bind("selectstart.slimscroll",
						function(a) {
							a.stopPropagation();
							a.preventDefault();
							return !1
						});
					m.hover(function() {
						w()
					}, function() {
						q()
					});
					c.hover(function() {
						y = !0
					}, function() {
						y = !1
					});
					b.hover(function() {
						r = !0;
						w();
						q()
					}, function() {
						r = !1;
						q()
					});
					b.bind("touchstart", function(a, b) {
						a.originalEvent.touches.length && (A = a.originalEvent.touches[0].pageY)
					});
					b.bind("touchmove", function(b) {
						k || b.originalEvent.preventDefault();
						b.originalEvent.touches.length && (n((A - b.originalEvent.touches[0].pageY) / a.touchScrollStep, !0), A = b.originalEvent.touches[0].pageY)
					});
					x();
					"bottom" === a.start ? (c.css({
						top: b.outerHeight() - c.outerHeight()
					}), n(0, !0)) : "top" !== a.start && (n(e(a.start).position().top, null, !0), a.alwaysVisible || c.hide());
					window.addEventListener ? (this.addEventListener("DOMMouseScroll", v, !1), this.addEventListener("mousewheel", v, !1)) : document.attachEvent("onmousewheel", v)
				}
			});
			return this
		}
	});
	e.fn.extend({
		slimscroll: e.fn.slimScroll
	})
})(jQuery);
define(function() {

	/*
	 *  Document   : app.js
	 */

var App = function() {
	var page, pageContent, header, sidebar, sBrand, sExtraInfo, sidebarAlt, sScroll, sScrollAlt, sildeBarCall;
	var uiInit = function() {
		page = $('#page-container');
		header = $('header');
		pageContent = $('#page-content');
		sidebar = $('#sidebar');
		sBrand = $('#sidebar-brand');
		sExtraInfo = $('#sidebar-extra-info');
		sScroll = $('#sidebar-scroll');
		sidebarAlt = $('#sidebar-alt');
		sScrollAlt = $('#sidebar-scroll-alt');
		handleSidebar('init');
		handleNav();
		if((header.hasClass('navbar-fixed-top') || header.hasClass('navbar-fixed-bottom'))) {
			$(window).on('scroll', function() {
				if($(this).scrollTop() > 50) {
					header.addClass('navbar-glass');
				} else {
					header.removeClass('navbar-glass');
				}
			});
		}
		$(window).on('resize orientationchange', function() {
			resizePageContent();
		}).resize();
		var yearCopy = $('#year-copy'),
			d = new Date();
		if(d.getFullYear() === 2014) {
			yearCopy.html('2014');
		} else {
			yearCopy.html('2014-' + d.getFullYear().toString().substr(2, 2));
		}
		rippleEffect($('.btn-effect-ripple'), 'btn-ripple');
		// Initialize Tabs
		$('[data-toggle="tabs"] a, .enable-tabs a').click(function(e) {
			e.preventDefault();
			$(this).tab('show');
		});
		// Initialize Tooltips
		$('[data-toggle="tooltip"], .enable-tooltip').tooltip({
			container: 'body',
			animation: false
		});
		// Initialize Popovers
		$('[data-toggle="popover"], .enable-popover').popover({
			container: 'body',
			animation: true
		});
		$('[data-toggle="lightbox-gallery"]').each(function() {
			$(this).magnificPopup({
				delegate: 'a',
				type: 'image',
				gallery: {
					enabled: true,
					navigateByImgClick: true,
					arrowMarkup: '<button type="button" class="mfp-arrow mfp-arrow-%dir%" title="%title%"></button>',
					tPrev: 'Previous',
					tNext: 'Next',
					tCounter: '<span class="mfp-counter">%curr% of %total%</span>'
				},
				image: {
					titleSrc: 'title'
				}
			});
		});
		$('.toggle-menu .submenu').on('click', function() {
			$(this)
				.parent('li')
				.toggleClass('open');
		});
	};
	var pageLoading = function() {
		var pageWrapper = $('#page-wrapper');
		if(pageWrapper.hasClass('page-loading')) {
			if(page.hasClass('enable-cookies')) {
				setTimeout(function() {
					pageWrapper.removeClass('page-loading');
				}, 100);
			} else {
				pageWrapper.removeClass('page-loading');
			}
		}
	};
	/* Sidebar Navigation functionality */
	var handleNav = function() {
		// Get all vital links
		var allLinks = $('.sidebar-nav a', sidebar);
		var menuLinks = $('.sidebar-nav-menu', sidebar);
		var submenuLinks = $('.sidebar-nav-submenu', sidebar);
		// Add ripple effect to all navigation links
		allLinks.on('click', function(e) {
			var link = $(this),
				ripple, d, x, y;
			// Remove .animate class from all ripple elements
			sidebar.find('.sidebar-nav-ripple').removeClass('animate');
			var ripple = link.children('.sidebar-nav-ripple');
			if(!ripple.height() && !ripple.width()) {
				d = Math.max(link.outerWidth(), link.outerHeight());
				ripple.css({
					height: d,
					width: d
				});
			}
			// Get coordinates for our ripple element
			x = e.pageX - link.offset().left - ripple.width() / 2;
			y = e.pageY - link.offset().top - ripple.height() / 2;
			// Position the ripple element and add the class .animate to it
			ripple.css({
				top: y + 'px',
				left: x + 'px'
			}).addClass('animate');
		});
		// Primary Accordion functionality
//		menuLinks.on('click', function(e) {
//			var link = $(this);
//			var windowW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
//			// If we are in mini sidebar mode
//			if(page.hasClass('sidebar-visible-lg-mini') && (windowW >= 1200)) {
//				if(link.hasClass('open')) {
//					link.removeClass('open');
//				} else {
//					$('#sidebar .sidebar-nav-menu.open').removeClass('open');
//					link.addClass('open');
//				}
//			} else if(!link.parent().hasClass('active')) {
//				if(link.hasClass('open')) {
//					link.removeClass('open');
//				} else {
//					$('#sidebar .sidebar-nav-menu.open').removeClass('open');
//					link.addClass('open');
//				}
//				// Resize Page Content
//				setTimeout(resizePageContent, 50);
//			}
//			return false;
//		});
		// Submenu Accordion functionality
//		submenuLinks.on('click', function(e) {
//			var link = $(this);
//			if(link.parent().hasClass('active') !== true) {
//				if(link.hasClass('open')) {
//					link.removeClass('open');
//				} else {
//					link.closest('ul').find('.sidebar-nav-submenu.open').removeClass('open');
//					link.addClass('open');
//				}
//				// Resize Page Content
//				setTimeout(resizePageContent, 50);
//			}
//			return false;
//		});
	};
	/* Ripple effect on click functionality */
	var rippleEffect = function(element, cl) {
		// Add required classes to the element
		element.css({
			'overflow': 'hidden',
			'position': 'relative'
		});
		// On element click
		element.on('click', function(e) {
			var elem = $(this),
				ripple, d, x, y;
			// If the ripple element doesn't exist in this element, add it..
			if(elem.children('.' + cl).length === 0) {
				elem.prepend('<span class="' + cl + '"></span>');
			} else { // ..else remove .animate class from ripple element
				elem.children('.' + cl).removeClass('animate');
			}
			// Get the ripple element
			var ripple = elem.children('.' + cl);
			// If the ripple element doesn't have dimensions set them accordingly
			if(!ripple.height() && !ripple.width()) {
				d = Math.max(elem.outerWidth(), elem.outerHeight());
				ripple.css({
					height: d,
					width: d
				});
			}
			// Get coordinates for our ripple element
			x = e.pageX - elem.offset().left - ripple.width() / 2;
			y = e.pageY - elem.offset().top - ripple.height() / 2;
			// Position the ripple element and add the class .animate to it
			ripple.css({
				top: y + 'px',
				left: x + 'px'
			}).addClass('animate');
		});
	};
	/* Sidebars Functionality */
	var handleSidebar = function(mode) {
		if(mode === 'init') {
			// Init sidebars scrolling functionality
			handleSidebar('sidebar-scroll');
			handleSidebar('sidebar-alt-scroll');
			// Handle main sidebar's scrolling functionality on resize or orientation change
			var sScrollTimeout;
			$(window).on('resize orientationchange', function() {
				clearTimeout(sScrollTimeout);
				sScrollTimeout = setTimeout(function() {
					handleSidebar('sidebar-scroll');
					if(sildeBarCall) {
						try {
							sildeBarCall()
						} catch(e) {
							//TODO handle the exception
						}
					}
				}, 150);
			});
		} else {
			var windowW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
			if(mode === 'toggle-sidebar') {
				if(windowW >= 1200) { // Toggle main sidebar in large screens (> 1200px)
					if(page.hasClass('sidebar-visible-lg-full')) {
						$('.sidebar-big').css('position','static');
						$('.sidebar-title').css({'width':'100%','padding':'0 8px'});
						page.removeClass('sidebar-visible-lg-full').addClass('sidebar-visible-lg-mini');
					} else if(page.hasClass('sidebar-visible-lg-mini')) {
						$('.sidebar-big').css('position','fixed');
						$('.sidebar-title').css({'width':'200px','padding':'0 23px'});
						page.removeClass('sidebar-visible-lg-mini').addClass('sidebar-visible-lg-full');
					} else {
						$('.sidebar-title').css({'width':'100%','padding':'0 8px'});
						$('.sidebar-big').css('position','static');
						page.addClass('sidebar-visible-lg-mini');
					}
					setTimeout(resizePageContent, 50);
				} else { // Toggle main sidebar in small screens (< 992px)
					page.toggleClass('sidebar-visible-xs');
					if(page.hasClass('sidebar-visible-xs')) {
						handleSidebar('close-sidebar-alt');
					}
				}
				handleSidebar('sidebar-scroll');
			} else if(mode === 'toggle-sidebar1'){
//				$('.sidebar-nav-menu.open').removeClass('open');
				if(windowW >= 1200) { // Toggle main sidebar in large screens (> 1200px)
					if(page.hasClass('sidebar-visible-lg-full')) {
						$('.sidebar-big').css('position','static');
						$('.sidebar-title').css({'width':'100%','padding':'0 8px'});
						page.removeClass('sidebar-visible-lg-full').addClass('sidebar-visible-lg-mini');
					} else {
					    $('.sidebar-big').css('position','static');
                        $('.sidebar-title').css({'width':'100%','padding':'0 8px'});
                        page.removeClass('sidebar-visible-lg-full').addClass('sidebar-visible-lg-mini');
					}
					setTimeout(resizePageContent, 50);
				} else {}
				handleSidebar('sidebar-scroll');
			} else if(mode === 'toggle-sidebar-open'){
//				$('.sidebar-nav-menu.open').removeClass('open');
				if(windowW >= 1200) { // Toggle main sidebar in large screens (> 1200px)
					if(page.hasClass('sidebar-visible-lg-mini')) {
						$('.sidebar-big').css('position','fixed');
						$('.sidebar-title').css({'width':'200px','padding':'0 23px'});
						page.removeClass('sidebar-visible-lg-mini').addClass('sidebar-visible-lg-full');
					} else {
						$('.sidebar-big').css('position','fixed');
					    $('.sidebar-title').css({'width':'100%','padding':'0 8px'});
						page.addClass('sidebar-visible-lg-full');
					}
					setTimeout(resizePageContent, 50);
				} else {}
				handleSidebar('sidebar-scroll');
			}
		}
	};
	/* Resize #page-content to fill empty space if exists */
	var resizePageContent = function() {
		var windowH = $(window).height();
		var headerH = header.outerHeight();
		var sidebarH = sidebar.outerHeight();
		if(header.hasClass('navbar-fixed-top') || header.hasClass('navbar-fixed-bottom')) {
			pageContent.css('min-height', windowH);
		} else if(sidebarH > windowH) {
			pageContent.css('min-height', sidebarH - headerH);
		} else {
			pageContent.css('min-height', windowH - headerH);
		}
	};
	/* Color Theme preview, preview a color theme on a page */
	/* Datatables basic Bootstrap integration (pagination integration included under the Datatables plugin in plugins.js) */
//	var dtIntegration = function() {
//		$.extend(true, $.fn.dataTable.defaults, {
//			"sDom": "<'row'<'col-sm-6 col-xs-5'l><'col-sm-6 col-xs-7'f>r>t<'row'<'col-sm-5 hidden-xs'i><'col-sm-7 col-xs-12 clearfix'p>>",
//			"sPaginationType": "bootstrap",
//			"oLanguage": {
//				"sLengthMenu": "_MENU_",
//				"sSearch": "<div class=\"input-group\">_INPUT_<span class=\"input-group-addon\"><i class=\"fa fa-search\"></i></span></div>",
//				"sInfo": "<strong>_START_</strong>-<strong>_END_</strong> of <strong>_TOTAL_</strong>",
//				"oPaginate": {
//					"sPrevious": "",
//					"sNext": ""
//				}
//			}
//		});
//		$.extend($.fn.dataTableExt.oStdClasses, {
//			"sWrapper": "dataTables_wrapper form-inline",
//			"sFilterInput": "form-control",
//			"sLengthSelect": "form-control"
//		});
//	};
	/* Print functionality - Hides all sidebars, prints the page and then restores them (To fix an issue with CSS print styles in webkit browsers)  */
	var handlePrint = function() {
		// Store all #page-container classes
		var pageCls = page.prop('class');
		// Remove all classes from #page-container
		page.prop('class', '');
		// Print the page
		window.print();
		// Restore all #page-container classes
		page.prop('class', pageCls);
	};
	return {
		init: function() {
			uiInit(); // Initialize UI
			pageLoading(); // Initialize Page Loading
		},
		sidebar: function(mode, extra) {
			handleSidebar(mode, extra); // Handle sidebars - access functionality from everywhere
		},
		datatables: function() {
			dtIntegration(); // Datatables Bootstrap integration
		},
		pagePrint: function() {
			handlePrint(); // Print functionality
		},
		setSideBarCall: function(call) {
			sildeBarCall = call;
		}
	};
}();
	return App;
})
//$(function() {
//	App.init();
//});