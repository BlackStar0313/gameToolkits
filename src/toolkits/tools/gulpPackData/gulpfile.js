const gulp = require('gulp');
const del = require('del');
const shell = require('gulp-shell');
const fs = require('fs');

let targetPath = "";
let sourcePath = "";
let gitTargetPath = "";
let gitSourcePath = "";
const configFile = './config.json';

gulp.task('initPath', (cb) => {
    fs.readFile(configFile, 'utf8', (err, data) => {
        let obj = JSON.parse(data);
        // console.log("~~~~~ fuck ", obj)

        targetPath = obj.targetPath;
        sourcePath = obj.sourcePath;
        gitTargetPath = obj.gitTargetPath;
        gitSourcePath = obj.gitSourcePath;
        cb();
    })
})

gulp.task('clean', (cb) => {
    console.log("Begin clean .................... ");
    del(targetPath).then((result) => {
        console.log("clean old files end ...............")
        cb()
    })
})

gulp.task('pull', () => {
    console.log("Begin pull .................... ");
    let commond = 'pipenv run python config-courier.py config';
    let source = `${sourcePath}/../`
    return gulp.src('.')
        .pipe(shell([
            commond,
        ], { cwd: source }))
        .on('end', () => {
            console.log("finish pull  .................... ");
        })
})


gulp.task('copyDoc', gulp.series('initPath', 'clean', 'pull', (cb) => {
    console.log("Begin copyDoc.................... ");
    return gulp.src('./**/*.*', { cwd: sourcePath })
        .pipe(gulp.dest(targetPath))
}))


gulp.task('cleanGit', (cb) => {
    console.log("Begin cleanGit .................... ");
    del(gitTargetPath).then((result) => {
        console.log("cleanGit old files end ...............")
        cb()
    })
})

gulp.task('pullGit', () => {
    console.log("Begin pullGit .................... ");
    let commond = 'git pull';
    let source = `${gitSourcePath}/../`
    return gulp.src('.')
        .pipe(shell([
            commond,
        ], { cwd: source }))
        .on('end', () => {
            console.log("finish pullGit  .................... ");
        })
})


gulp.task('copyGit', gulp.series('initPath', 'cleanGit', 'pullGit', (cb) => {
    console.log("Begin copyGit.................... ");
    return gulp.src('./**/*.*', { cwd: gitSourcePath })
        .pipe(gulp.dest(gitTargetPath))
}))