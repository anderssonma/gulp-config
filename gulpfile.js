var gulp = require('gulp'),
		sass = require('gulp-sass'),
		clean = require('gulp-clean'),
		prefix = require('gulp-autoprefixer'),
		uglify = require('gulp-uglify'),
		concat = require('gulp-concat'),
		jshint = require('gulp-jshint'),
		stylish = require('jshint-stylish'),
		preprocess = require('gulp-preprocess'),
		browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
  browserSync.init(null, {
    server: {
      baseDir: "./build"
    }
  });
});

gulp.task('sass', function() {
	return gulp.src('assets/css/*.scss')
		.pipe(sass())
		.pipe(prefix("last 2 versions", "ie 10", "ie 9"))
		.pipe(gulp.dest('build/assets/css'))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('html', function() {
	return gulp.src(['*.html', 'partials/*.html'])
		.pipe(preprocess({context: { NODE_ENV: 'production', DEBUG: true}})) //To set environment variables in-line
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
gulp.task('default', ['clean', 'sass', 'html', 'js', 'browser-sync'], function () {
	gulp.watch('assets/css/*.scss', ['sass']);
	gulp.watch('assets/js/*.js', ['js']);
	gulp.watch(['*.html', 'partials/*.html'], ['html']);
});

gulp.task('publish', ['clean', 'sass', 'html', 'min-js'])


// REPLICATING HAMMER-FOR-MAC FUNCTIONALITY IN gulp

// COMPLETED
// Live-reload, compile sass, html partials, auto prefix css

// TODO
// Uglifiy/minify JS (and CSS?), Optimize images, JSHint script, Concatenate files, Cache file changes if needed?, Move other assets to build?

// EXTRAS
// File size diffs (uglify), Optimized build mode,