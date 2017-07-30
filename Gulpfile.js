var gulp = require('gulp'),
    connect = require('gulp-connect'),
    autoprefixer = require('gulp-autoprefixer'),
    opn = require('opn'),
    pug = require('gulp-pug'),
    cssnano = require('gulp-cssnano'),
    clean = require('gulp-clean'),
    sass = require('gulp-sass'),
    runSequence = require('run-sequence'),
    sourcemaps = require('gulp-sourcemaps');

var options = {
    prod: 'prod',
    app: 'app',
    connectApp : {
        root: this.app,
        livereload: true,
        port: 8888
    }
}


function swallowError (error) {
    //If you want details of the error in the console
    console.log(error.toString());
    this.emit('end');
}


// сервер
gulp.task('connect', function() {
    connect.server(
        // argv.app ? options.connectApp :
        // options.connectProd
        options.connectApp
    );
});

gulp.task('pug', function() {

    gulp.src(options.app+'/pug/index.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(options.app))

    // gulp.src('package.json')
    // 	 .pipe(notify('pug was changed'))
    // 	 .pipe(connect.reload());
});

// как вызвана таска html, вызываем релоад
gulp.task('html', function () {
    gulp.src( options.app + '*.html' )
        .pipe(connect.reload());
});

// как вызвана таска css, вызываем релоад
gulp.task('css', function () {
    gulp.src( options.app + '/css/*.css')
        .pipe(connect.reload());
});

// сасс
gulp.task('sass', function () {
    return gulp.src(options.app + '/scss/index.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', swallowError))
        .pipe(sass())
        .pipe(autoprefixer({ browsers: ['last 2 versions']}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest( options.app + '/css'))
        .pipe(connect.reload());
});


// Очистка
gulp.task('clean', function () {
    return gulp.src(options.app + '/*', {read: false}).pipe(clean() );
});


//копируем файлы
gulp.task('copy-fonts', function() {
    gulp.src('./app/fonts/*/**')
        .pipe(gulp.dest(options.prod + '/fonts'));
});


gulp.task('copy-imgs', function() {
    gulp.src(options.app + '/i/**')
        .pipe(gulp.dest(options.prod+'/i'));
});

gulp.task('copy-svgs', function() {
    gulp.src(options.app + '/svg/*')
        .pipe(gulp.dest(options.prod+'/svg'));
});

// copy assets
gulp.task('copyAssets', function(callback) {
    runSequence(
        ['copy-fonts'],
        ['copy-imgs'],
        ['copy-svgs'],
        callback
    )
})

//автоматическое подключение библиотек
gulp.task('wiredep', function () {
    gulp.src(options.app + '/*.html')
        .pipe(wiredep({
            directory: './app/bower_components'
        }))
        .pipe(gulp.dest(options.app));
});


//приглядываем за файлами, вызываем релоады
gulp.task('watch', function () {
    gulp.watch([options.app + '/*.html'], ['html']);
    gulp.watch([options.app + '/css/*.css'], ['css']);
    gulp.watch([options.app + '/scss/*.scss', options.app + '/scss/**/*.scss'], ['sass']);
    gulp.watch([options.app + '/pug/*.pug', options.app + '/pug/**/*.pug'], ['pug']);
});


// prod !!!
gulp.task('generateDist', function () {
    return gulp.src(options.app + '/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cssnano()))
        .pipe(gulp.dest(options.prod));
});


gulp.task('default', ['sass', 'pug', 'connect', 'watch']);
gulp.task('prod', function (callback) {
    runSequence(
        ['copyAssets'],
        ['generateDist'],
        ['connect'],
        callback
    )
});