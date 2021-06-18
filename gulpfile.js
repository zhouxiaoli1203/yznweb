/**
 * Created by mingzhizeng on 2017/6/22.
 */


//引入gulp和gulp插件
var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector');

//定义css、js源文件路径
var cssSrc = ['static/css/**/*.css','libs/**/*.css','static/style/**/*.css','templates/show_template/**/*.css'],
    // appjsSrc = ['static/app.js'],
    jsSrc = ['static/**/*.js','libs/**/*.js','components/**/*.js','templates/show_template/*.js'];
htmlSrc = 'templates/**/*.html';
fontsSrc = 'static/fonts/*.*';
imgSrc = ['static/img/**/*.*','templates/show_template/**/img/*.*'];


//CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revCss', function(){
    return gulp.src(cssSrc)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'));
});


//js生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revJs', function(){
    return gulp.src(jsSrc)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));
});

//app.js生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revappJs', function(){
    return gulp.src(appjsSrc)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));
});

//html生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revHtml', function(){
    return gulp.src(htmlSrc)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/html'));
});
//fonts生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revFonts', function(){
    return gulp.src(fontsSrc)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/fonts'));
});
//img生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revImgs', function(){
    return gulp.src(imgSrc)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/imgs'));
});


//Html替换css、js文件版本
gulp.task('ColHtml', function () {
    return gulp.src(['rev/**/*.json', '*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('.'));
});

// registerRoutes.js替换html文件版本
gulp.task('registerRoutesJs', function () {
    return gulp.src(['rev/*/*.json', 'static/js/registerRoutes.js'])
        .pipe(revCollector())
        .pipe(gulp.dest('static/js'));
});
// 弹窗js替换html文件版本
gulp.task('ColPopJsForHtml', function () {
    return gulp.src(['rev/html/*.json', 'static/js/directive/*.js'])
        .pipe(revCollector())
        .pipe(gulp.dest('static/js/directive'));
});

//css替换fonts文件版本
gulp.task('CSSCSS', function () {
    return gulp.src(['rev/**/*.json', 'static/css/*.css'])
        .pipe(revCollector())
        .pipe(gulp.dest('static/css'));
});

gulp.task('StyleCSS', function () {
    return gulp.src(['rev/**/*.json', 'static/style/*.css'])
        .pipe(revCollector())
        .pipe(gulp.dest('static/style'));
});

gulp.task('ShowTemplateCSS', function () {
    return gulp.src(['rev/**/*.json', 'templates/show_template/**/*.css'])
        .pipe(revCollector())
        .pipe(gulp.dest('templates/show_template'));
});




//js替换img文件版本
gulp.task('ColController', function () {
    return gulp.src(['rev/imgs/*.json', 'static/js/**/*.js'])
        .pipe(revCollector())
        .pipe(gulp.dest('static/js'));
});

//templates html替换img文件版本
gulp.task('ColTemplateHtml', function () {
    return gulp.src(['rev/**/*.json', 'templates/**/*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('templates'));
});

var replace = require('gulp-replace');

//把app.js里的require配置文件都加上.js用于文件匹配
gulp.task('appJs',function(){
    gulp.src(['rev/js/*.json','rev/css/*.json', 'static/app.js'])
        .pipe(replace(/(['"]\.\.\/components\/)(.*)(['"])/g,'$1$2.js$3'))
        .pipe(replace(/(['"]\.\.\/libs\/)(.*)(['"])/g,'$1$2.js$3'))
        .pipe(replace(/(['"]js\/)(.*)(['"])/g,'$1$2.js$3'))
        .pipe(replace(/(['"]\.\.\/templates\/show_template)(.*)(['"])/g,'$1$2.js$3'))

        //把app.js替换js文件版本
        .pipe(revCollector())
        .pipe(gulp.dest('static'));

    // gulp.src(['rev/js/*.json', 'static/app.js'])
    //     .pipe(revCollector())
    //     .pipe(gulp.dest('static'));
});


gulp.task('replaceTask',function(){
    gulp.src('static/app.js')
    //因为cdn地址访问不稳定，暂时不把代码托管到cdn上
        .pipe(replace('../libs/','https://cdn.yizhiniao.com/yizhiniao_web/libs/'))
        .pipe(replace('../components/','https://cdn.yizhiniao.com/yizhiniao_web/components/'))
        // .pipe(replace('"js/','"https://cdn.yizhiniao.com/yizhiniao_web/static/js/'))
        // .pipe(replace('\'static/js','\'https://cdn.yizhiniao.com/yizhiniao_web/static/js'))
        // .pipe(replace('\'templates/','\'https://cdn.yizhiniao.com/yizhiniao_web/templates/'))

        .pipe(gulp.dest('static'));
});


gulp.task('replaceIndexHtml',function(){
    gulp.src('./index.html')

        .pipe(replace(/(<!--css-->)([\s\S]*)(<!--css-->)/g,'$1<link rel="stylesheet" type="text/css" href="static/css/merge.min.css"/>$3'))
        .pipe(replace(/(<!--js-->)([\s\S]*)(<!--js-->)/g,'$1<script type="text/javascript" src="static/js/merge.js"></script>$3'))
        .pipe(gulp.dest('./'));
});


gulp.task('lodopJs',function(){
    gulp.src('libs/lodop/*.js')
        .pipe(replace('\'libs/','\'https://cdn.yizhiniao.com/yizhiniao_web/libs/'))
        .pipe(gulp.dest('libs/lodop'));
});
gulp.task('replaceTask3',function(){
    gulp.src(['./login.html','./index.html'])
        .pipe(replace('"libs/','"https://cdn.yizhiniao.com/yizhiniao_web/libs/'))
        .pipe(replace('"components/','"https://cdn.yizhiniao.com/yizhiniao_web/components/'))
        // .pipe(replace('"static/','"https://cdn.yizhiniao.com/yizhiniao_web/static/'))
        .pipe(gulp.dist('./'));
});
gulp.task('replaceTask4',function(){
    gulp.src('static/**/*.css')
        .pipe(replace('../img/','https://cdn.yizhiniao.com/yizhiniao_web/static/img/'))
        .pipe(gulp.dest('static'));
});
gulp.task('replaceTask5',function(){
    gulp.src('static/js/**/*.js')
        .pipe(replace('"static/','"https://cdn.yizhiniao.com/yizhiniao_web/static/'))
        .pipe(gulp.dest('static/js'));
});


// 获取 uglify 模块（用于压缩 JS）
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var gutil = require("gulp-util");
const babel = require('gulp-babel');

var minifycss = require('gulp-minify-css'), //css压缩
    concat = require('gulp-concat'), //合并文件
    minhtml = require('gulp-htmlmin'); //html压缩

gulp.task('html', function(){
    return gulp.src('templates/**/*.html')
        .pipe(minhtml({collapseWhitespace: true, removeComments: true,removeEmptyAttributes: true}))
        .pipe(gulp.dest('templates'))
});

gulp.task('main_html_mini', function(){
    return gulp.src(['*.html'])
        .pipe(minhtml({collapseWhitespace: true, removeComments: true,removeEmptyAttributes: true}))
        .pipe(gulp.dest('./'))
});

gulp.task('css', function(){
    gulp.src(['libs/bootstrap/bootstrap.min.css','static/style/font-css.css','static/css/global.css','static/css/css.css','static/style/common.css',
        'static/style/zj.css','static/style/new-szp.css','static/style/zxl.css','static/style/cz.css',
        'libs/nprogress/nprogress.css'])
        .pipe(concat('merge.min.css'))
        // .pipe(rename({
        //     suffix: '.min'
        // }))
        .pipe(minifycss())
        .pipe(gulp.dest('static/css/'))
})

gulp.task('showcss', function(){
    gulp.src(['templates/show_template/**/*.css'])
        .pipe(minifycss())
        .pipe(gulp.dest('templates/show_template/'))
})
gulp.task('showjs', function(){
    gulp.src(['templates/show_template/show.js'])
        .pipe(uglify({
            mangle:true
        }))
        .pipe(gulp.dest('templates/show_template/'))
})

// 压缩 js 文件
// 在命令行使用 gulp script 启动此任务
gulp.task('jscompress', function() {
    // 1. 找到文件
    return gulp.src(['static/js/**/*.js','!static/js/merge.js'])
        .pipe(babel())
    // 2. 压缩文件
        .pipe(uglify({
            mangle:true
        }))

        // .pipe(rename({
        //  suffix: ".min",            // 给文件名加后缀
        // }))
        // 3. 另存压缩后的文件
        .on('error', function(err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(gulp.dest('static/js'));
});

gulp.task('jscompressMerge', function() {
    // 1. 找到文件
    return gulp.src(['libs/nprogress/nprogress.js','libs/libsJs/jquery.min.js','static/js/config.js',
        'static/js/constant.js','static/js/commonFunctions.js','libs/libsJs/md5.js'])
        // .pipe(babel())
        .pipe(concat('merge.js'))
        .pipe(uglify({
            mangle:true
        }))
        .on('error', function(err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(gulp.dest('static/js'));
});

gulp.task('appjscompress', function() {
    // 1. 找到文件
    return gulp.src('static/app.js')
        .pipe(uglify({
            mangle:true
        }))
        .on('error', function(err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(gulp.dest('static'));
});


//开发构建
gulp.task('dev', function (done) {
    condition = false;
    runSequence(
        ['revImgs'],
        ['revFonts'],
        ['CSSCSS'],
        ['StyleCSS'],
        ['ShowTemplateCSS'],

        ['revCss'],
        ['revHtml'],

        ['ColController'],
        ['ColPopJsForHtml'],

        ['revJs'],
        ['registerRoutesJs'],
        ['appJs'],
        ['lodopJs'],

        ['ColTemplateHtml'],//放这里是为了延迟时间，不然revJs无法正常取得最新文件

        //压缩
        ['appjscompress'],
        ['jscompressMerge'],
        ['jscompress'],
        ['css'],
        ['html'],
        ['showjs'],
        ['showcss'],

        ['replaceIndexHtml'],

        ['main_html_mini'],
        //压缩


        ['revJs'],
        ['ColHtml'],

        done);
});


gulp.task('default', ['dev']);

/*
npm install --save-dev gulp-uglify
npm install --save-dev gulp-rename
npm install --save-dev gulp-util
npm install  babel-core@6 --save-dev
npm install gulp-babel@7 --save-dev
npm install --save-dev gulp-minify-css
npm install --save-dev gulp-htmlmin
npm install --save-dev gulp-concat
npm install --save-dev babel-preset-es2015
npm install --save-dev babel-plugin-transform-remove-strict-mode

*/