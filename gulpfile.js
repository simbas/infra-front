var gulp = require('gulp');
var webpack = require('webpack-stream');
var glob = require("glob");
var rename = require('gulp-rename');
var argv = require('yargs').argv;

let springboardPath = '../springboard-open-ent';
if (argv.springboard) {
    springboardPath = argv.springboard;
    console.log('Using springboard at ' + springboardPath);
}

gulp.task("build", function () {
    return gulp.src('./')
        .pipe(webpack(require('./webpack.config.js')))
        .on('error', function handleError() {
            this.emit('end');
        })
        .pipe(gulp.dest('./'));
});

gulp.task("build-dev", function () {
    webpack.plugins = [];
    return gulp.src('./')
        .pipe(webpack(require('./webpack-dev.config.js')))
        .on('error', function handleError() {
            this.emit('end');
        })
        .pipe(gulp.dest('./'));
});


let updatePromiseJS = null;
getUpdatePromiseJS = function () {
    if (updatePromiseJS) {
        return updatePromiseJS;
    }
    console.log("Prepare JS glob...")
    updatePromiseJS = new Promise((resolve, reject) => {
        glob(springboardPath + '/mods/**/public/dist/entcore/*.js', (err, f) => {
            console.log("Finished JS glob...")
            resolve(f);
        });
    })
    return updatePromiseJS;
}

gulp.task('update', ['build-dev'], () => {
    getUpdatePromiseJS().then(files => {
        files.forEach((file) => {
            const split = file.split('/');
            const fileName = split[split.length - 1];
            console.log('Copying js to ' + split.slice(0, split.length - 1).join('/'));
            gulp.src('./bundle/ng-app.js')
                .pipe(rename(fileName))
                .pipe(gulp.dest(split.slice(0, split.length - 1).join('/')));
            //
            gulp.src('./bundle/ng-app.js.map')
                .pipe(rename(fileName))
                .pipe(gulp.dest(split.slice(0, split.length - 1).join('/')));
        });
    })
})


let updatePromiseHTML = null;
function getUpdatePromiseHTML() {
    if (updatePromiseHTML) {
        return updatePromiseHTML;
    }
    console.log("Prepare HTML glob...")
    updatePromiseHTML = new Promise((resolve, reject) => {
        glob(springboardPath + '/mods/**/public/template/entcore/*.html', (err, f) => {
            console.log("Finish HTML glob...")
            resolve(f);
        });
    })
    return updatePromiseHTML;
}
gulp.task('watch', () => {
    gulp.watch('**/*.ts', () => gulp.start('update'));
    gulp.watch('**/*.html', () => {
        const apps = [];

        getUpdatePromiseHTML().then(f => {
            f.forEach((file) => {
                const app = file.split('/public/template/entcore')[0];
                if (apps.indexOf(app) === -1) {
                    apps.push(app);
                    console.log('copy to ' + app + '/public/template/entcore')
                    gulp.src('./src/template/**/*')
                        .pipe(gulp.dest(app + '/public/template/entcore'));
                }
            });
        });
    });
});
