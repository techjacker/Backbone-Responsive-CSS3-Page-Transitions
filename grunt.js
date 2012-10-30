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
/*global define: false, require: false, console: false, window:false, module:false */

module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-css');

	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner:
				'/*!\n' +
				' * <%= pkg.name %> v<%= pkg.version %>\n' +
				' * <%= pkg.repository.url %>\n' +
				' *\n' +
				' * Demos: <%= pkg.homepage %>\n' +
				' * Documentation: <%= pkg.github %>\n' +
				' *\n' +
				' * Copyright <%= grunt.template.today("yyyy") %>, <%= pkg.author %>\n' +
				' * Released under a <%= pkg.license %> license\n' +
				' *\n' +
				' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				' */'
		},
		qunit: {
			all: ['test.html']
		},
		min: {
			dist: {
				src: ['<banner>', 'backbone.responsiveCSS3transitions.js'],
				dest: 'backbone.responsiveCSS3transitions.min.js'
			}
		},
		cssmin: {
			css: {
				src: 'backbone.responsiveCSS3transitions.css',
				dest: 'backbone.responsiveCSS3transitions.min.css'
			}
		},
		lint: {
			files: ['backbone.responsiveCSS3transitions.js', 'server.js', 'grunt.js', 'test.js', 'package.json', 'component.json']
		},
		jshint: {
			options: {
				nomen: false,
				curly: true,
				plusplus: false,
				expr: true,
				unused:false,
				undef: true,
				newcap: true,
				latedef: true,
				camelcase: true
			},
			globals: {
				jQuery: true
			}
		},
		uglify: {}
	});

	grunt.registerTask('default', 'lint qunit min cssmin');
};