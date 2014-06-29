// NATIVE NODE MODULES
var fs = require('fs'),
		path = require('path');

// NON-NATIVE MODULES
var es = require('event-stream'),
		gulp = require('gulp'),
		sass = require('gulp-sass'),
		clean = require('gulp-clean'),
		prefix = require('gulp-autoprefixer'),
		uglify = require('gulp-uglify'),
		concat = require('gulp-concat'),
		jshint = require('gulp-jshint'),
		gulpif = require('gulp-if'),
		cssmin = require('gulp-minify-css'),
		stylish = require('jshint-stylish'),
		imagemin = require('gulp-imagemin'),
		filesize = require('gulp-filesize'),
		preprocess = require('gulp-preprocess'),
		browserSync = require('browser-sync');

var assetsPath = './assets/';
var isBrowserSyncReady = false;

/*
function removeArrayItem(arr) {
	console.log(arguments);
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax= arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}
*/

function getFolders(dir) {
	return fs.readdirSync(dir)
		.filter(function(file) {
			return fs.statSync(path.join(dir, file)).isDirectory();
		});
}

// FROM RECIPE: https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md

gulp.task('assets', function() { 
	// Get folders and filter out js/css (already filtered out earlier)
	// var folders = removeArrayItem(getFolders(assetsPath), ['css', 'js']);
	var folders = getFolders(assetsPath);
	// Executes the function once per folder, and returns the async stream
	var tasks = folders.map(function(folder) {
		return gulp.src(path.join(assetsPath, folder, '/*'))
			.pipe(gulp.dest('build/assets/' + folder))
	});
	// Combines the streams and ends only when all streams emitted end. 
	// The call to .apply(null, args) is needed as es.concat expects arguments not an array
	return es.concat.apply(null, tasks);
});

gulp.task('sass', function() {
	return gulp.src('assets/css/*.scss')
		.pipe(sass())
		.pipe(prefix("last 2 versions", "ie 10", "ie 9", {map: false }))
		.pipe(concat('styles.css'))
		.pipe(gulp.dest('build/assets/css'))
		.pipe(gulpif(isBrowserSyncReady, browserSync.reload({stream:true})));
});

gulp.task('html', function() {
	return gulp.src(['*.html', '!includes/']) // IGNORE INCLUDES
		.pipe(preprocess({includeBase: 'includes'}))
		.pipe(gulp.dest('build'))
		.pipe(gulpif(isBrowserSyncReady, browserSync.reload({stream:true})));
});

gulp.task('js', function() {
	return gulp.src('assets/js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest('build/assets/js'))
});

gulp.task('browser-sync', function() {
	browserSync.init(null, {
		server: {
			baseDir: "./build"
		}
	});
});


// OPTIMIZATION TASKS
gulp.task('clean', function () {
	return gulp.src('build/*', {read: false})
		.pipe(clean());
});

gulp.task('min-img', function() {
	return gulp.src('build/assets/img/*')
		.pipe(imagemin())
		.pipe(gulp.dest('build/assets/img'));
});

gulp.task('min-js', function() {
	return gulp.src('build/assets/js/*.js')
		.pipe(concat('scripts.js'))
		.pipe(filesize())
		.pipe(uglify())
		.pipe(filesize())
		.pipe(gulp.dest('build/assets/js'))
});

gulp.task('min-css', function() {
	return gulp.src('build/assets/css/*.css')
		.pipe(concat('style.css'))
		.pipe(filesize())
		.pipe(cssmin())
		.pipe(filesize())
		.pipe(gulp.dest('build/assets/css'))
});



// OUR EXPOSED TASKS (Make others private when Gulp allows it)
// =================
// gulp (default)
// gulp optmizie

// Default task: move stuff to build on change, start a server and inject/reload
gulp.task('default', ['sass', 'html', 'js', 'assets', 'browser-sync'], function () {
	isBrowserSyncReady = true;
	gulp.watch('assets/css/*.scss', ['sass']);
	gulp.watch('assets/js/*.js', ['js']);
	// If it's not JS or SCSS/CSS just move to build
	gulp.watch(['assets/**/*', '!assets/css/**/*', '!assets/js/**/*'], ['assets']); 
	gulp.watch(['*.html', 'partials/*.html'], ['html']);
});

// Optimize task: Clean build folder, move over files and process, minify/concat stuff and fire up server
gulp.task('rebuild', ['sass', 'html', 'js', 'assets', 'min-img', 'min-js', 'min-css', 'browser-sync']);
gulp.task('optimize', ['clean'], function() { // Make sure clean completes before everything else
	gulp.run('rebuild');
});



// REPLICATING HAMMER-FOR-MAC FUNCTIONALITY IN GULP.JS (COMPLETED!)
// Live-reload, compile sass, html partials, auto prefix css, move all assets to build
// JSHint scripts, uglify js, concat js, optimize images, concat css, minify css

// TODO
// Test with vendor sub-directories in assets folders
// Don't run JSHint on vendor js
// Cache file changes? Most likely not needed when using gulp.watch?
// Smarter css includes? Like hammers @javascript & @stylesheet