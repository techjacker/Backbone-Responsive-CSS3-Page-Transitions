/*!
 * backbone.responsiveCSS3transitions v0.1.0
 * git://github.com/techjacker/Backbone-Responsive-CSS3-Page-Transitions.git
 *
 * Demos: http://projects.andrewgriffithsonline.com/#backbone-responsive-CSS3-page-transitions
 * Documentation: https://github.com/techjacker/Backbone-Responsive-CSS3-Page-Transitions
 *
 * Copyright 2012, Andrew Griffiths
 * Released under a MIT license
 *
 * Date: 2012-10-26
 */

/*jslint nomen: true, plusplus: false, sloppy: true, white:true*/
/*jshint nomen: false, curly: true, plusplus: false, expr:true, undef:true, newcap:true, latedef:true, camelcase:true  */
/*global WebKitCSSMatrix:false, stop: false, start:false,  _: false, Backbone: false, backbone: false, $: false, strictEqual: false, ok: false, equal: false, deepEqual: false, define: false, require: false, console: false, window:false, module:false, test:false, expect:false, equals:false, ok:false */

window.TestRunnerQunit = (function() {

	"use strict";

	var testRunner = {
		"run": function () {
			// config.mockApi({"testDirectory": true});
			tests();
		}
	};

	var tests = function () {

		var ThreeDRouter = window.backboneResponsiveCSS3Transitions;

		module('Backbone.js 3dtransitions', {

			setup: function () {

				this.$target = $('#target');
				// $('#qunit-fixture').append('<div id="target" class="threedtransitions-wrap-me"></div>');
				// this.list = new ThreeDRouter({"wrapElement": ".threedtransitions-wrap-me"});
			},
			teardown: function () {
			}
		});

		test("this.domSetUp() >> Js should wrap the target element with the necessary classes if included as an opion", function () {

			expect(3);

			var	$parent, $grandParent, $greatGrandParent,
				options = {"wrapElement": ".threeDTrans-wrap-me"},
				router = new ThreeDRouter(options);

			// options are being appplied to class vars
			strictEqual(router.wrapElement, options.wrapElement, 'wrapElement should be set if passed as an option when instantiating the router');

			// add container divs if told to by wrapElement option
			$parent             = this.$target.parent();
			$grandParent        = $parent.parent();

			ok($parent.hasClass('threeDTrans-page-container'), 'wrapped parent element should have class: "threeDTrans-page-container"');
			ok($grandParent.hasClass('threeDTrans-outmost-page-container'), 'wrapped great-grand-parent element should have class: "threeDTrans-outmost-page-container"');
		});

		// set variable to check whether all container divs have been added
		test("this.domSetUp() >> all containers have been added check", function () {

			expect(2);

			var	wrapOptions = {"wrapElement": ".threeDTrans-wrap-me"},
				router = new ThreeDRouter();

			ok(!router.hasContainersNeeded, 'hasContainers should return false');

			router = new ThreeDRouter(wrapOptions);
			ok(router.hasContainersNeeded, 'hasContainers should return true');
		});


		// check the outer margins are being calculated correctly
		test("this.setOutmostContainerPreAnimationStyles() >> set CSS needed for animation on outmost div", function () {

			expect(3);

			var	router = new ThreeDRouter(),
				windowWidth = 1000,
				dimensions = {
					"width": 800,
					"margin-right": 100,
					"margin-left": 100
				},
				$page = this.$target.clone(),
				called = 0,
				css;

			// overwrite the native jquery css method to return our values
			$page.css = function(attr) {
				return dimensions[attr];
			};

			router.on('threeDTrans.setOutmostContainerPreAnimationStyles', function () {
				called++;
			});

			css = router.setOutmostContainerPreAnimationStyles($page, windowWidth);
			strictEqual(css["margin-right"], 100, 'right margin should still be 100');
			strictEqual(css["margin-left"], 100, 'left margin should still be 100');

			strictEqual(called, 1, 'threeDTrans.calculatedCssOutmostDiv event should have been emitted 3 times');
		});


		test("this.calculateDirection() >> calculates correct direction for animation", function () {

			expect(9);

			var	wrapOptions = {"wrapElement": ".threeDTrans-wrap-me"},
				router		= new ThreeDRouter(),
				csstransforms3d = router.csstransforms3d();
			strictEqual(router.calculateDirection(), 'default', 'direction on first page load should = "default"');

			// safety checks >> should default to "default"
			strictEqual(router.calculateDirection('deep'), 'default', 'if container divs are not present then direction should = "default"');
			strictEqual(router.calculateDirection('', 'deep'), 'default', 'if container divs are not present then direction should = "default"');

			// back/forwards direction correct
			router = new ThreeDRouter(wrapOptions);
			strictEqual(router.calculateDirection('deeper'), (csstransforms3d && 'forwards' || 'default'), 'direction should = "forwards" or "default" if browser does not support 3d transitions');
			strictEqual(router.calculateDirection('index', "somewhere/deep/inside"), (csstransforms3d && 'backwards' || 'default'), 'direction should = "backwards" or "default" if browser does not support 3d transitions');
			strictEqual(router.calculateDirection('', "even/somewhere/deep/inside"), (csstransforms3d && 'backwards' || 'default'), 'direction should = "backwards" or "default" if browser does not support 3d transitions');

			// manually override direction correct
			router = new ThreeDRouter(wrapOptions);
			strictEqual(router.calculateDirection(null, null, 'forwards'), (csstransforms3d && 'forwards' || 'default'), 'should be able to manually override direction should = "forwards" or "default" if browser does not support 3d transitions');
			strictEqual(router.calculateDirection(null, null, 'backwards'), (csstransforms3d && 'backwards' || 'default'), 'should be able to manually override direction should = "backwards" or "default" if browser does not support 3d transitions');
			strictEqual(router.calculateDirection(null, null, 'not allowed'), ('default'), 'should default the direction to "default" if "forwards" or "backwards" are not supplied as values');
		});


		test("this.renderCallback >> should wait for the renderCallback event to be emitted by the new view before triggering the page transition", function () {

			stop();
			expect(2);

			var	myBackboneView = Backbone.View.extend({
					className: 'threeDTrans-wrap-me',
					render: function () {
						var self = this;
						window.setTimeout(function() {
							self.trigger('render');
							self.$el.html('blah blah blah');
						}, 50);
					}
				}),
				wrapOptions = {
					"wrapElement": ".threeDTrans-wrap-me",
					"renderCallback": true
				},
				router = new ThreeDRouter(wrapOptions),
				called = false;

			// add the callback for the page transition
			router.on('threeDTrans.pageTransitionComplete', function () {
				called = true;
				ok(called, 'reset event triggered by default when reset sort order');
				start();
			});

			// trigger the transition
			router.triggerTransition(myBackboneView);

			// the page transition not take place until the render event is emitted
			ok(!called, 'the page transition should not be triggered until the render event is emitted by the view');
		});

	};


	return testRunner;
})();