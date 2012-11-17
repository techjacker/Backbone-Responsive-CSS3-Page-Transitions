/*!
 * backbone.responsiveCSS3transitions v0.3.1
 * git://github.com/techjacker/Backbone-Responsive-CSS3-Page-Transitions.git
 *
 * Demos: http://projects.andrewgriffithsonline.com/#backbone-responsive-CSS3-page-transitions
 * Documentation: https://github.com/techjacker/Backbone-Responsive-CSS3-Page-Transitions
 *
 * Copyright 2012, Andrew Griffiths
 * Released under a MIT license
 *
 * Date: 2012-11-16
 */

/*jslint nomen: true, plusplus: false, sloppy: true, white:true*/
/*jshint nomen: false, curly: true, plusplus: false, expr:true, undef:true, newcap:true, latedef:true, camelcase:true  */
/*global setTimeout: false, document:false, WebKitCSSMatrix:false, _: false, Backbone: false, backbone: false, $: false, define: false, require: false, console: false, window:false */
(function (root, factory) {

	"use strict";

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['backbone'], factory);
		// if using fastclick then replace the line above with this:
		// define(['backbone', 'fastclick'], factory);
	} else {
		// Browser globals
		root.backboneResponsiveCSS3Transitions = factory(root.Backbone);
	}
}(this, function (Backbone) {

		"use strict";

		var threeDRouter = function (options) {

			_(this).bindAll('pageTransitionAnimation', 'insertNewPageDefault', 'calculateDirection', 'triggerTransition', 'resetCssContainers', 'setPagePreAnimationStyles', 'clearUpAfterTransition', 'setOutmostContainerPreAnimationStyles');

			if (options) {
				this.wrapElement = options.wrapElement;
				this.renderCallback = options.renderCallback;
				this.fastClick = options.fastClick;
			}
			this.callBackCounter = 0;
			this.debugCounter = 0;
			this.threeDEnabled = this.csstransforms3d();
			this.domSetUp();

			Backbone.Router.apply(this, [options]);
		};

		_.extend(threeDRouter.prototype, Backbone.Router.prototype, {

			setOutmostContainerPreAnimationStyles: function ($page, windowWidth) {

				(($page instanceof jQuery) || ($page = $(this.wrapElement)));

				if (!$page.size()) {
					return;
				}

				parseInt(windowWidth, 10) || (windowWidth = parseInt($(window).width(), 10));

				// calculate width and margins to transfer to outermost container
				var pageWidth   = parseInt($page.css('width'), 10),
				pageMinWidth    = parseInt($page.css('min-width'), 10),
				pageMaxWidth    = parseInt($page.css('max-width'), 10),
				pageMarginRight = parseInt($page.css('margin-right'), 10),
				pageMarginLeft  = parseInt($page.css('margin-left'), 10);

				// for browsers that return the value set in the stylesheet (not the acutal one)
				if ((!pageMarginRight && !pageMarginLeft) && (windowWidth !== pageWidth)) {
					pageMarginRight = pageMarginLeft = Math.abs((windowWidth - pageWidth) / 2);
				}

				this.cssOutmostDiv = {
					"height": $(window).height(),
					"width": pageWidth,
					"margin-right": pageMarginRight,
					"margin-left": pageMarginLeft,
					"min-width": pageMinWidth,
					"max-width": pageMaxWidth
				};

				this.$outmostContainer.css(this.cssOutmostDiv);

				this.trigger('threeDTrans.setOutmostContainerPreAnimationStyles');

				return this.cssOutmostDiv;
			},

			resetCssContainers: function () {

				this.$outmostContainer.css({
					"width": "",
					"height": "",
					"margin-right": "",
					"margin-left": "",
					"min-width": "",
					"max-width": ""
				});

				this.newView.$el.css({
					"width": "",
					"height": ""
				});
			},

			domSetUp: function () {

				// class you need to add to your page's container element if you want js to wrap with the needed html
				// it is recommended you just add the html yourself to your main template for performance reasons
				var $page, cssOutmostDiv;

				// wrap target element if chosen as an option
				if (this.wrapElement && ($page = $(this.wrapElement)).size()) {

					// added wrapping divs needed
					$page.wrap('<div class="threeDTrans-page-container" />');
					$page.parent().wrap('<div class="threeDTrans-outmost-page-container" />');
				}

				// save variable references
				this.$outmostContainer = $('.threeDTrans-outmost-page-container');
				this.$container = this.$outmostContainer.children('.threeDTrans-page-container');

				this.hasContainersNeeded = _.all([this.$outmostContainer, this.$container], function (el) {
					return $(el).size();
				});
			},

			removeTrailingSlashes: function (url) {
				// remove hash (or pound if you're american)
				url = (url.charAt(0) === '#') ? url.slice(1) : url;
				// handle cases with multiple trailing slashes
				return url.replace(/\/+$/, "");
			},

			setPagePreAnimationStyles: function () {

				var cssPages = {
					"width" : this.cssOutmostDiv.width,
					"height" : this.cssOutmostDiv.height
				};
				this.newView.$el.css(cssPages);
				this.initialLoad || this.prevView.$el.css(cssPages);
			},

			insertNewPageBeforeAnimation: function (direction) {
				if (direction === "backwards") {
					this.$container.addClass('threeDTrans-page-container-' + direction);
					this.$container.prepend(this.newView.el);
				} else {
					this.$container.addClass('threeDTrans-page-container-' + direction);
					this.$container.append(this.newView.el);
				}
			},
			pageTransitionAnimation: function (direction, $container) {

				var cssPages,
					pageTransitionCallback = _.bind(this.pageTransitionCallback, this);

				// stop animation queues from building up
				this.disableLinks(this.newView);

				// fix container widths in pixels
				this.setOutmostContainerPreAnimationStyles();
				this.setPagePreAnimationStyles();

				// add absolute positioning styles
				this.$outmostContainer.addClass('threeDTrans');

				// insert new page
				this.insertNewPageBeforeAnimation(direction);

				// debugging
				this.newView.$('h1').html(++this.debugCounter);

				// run the animation and attach the cleanup callback to the end of the animation
				if (_($.browser).has('mozilla') && $.browser.mozilla === true) {
					// ff uses the unprefixed version but will also fire for the other vendor prefixes
					// > hence the need for this conditional to prevent the callback triggering multiple
					// times for each page transition
					$container.on("transitionend.threeDTrans", pageTransitionCallback);
				} else {
					$container.on("webkitTransitionEnd.threeDTrans oTransitionEnd.threeDTrans MSTransitionEnd.threeDTrans", pageTransitionCallback);
				}

				// add the animation class
				$container.addClass('threeDTrans-animate-transform');
				setTimeout(function () {
					// add the translate3d classes on next-tick
					$container.addClass('threeDTrans-animate-' + direction);
				}, 50);

				return true;
			},

			pageTransitionCallback: function (event) {

				var $container = $(event.currentTarget),
					$pages = $container.find('.threeDTrans-page');

				// prevent callback triggering twice (for each property transition change) and removing new page as well
				if (this.callBackCounter++ === 1 && $pages.size() === 2) {
					this.clearUpAfterTransition($container);
				}
			},

			clearUpAfterTransition: function ($container) {

				$container.off(".threeDTrans");
				$container.removeClass('threeDTrans-animate-transform');

				$container.removeClass('threeDTrans-animate-forwards threeDTrans-animate-backwards');

				this.disposeView(this.prevView);
				$container.removeClass('threeDTrans-page-container-backwards threeDTrans-page-container-forwards');

				this.$outmostContainer.removeClass('threeDTrans');
				this.resetCssContainers();

				this.enableLinks(this.newView);

				this.callBackCounter = 0;
				this.pageTransInProgress = false;
				this.trigger('threeDTrans.pageTransitionComplete');
			},

			disableLinks: function (view) {
				setTimeout(function () {
					view.$('a').on('threeDTrans.click', function (event) {
						event && event.preventDefault() && event.stopPropagation();
					});
				}, 50);
			},
			enableLinks: function (view) {
				// remove click delay if requested
				if (this.fastClick !== undefined && _.isFunction(this.fastClick)) {
					new this.fastClick(view.el);
				}

				setTimeout(function () {
					view.$('a').off('threeDTrans.click');
				}, 50);
			},

			unbindViewRenderCallback: function (View) {
				View.renderCb && View.off('render', View.renderCb);
			},
			disposeView: function (View) {

				if (!View) {
					return false;
				} else if (_.isFunction(View.dispose)) {
					this.unbindViewRenderCallback(View);
					View.dispose();
				} else {
					this.unbindViewRenderCallback(View);
					View.unbind();
					View.remove();
				}
			},

			insertNewPageDefault: function () {
				this.$container.html(this.newView.el);
			},

			insertNewPage: {
				'forwards': function () {
					var self = this;
					return self.pageTransitionAnimation('forwards', self.$container);
				},
				'backwards': function () {
					var self = this;
					return self.pageTransitionAnimation('backwards', self.$container);
				},
				// no transition needed > just straight out swap pages
				'default': function () {

					this.insertNewPageDefault();
					this.disposeView(this.prevView);

					this.pageTransInProgress = false;
					this.callBackCounter = 0;
					this.trigger('threeDTrans.pageTransitionComplete');


				}
			},

			csstransforms3d: function () {
				// return ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
				var el = document.createElement('p'),
					has3d,
					t,
					transforms = {
						'WebkitTransform': '-webkit-transform',
						'OTransform': '-o-transform',
						'msTransform': '-ms-transform',
						'MozTransform': '-moz-transform',
						'Transform': 'transform'
					};

				// Add it to the body to get the computed style.
				document.body.insertBefore(el, null);

				for (t in transforms) {
					if (el.style[t] !== undefined) {
						el.style[t] = "translate3d(1px,1px,1px)";
						has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
					}
				}

				document.body.removeChild(el);

				return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
			},

			calculateDirection: function (newPageHash, lastPageHash, direction) {

				var calculateDepth = _.bind(function (str) {
						str = str && str.replace(this.defaultView, '');
						return (str && str.length) ? str.split('/').length : 0;
					}, this),
					newPageDepth, lastPageDepth, slideDirection = 'default';

				if (!this.initialLoad && this.threeDEnabled && this.hasContainersNeeded) {

					if (direction && _.has(this.insertNewPage, direction)) {
						return direction;
					}

					if (_.isString(newPageHash)) {
						lastPageHash = lastPageHash || (this.prevView && this.prevView.hash) || '';
						newPageDepth = calculateDepth(newPageHash);
						lastPageDepth = calculateDepth(lastPageHash);

						if (newPageDepth !== lastPageDepth) {
							slideDirection = (newPageDepth > lastPageDepth) ? 'forwards' : 'backwards';
						}
					}
				}
				return this.direction = slideDirection;
			},

			triggerTransition: function (ViewClass, opts) {

				var renderCb, viewInitOpts, direction, renderParams;

				if (this.pageTransInProgress === true || this.callBackCounter !== 0) {
					return false;
				}

				// stop animations from queuing up
				this.pageTransInProgress = true;
				this.callBackCounter = 1;

				if (opts) {
					renderParams = opts.renderParams;
					viewInitOpts = _.isObject(opts.viewInitOpts) && opts.viewInitOpts;
					direction = opts.direction;
				}
				// save reference to previous view and set boolean initalLoad
				this.prevView = this.newView;
				this.initialLoad = !(_.isObject(this.prevView));

				// initialise new view and its subviews && save ref to hash
				this.newView = (new ViewClass(viewInitOpts));
				this.newView.hash || (this.newView.hash = this.removeTrailingSlashes(window.location.hash));


				// 0. render the new view 1. insert new page, 2. add zero margins
				this.newView.render(renderParams);
				this.newView.$el.addClass('threeDTrans-no-margin-width');

				// trigger page transition if not just arrived at website
				this.newView.renderCb = _.bind(function () {
					this.newView.$el.hasClass('threeDTrans-page') || this.newView.$el.addClass('threeDTrans-page');
					_.bind(this.insertNewPage[this.calculateDirection(this.newView.hash, null, direction)], this)();
				}, this);

				// trigger page transition timing: wait for the view to emit the render event or call immediately
				(this.renderCallback && this.newView.on('render', this.newView.renderCb)) || this.newView.renderCb();
			}

		});

		threeDRouter.extend = Backbone.Router.extend;

		return threeDRouter;
	}));