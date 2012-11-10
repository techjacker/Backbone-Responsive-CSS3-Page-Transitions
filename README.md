# Backbone Responsive CSS3 Page Transitions

Adds responsive CSS3 page transitions to backbone.

If the browser does not support CSS3 hardware accelerated transitions then the plugin falls back to plain old $el.html('new html') replacing html.

### [Responsive CSS Framework Demos](http://projects.andrewgriffithsonline.com/#backbone-responsive-CSS3-page-transitions)

Works on Chrome 12+, Safari 4+, Firefox 14+, ie 10+, Android 2.1+

Lightweight: 3k (minified + gzipped)

Require.js AMD compatible

Tested to work with the following reponsive CSS frameworks:
- twitter bootstrap*
- foundation*
- skeleton
- simplegrid

\* Make sure you grab the responsive versions of these.

[Demos](http://projects.andrewgriffithsonline.com/#backbone-responsive-CSS3-page-transitions) of the CSS frameworks @ [the project homepage](http://projects.andrewgriffithsonline.com/#backbone-responsive-CSS3-page-transitions)

Demo code available from the [github repo](https://github.com/techjacker/Backbone-CSS3-Page-Transitions-CSS-Frameworks-Demos)


## Getting Started
### 1. Load the Javascript and CSS
		<!-- ... -->
		<link rel="stylesheet" href="scripts/vendor/backbone.responsiveCSS3transitions.min.css"/>
	</head>

	<body>
		<!-- ... -->

		<script src="http://code.jquery.com/jquery-1.7.2.min.js"></script>
		<script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.2/underscore-min.js"></script>
		<script src="//cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2/backbone-min.js"></script>

		<script src="backbone.responsiveCSS3transitions.min.js"></script>

#### AMD
Plugin relies upon 'backbone' as a dependency. Make sure that this is set up in your require.js [shim config](https://github.com/jrburke/requirejs/wiki/Upgrading-to-RequireJS-2.0#wiki-shim).

### 2. HTML Set Up: Wrapping Divs

#### Either: 1. wrap your container div with the wrapping divs needed manually
	<div class="threeDTrans-outmost-page-container">
		<div class="threeDTrans-page-container">

			<!-- your container -->
			<div id="my-container" class="threeDTrans-page"">
				<p>my amazing website...</p>
			</div>

		</div>
	</div>

#### Or 2. Specify the jquery selector of the containing element when initiliasing the router
	var threeDRouter = backboneResponsiveCSS3Transitions.extend({....});
	var my Router = new threeDRouter({"wrapElement": ".my-container"});


### 3. Make your router inherit from backboneResponsiveCSS3Transitions instead of Backbone.Router

	var threeDRouter = backboneResponsiveCSS3Transitions.extend({...});
	new threeDRouter();

	// your view....
	var myBackboneView = Backbone.View.extend({
		className: 'my-container',
		render: function () {
			this.$el.html('the html of the new page to be inserted');
		}
	});

	// your router class loading your view
	var threeDRouter = backboneResponsiveCSS3Transitions.extend({
		routes: {
			"*default": "loadView",
		},
		loadView: function (viewFragment) {
			// ...
			this.triggerTransition(myBackboneView, options);
		}
	});

	// your app instantiaing the router
	app = {
		// ...
		init: function() {
			new threeDRouter(options);
			Backbone.history.start();
		}
	}
	app.init();


#### Router Instantiation Options

@param {options}
accepts: object

@param {options.renderCallback}
accepts: boolean
description: make the page transitions wait for the render event to be emitted before triggering the page animation. Useful if you're loading templates with ajax.

	// ... set the renderCallback option to true when initialising your router
	var threeDRouter = backboneResponsiveCSS3Transitions.extend({....});
	threeDRouter = new threeDRouter({"renderCallback": true});

	// ...in your view class...
	var myBackboneView = Backbone.View.extend({
		// ...
		render: function () {
			// ...
			this.trigger('render');
		}
	});


@param {options.wrapElement}
accepts: boolean
description: the jquery selector of the html element that contains your content. If you want the js to take care of adding the wrapping divs then set this. **** If you choose this option then the html element must be present on the page when the router is instantiated. If it is inside one of your backbone views that hasn't been loaded onto the page yet on first page load then it will fail miserably ****

	var threeDRouter = backboneResponsiveCSS3Transitions.extend({....});
	new threeDRouter({"wrapElement": ".my-container"});



### 4. Use this.triggerTransition(ViewClass, options) in your router's routes' callbacks to trigger the page transition

	var threeDRouter = backboneResponsiveCSS3Transitions.extend({
		initialize: function (opts) {
			// ...
		},
		routes: {
			"*default": "loadView",
		},

		loadView: function (viewFragment) {

			// ... your own route logic here
			// @param {ViewClass} (mandatory) > the backbone view class that you want to load
			// @param {options}
			this.triggerTransition(ViewClass, options);
		}
	});

#### Parameters

##### ViewClass
The backbone view class of the new page to be inserted.
It's render method will be called before inserting it into the new page.
@param {viewClass}
accepts: Backbone View Class

#### options object
@param {options}
accepts: object

@param {options.viewInitOps}
accepts: object
description: passed as the options object when instantiating the new view

@param {options.renderParams}
accepts: any type
description: passed as params when calling the new view render's method

@param {options.direction}
accepts: string ("backwards", "forwards", "default")
description: manually override direction calculation by supplying your own value
default = just swaps the new page html without applying a sliding transition


#### Events
The 'threeDTrans.pageTransitionComplete' event is triggered by the router when the page transition is complete.


### 5. Direction of the page transition

The direction is automatically calculated based upon comparing the folder depths of the new and previous url hashes.
The default is no transition ie just replace html.

- backwards: moving from #sports/football/premiership to #sports
- forwards: moving from #sports to #sports/football
- default: moving from #sports/football to #sports/rugby

#### You can manually override this by specifying the direction yourself when calling the this.triggerTransition() method, eg:
	var threeDRouter = backboneResponsiveCSS3Transitions.extend({
		// ...
		routes: {
			"*default": "loadView",
		},
		loadView: function (viewFragment) {
			if (viewFragment.match(/foobar/)) {
				this.triggerTransition(myView, {"direction": "forwards"});
			} else {
				this.triggerTransition(myView);
			}
		}
	});



## Example Code
		<!-- ... -->
		<link rel="stylesheet" href="scripts/vendor/backbone.responsiveCSS3transitions.min.css"/>
	</head>

	<body>
		<!-- ... -->

		<script src="http://code.jquery.com/jquery-1.7.2.min.js"></script>
		<script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.2/underscore-min.js"></script>
		<script src="//cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2/backbone-min.js"></script>

		<script src="backbone.responsiveCSS3transitions.min.js"></script>

		<script>
		var threeDRouter = backboneResponsiveCSS3Transitions.extend({
			initialize: function (opts) {
				// ...
			},
			routes: {
				// ... your own route logic here
				"*default": "loadView",
			},
			loadView: function (viewFragment) {

				var myBackboneView = Backbone.View.extend({
					className: 'my-container',
					template: 'application.ejs',
					loadTemplate: function (vars, name, dir) {
						var self = this;
						vars = vars || {};
						dir = dir || 'scripts/templates/';
						name = name || this.template;
						return $.get(dir + name).pipe(function (tmpl) {
							tmpl = _.template(tmpl);
							self.$el.html(tmpl(vars));
							self.trigger('render');
						});
					},
					render: function () {
						this.loadTemplate({ foo: urlParams});
					}
				}),
				options = {
					direction: "forwards",
					renderParams: "imprenderParams",
					viewInitOps: {
						"yourImportantViewInitUpVars" : "here"
					}
				};

				// ... your own route logic here

				this.triggerTransition(myBackboneView, options);
			}
		});

		var options = {
				"renderCallback": true,
				"wrapElement": ".my-container"
			},
		myRouter = new threeDRouter(options);

		Backbone.history.start();

		</script>
	</body>


## Centered Designs with outer gutters
As used in all the [demos](http://projects.andrewgriffithsonline.com/#backbone-responsive-CSS3-page-transitions).

Apply the margins to the target wrapping element, eg:

	// specify the wrapping div when instantiating the router...
	new threeDRouter({"wrapElement": ".my-container"});

	// in your stylesheet...
	.my-container {
		width: 90%;
		max-width: 1000px !important;
		margin:0 auto;
		padding:0 5%;
	}


## Caveats / Gotchas / Why isn't it working???
1. Ensure that your Backbone Views have a render method
The backboneResponsiveCSS3Transitions will insert the new view.$el into the page once it has called the render method.
If your view emits a render event and you would like the page animation to be delayed until this is emitted then set this an option when instantiating the router.
2. The router takes care of inserting the views on to the page - do not include this logic in your views!
3. If the browser does not support CSS3 transitions then they fall back to just plain old $el.html('new html') replacing html.
4. If you want the js to take care of adding the wrapping divs then the html element must be present on the page when the router is instantiated.
5. The wrapping element's immediate children should have 100% width for gutter effect to work
ie this works
	.wrapper {width: 90%; margin: 0 auto;}
	.child {width:auto;}
ie this WON'T work
	.wrapper {width: 100%;}
	.child {padding:0 15%;}



## Tests
Run the tests:

1. $ node server.js
2. go to http://0.0.0.0:8124/test.html


## To do
- Add iScroll functionality so that page transitions always take you to the top of the new page. Currently scrolling is left up to the browser.
- Add more tests


## Release History
0.1.0
0.2.0 - Added Android Support