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
		stylish = require('jshint-stylish'),
		imagemin = require('gulp-imagemin'),
		preprocess = require('gulp-preprocess'),
		browserSync = require('browser-sync');


var assetsPath = './assets/';

function removeArrayItem(arr) {
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax= arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}

function getFolders(dir) {
	return fs.readdirSync(dir)
		.filter(function(file) {
			return fs.statSync(path.join(dir, file)).isDirectory();
		});
}

// FROM RECIPE: https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md

gulp.task('assets', function() { 
	// Get folders and filter out js/css
	var folders = removeArrayItem(getFolders(assetsPath), 'css', 'js');
	// Executes the function once per folder, and returns the async stream
	var tasks = folders.map(function(folder) {
		return gulp.src(path.join(assetsPath, folder, '/*'))
			.pipe(gulp.dest('build/assets/' + folder))
	});
	// Combines the streams and ends only when all streams emitted end. 
	// The call to .apply(null, args) is needed as es.concat expects arguments not an array
	return es.concat.apply(null, tasks);
});

gulp.task('browser-sync', function() {
	browserSync.init(null, {
		server: {
			baseDir: "./build"
		}
	});
});

gulp.task('images', function() {
	return gulp.src('assets/img/*')
		.pipe(imagemin())
		.pipe(gulp.dest('build/assets/img'));
});

gulp.task('sass', function() {
	return gulp.src('assets/css/*.scss')
		.pipe(sass())
		.pipe(prefix("last 2 versions", "ie 10", "ie 9", {map: false }))
		.pipe(gulp.dest('build/assets/css'))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('html', function() {
	return gulp.src(['*.html', '!includes/']) // IGNORE INCLUDES
		.pipe(preprocess({includeBase: 'includes'}))
		.pipe(gulp.dest('build'))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('js', function() {
	return gulp.src('assets/js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(gulp.dest('build/assets/js'))
});

gulp.task('min-js', function() {
	return gulp.src('assets/js/*.js')
		.pipe(concat('scripts.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build/assets/js'))
});

gulp.task('clean', function () {
	return gulp.src('build/*', {read: false})
		.pipe(clean());
});

// Default task to be run with `gulp`
// Run 'Clean' before to clean up excess files
gulp.task('default', ['sass', 'html', 'js', 'images', 'browser-sync'], function () {
	gulp.watch('assets/css/*.scss', ['sass']);
	gulp.watch('assets/js/*.js', ['js']);
	gulp.watch(['*.html', 'partials/*.html'], ['html']);
});

gulp.task('publish', ['clean', 'sass', 'html', 'min-js'])


// REPLICATING HAMMER-FOR-MAC FUNCTIONALITY IN GULP.JS

// COMPLETED
// Live-reload, compile sass, html partials, auto prefix css
// JSHint scripts, uglify js, concat js, optimize images

// TODO
// Concatenate css, Cache file changes if needed?, Move other assets (fonts/images/video etc.) to build?
// Probably move scripts/styles to top-level. Assets for misc. resources like video, fonts and so on? Check out examples!

// EXTRAS
// File size diffs (after/before uglify), Optimized build mode,