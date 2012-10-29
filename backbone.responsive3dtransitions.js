/*!
 * backbone.responsive3dtransitions v0.1.0
 * git://github.com/techjacker/Backbone-Responsive-3d-Page-Transitions.git
 *
 * Demos: http://projects.andrewgriffithsonline.com/#backbone-responsive-3d-page-transitions
 * Documentation: https://github.com/techjacker/Backbone-Responsive-3d-Page-Transitions
 *
 * Copyright 2012, Andrew Griffiths
 * Released under a MIT license
 *
 * Date: 2012-10-26
 */

/*jslint nomen: true, plusplus: false, sloppy: true, white:true*/
/*jshint nomen: false, curly: true, plusplus: false, expr:true, undef:true, newcap:true, latedef:true, camelcase:true  */
/*global WebKitCSSMatrix:false, _: false, Backbone: false, backbone: false, $: false, define: false, require: false, console: false, window:false */
(function (root, factory) {

	"use strict";

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['backbone'], factory);
	} else {
		// Browser globals
		root.backboneResponsive3dTransitions = factory(root.Backbone);
	}
}(this, function (Backbone) {

		"use strict";

		var threeDRouter = function (options) {

			_(this).bindAll('pageTransitionAnimation', 'calculateDirection', 'triggerTransition', 'resetCssOutmostDiv', 'calculateCssOutmostDiv', 'clearUpAfterTransition');

			if (options) {
				this.wrapElement = options.wrapElement;
				this.renderCallback = options.renderCallback;
			}
			this.callBackCounter = 0;
			this.threeDEnabled = this.csstransforms3d();
			this.domSetUp();

			Backbone.Router.apply(this, [options]);
		};

		_.extend(threeDRouter.prototype, Backbone.Router.prototype, {

			calculateCssOutmostDiv: function ($page, windowWidth, percentage) {

				(($page instanceof jQuery) || ($page = $(this.wrapElement)));

				if (!$page.size()) {
					return;
				}

				parseInt(windowWidth, 10) || (windowWidth = parseInt($(window).width(), 10));

				// calculate width and margins to transfer to outermost container
				var pageWidth   = parseInt($page.css('width'), 10),
				pageMarginRight = parseInt($page.css('margin-right'), 10),
				pageMarginLeft  = parseInt($page.css('margin-left'), 10),
				pageMinWidth    = parseInt($page.css('min-width'), 10),
				pageMaxWidth    = parseInt($page.css('max-width'), 10);

				// for browsers that return the value set in the stylesheet (not the acutal one)
				if ((!pageMarginRight && !pageMarginLeft) && (windowWidth !== pageWidth)) {
					pageMarginRight = pageMarginLeft = Math.abs((windowWidth - pageWidth) / 2);
				}
				this.trigger('threeDTrans.calculatedCssOutmostDiv');

				if (percentage === true) {
					this.cssOutmostDiv = {
						"width": (pageWidth / windowWidth * 100) + "%",
						"margin-right": (pageMarginRight / windowWidth * 100) + "%",
						"margin-left": (pageMarginLeft  / windowWidth * 100) + "%",
						"min-width": pageMinWidth,
						"max-width": pageMaxWidth
					};
				} else {
					this.cssOutmostDiv = {
						"width": pageWidth,
						"margin-right": pageMarginRight,
						"margin-left": pageMarginLeft,
						"min-width": pageMinWidth,
						"max-width": pageMaxWidth
					};
				}

				return this.cssOutmostDiv;
			},

			resetCssOutmostDiv: function () {
				this.$outmostContainer.css({
					"width": "",
					"margin-right": "",
					"margin-left": "",
					"min-width": "",
					"max-width": ""
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
					$page.parent().wrap('<div id="threeDTrans-inner-page-container" />');
					$page.parent().parent().wrap('<div class="threeDTrans-outer-page-container" />');
					$page.parent().parent().parent().wrap('<div class="threeDTrans-outmost-page-container" />');
				}

				// save variable references
				this.$outmostContainer = $('.threeDTrans-outmost-page-container');
				this.$outerContainer = this.$outmostContainer.children('.threeDTrans-outer-page-container');
				this.$innerContainer = this.$outerContainer.children('#threeDTrans-inner-page-container');
				this.$container		= this.$innerContainer.children('.threeDTrans-page-container');

				this.hasContainersNeeded = _.all([this.$outerContainer, this.$innerContainer, this.$container], function (el) {
					return $(el).size();
				});
			},

			removeTrailingSlashes: function (url) {
				// remove hash (or pound if you're american)
				url = (url.charAt(0) === '#') ? url.slice(1) : url;
				// handle cases with multiple trailing slashes
				return url.replace(/\/+$/, "");
			},

			pageTransitionAnimation: function (direction, $innerContainer, $container) {

				this.disableLinks(this.newView);

				this.$outmostContainer.css(this.calculateCssOutmostDiv());
				this.$outmostContainer.addClass('threeDTrans');

				$innerContainer.css('height', ($(window).height() - 20));
				$innerContainer.addClass('threeDTrans-inner-page-container threeDTrans-outer-page-' + direction);
				// this.callBackCounter = 1;

				// run the animation and attach the cleanup callback to the end of the animation
				$container.on("transitionend.threeDTrans mozTransitionEnd.threeDTrans webkitTransitionEnd.threeDTrans oTransitionEnd.threeDTrans MSTransitionEnd.threeDTrans", _.bind(this.pageTransitionCallback, this));
				$container.addClass('threeDTrans-animate-transform');
				setTimeout(function () {
					$container.addClass('threeDTrans-animate-' + direction);
				}, 50);
				return true;
			},

			pageTransitionCallback: function (event) {

				var $container = $(event.currentTarget),
					$pages = $container.find('.threeDTrans-page');

				// prevent callback triggering twice (for each property transition change) and removing new page as well
				if (this.callBackCounter++ === 1 && $pages.size() === 2) {
					// to be doubly sure that this isn't performed before the end of the transition then set the timeout > the animation duration (0.7s)
					((event.type === 'transitionend') && window.setTimeout(this.clearUpAfterTransition, 500, $container)) || this.clearUpAfterTransition($container);
				}
			},

			clearUpAfterTransition: function ($container) {

				$container.off(".threeDTrans");

				$container.removeClass('threeDTrans-animate-transform');
				$container.parent('#threeDTrans-inner-page-container').removeClass('threeDTrans-inner-page-container threeDTrans-outer-page-backwards threeDTrans-outer-page-forwards').css('height', '');

				$container.removeClass('threeDTrans-animate-forwards threeDTrans-animate-backwards');
				this.disposeView(this.prevView);

				this.$outmostContainer.removeClass('threeDTrans');
				this.resetCssOutmostDiv();

				this.trigger('threeDTrans.pageTransitionComplete');

				this.callBackCounter = 0;
				this.enableLinks(this.newView);
				this.pageTransInProgress = false;
			},


			disposeView: function (View) {

				if (!View) {
					return false;
				} else if (_.isFunction(View.dispose)) {
					View.dispose();
				} else {
					View.unbind();
					View.remove();
				}
			},

			insertNewPage: {
				'forwards': function () {
					var self = this;
					self.$container.append(self.newView.el);
					return self.pageTransitionAnimation('forwards', self.$innerContainer, self.$container);
				},
				'backwards': function () {
					var self = this;
					self.$container.prepend(self.newView.el);
					return self.pageTransitionAnimation('backwards', self.$innerContainer, self.$container);
				},
				// no transition needed > just straight out swap pages
				'default': function () {

					var self = this;

					self.$container.html(self.newView.el);
					self.disposeView(self.prevView);

					this.pageTransInProgress = false;
					this.callBackCounter = 0;
					this.trigger('threeDTrans.pageTransitionComplete');
				}
			},
			disableLinks: function (view) {
				setTimeout(function () {
					view.$('a').on('threeDTrans.click', function (event) {
						event && event.preventDefault() && event.stopPropagation();
					});
				}, 50);
			},
			enableLinks: function (view) {
				setTimeout(function () {
					view.$('a').off('threeDTrans.click');
				}, 50);
			},
			csstransforms3d: function () {
				// return ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
				var el = document.createElement('p'),
					has3d,
					transforms = {
						'WebkitTransform': '-webkit-transform',
						'OTransform': '-o-transform',
						'MSTransform': '-ms-transform',
						'MozTransform': '-moz-transform',
						'Transform': 'transform'
					};

				// Add it to the body to get the computed style.
				document.body.insertBefore(el, null);

				for (var t in transforms) {
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
				renderCb = _.bind(function () {
					this.newView.$el.hasClass('threeDTrans-page') || this.newView.$el.addClass('threeDTrans-page');
					_.bind(this.insertNewPage[this.calculateDirection(this.newView.hash, null, direction)], this)();
				}, this);
				// trigger page transition timing: wait for the view to emit the render event or call immediately
				(this.renderCallback && this.newView.on('render', renderCb)) || renderCb();
			}

		});

		threeDRouter.extend = Backbone.Router.extend;

		return threeDRouter;
	}));