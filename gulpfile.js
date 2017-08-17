'use strict'
require('coffee-script/register')

var gulp = require('gulp')
var del = require('del')
var runSequence = require('run-sequence')
var gulpLoadPlugins = require('gulp-load-plugins')
var packageJSON = require('./package.json')

var $ = gulpLoadPlugins()
var browserify = require('gulp-browserify');

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('html', function () {
  // plugs in dependencies for jquery, bootstrap, etc
  // combines files as specified
  // then puts it in dist
  return gulp.src('app/*.html')
    .pipe($.wiredep())
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
})

gulp.task('sass', function () {
  // compiles sass and then puts it stylesheets
  return gulp.src('app/stylesheets/*.sass')
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe(gulp.dest('./dist/stylesheets'))
})

gulp.task('coffee', function () {
  gulp.src('./app/javascripts/**/*.coffee')
    .pipe($.coffee({bare: true}).on('error', console.log))
    .pipe($.concat('application.js'))
    .pipe(gulp.dest('./dist/javascripts'))

  gulp.src('./app/index.coffee')
    .pipe($.coffee({bare: true}).on('error', console.log))
    .pipe(gulp.dest('./dist'))
  return
})

gulp.task('extras', function () {
  return gulp.src('./app/package.json')
    .pipe(gulp.dest('./dist'))

})

gulp.task('clean', del.bind(null, ['dist', '.tmp']))

gulp.task('css', function() {
  return gulp.src("app/stylesheets/*.css")
    .pipe(gulp.dest('./dist/stylesheets'))
})
gulp.task('watch', function () {
  gulp.watch('app/*.html', gulp.parallel('html'))
  gulp.watch('app/stylesheets/**/*.sass', gulp.parallel('sass'))
  gulp.watch('app/stylesheets/**/*.css', gulp.parallel('css'))
  gulp.watch('app/javascripts/**/*.coffee', gulp.parallel('coffee'))
  gulp.watch('app/javascripts/**/*.js', gulp.parallel('js'))
  gulp.watch('app/images/**/*', gulp.parallel('images'))
  gulp.watch('app/package.json', gulp.parallel('extras', 'dependencies'))
  return
})

gulp.task('js', function() {
  gulp.src('app/javascripts/**/*')
    .pipe(gulp.dest('./dist/javascripts'))
  return gulp.src('./app/*.js')
    .pipe(gulp.dest('./dist'))
})

gulp.task('dependencies:install', $.shell.task([
  'npm --prefix ./app install ./app'
]))

// Installs dependencies into build folder
gulp.task('dependencies:move', function() {
  return gulp.src("app/node_modules/**/*")
    .pipe(gulp.dest("./dist/node_modules"))
});

gulp.task('dependencies', gulp.series('dependencies:install', 'dependencies:move'))

gulp.task('build', gulp.series('clean', gulp.parallel('sass', 'css', 'html', 'js', 'images', 'extras', 'dependencies:move')))

gulp.task('build-heavy', gulp.series('clean', gulp.parallel('sass', 'css', 'html', 'js', 'images', 'extras', 'dependencies')))


gulp.task('package:nobuild', function() {
  return gulp.src('./dist')
    .pipe($.electronPacker(packageJSON))
})

gulp.task('package', gulp.series('build-heavy', 'package:nobuild'))

gulp.task('package:darwin', function() {
  let options = {}
  options.name = packageJSON.name
  options.version = packageJSON.version
  options.packaging = packageJSON.packaging
  options.packaging.platforms = ['darwin-x64']
  return gulp.src('./dist')
    .pipe($.electronPacker(options))
})

gulp.task('package:win64', function() {
  let options = {}
  options.name = packageJSON.name
  options.version = packageJSON.version
  options.packaging = packageJSON.packaging
  options.packaging.platforms = ['win64-64']
  return gulp.src('./dist')
    .pipe($.electronPacker(options))
})

gulp.task('package:linux', function() {
  let options = {}
  options.name = packageJSON.name
  options.version = packageJSON.version
  options.packaging = packageJSON.packaging
  options.packaging.platforms = ['linux-x64']
  return gulp.src('./dist')
    .pipe($.electronPacker(options))
})
