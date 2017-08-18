'use strict'
require('coffee-script/register')

// this

var gulp = require('gulp')
var request = require('request-promise-native')
var del = require('del')
var runSequence = require('run-sequence')
var gulpLoadPlugins = require('gulp-load-plugins')
var packageJSON = require('./package.json')
var parser = require('uri-template');
var fs = require('fs')
var req = require('request')

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

gulp.task('release:zip', $.shell.task([
  'zip -r ./releases/email_to_trello-win32-x64.zip ./releases/email_to_trello-win32-x64',
  'zip -r ./releases/email_to_trello-linux-x64 ./releases/email_to_trello-linux-x64',
  'zip -r ./releases/email_to_trello-darwin-x64 ./releases/email_to_trello-darwin-x64'
]))

// the release tasks are sort of janky
// -- ritikmishra, the author of these janky release scripts
var upload_url

gulp.task('release:create', function(done){
  var options = {
    uri: 'https://api.github.com/repos/ritikmishra/email-to-trello/releases',
    headers: {
      "User-Agent": process.env.USERNAME
    },
    json: true // Automatically stringifies the body to JSON
  }
  request(options)
    .then((data) => {
      var last_release = data[0]
      var last_tag = last_release.tag_name
      var tag = last_tag.split('.')[0] + '.' + (parseInt(last_tag.split('.')[1]) + 1)
      options = {
        method: 'POST',
        uri: 'https://api.github.com/repos/ritikmishra/email-to-trello/releases',
        body: {
            "tag_name": tag
        },
        headers: {
            'User-Agent': process.env.USERNAME
        },
        json: true
      }
      request(options).auth(process.env.USERNAME, process.env.TOKEN, true)
        .then((data) => {
          upload_url = data.upload_url
          done()
        })
        .catch((err) => {
          console.error(err)
          done()
        })
    })
    .catch((err) => {
      console.error(err)
      done()
    })


})

gulp.task('release:upload',  function(done){

      var filenames = {
        win: "./releases/email_to_trello-win32-x64.zip",
        darwin: "./releases/email_to_trello-darwin-x64.zip",
        linux: "./releases/email_to_trello-linux-x64.zip"
      }
      var upload = {
        win: parser.parse(upload_url).expand({name: "email_to_trello-win32-x64.zip", label: "Windows x64"}),
        darwin: parser.parse(upload_url).expand({name: "email_to_trello-darwin-x64.zip", label: "MacOS x64"}),
        linux: parser.parse(upload_url).expand({name: "email_to_trello-linux-x64.zip", label: "Linux x64"})
      }

      var options = {
        method: 'POST',
        uri: null,
        url: null,
        headers: {
            'User-Agent': process.env.USERNAME,
            'Content-Type': "application/zip",
            'Content-Length': 3
        },
        json: true,
        auth: {
          user: process.env.USERNAME,
          pass: process.env.TOKEN,
          sendImmediately: true
        }
      }

      var sizes = {
        win: fs.statSync(filenames.win).size,
        darwin: fs.statSync(filenames.darwin).size,
        linux: fs.statSync(filenames.linux).size
      }


      var options_win, options_darwin, options_linux
      options_win = JSON.parse(JSON.stringify(options))
      options_darwin = JSON.parse(JSON.stringify(options))
      options_linux = JSON.parse(JSON.stringify(options))
      options_win.url = upload.win
      options_win.headers['Content-Length'] = sizes.win

      options_darwin.url = upload.darwin
      options_darwin.headers['Content-Length'] = sizes.darwin

      options_linux.url = upload.linux
      options_linux.headers['Content-Length'] = sizes.linux

      var promises = []

      // console.log(options_win)
      promises.push(
        new Promise(function(resolve, reject){
          fs.createReadStream(filenames.win)
            .pipe(req.post(options_win, function(error, response, body){
              if(error) {reject(error);}
              else { resolve({code: response.statusCode, body: body})}
            }))
        })
      )


      // console.log(options_darwin)
      promises.push(
        new Promise(function(resolve, reject){
          fs.createReadStream(filenames.darwin)
            .pipe(req.post(options_darwin, function(error, response, body){
              if(error) {reject(error);}
              else { resolve({code: response.statusCode, body: body})}
            }))
        })
      )

      // console.log(options_linux)
      promises.push(
        new Promise(function(resolve, reject){
          fs.createReadStream(filenames.linux)
            .pipe(req.post(options_linux, function(error, response, body){
              if(error) {reject(error);}
              else { resolve({code: response.statusCode, body: body})}
            }))
        })
      )

      Promise.all(promises)
        .then((data) => {
          console.log(data)
          done()
        })
        .catch((err) => {
          console.error(err)
          done()
        })

})

gulp.task('release', function(done){

  if(process.env.TRAVIS_BRANCH === "master" && process.env.TRAVIS_PULL_REQUEST === "false" && process.env.TRAVIS_TAG[0] !== "v")
  {
    gulp.series('release:zip', 'release:create', 'release:upload')()
    done()
  }
  else {
    console.log("Not authorized to make a new release.")
    done()
  }
})

gulp.task('release-travis', gulp.series('package', 'release:zip', 'release:create', 'release:upload'))
