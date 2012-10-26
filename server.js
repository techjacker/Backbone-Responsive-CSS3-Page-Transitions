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
/*global process: false, define: false, require: false, console: false, window:false */

var http = require('http');
var url  = require('url');
var path = require('path');
var fs   = require('fs');

http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname;
	var filename = path.join(process.cwd(), uri);

	fs.readFile(filename, 'binary', function(err, file) {
		if (err) {
			response.writeHead(500, { 'Content-Type': 'text/plain' });
			response.write(err + '\n');
			response.end();
			return;
		}

		response.writeHead(200, filename.match(/\.js$/) ? { 'Content-Type': 'text/javascript' } : {});
		response.write(file, 'utf-8');
		response.end();
	});
}).listen(8124, '0.0.0.0');

console.log('Test suite at http://0.0.0.0:8124/test.html');
