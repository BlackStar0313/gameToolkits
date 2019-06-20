const gulp = require('gulp');
// const del = require('del');
// const shell = require('gulp-shell');
const fs = require('fs');
const json2xls = require('json2xls');

let info = {};


gulp.task('readFile', (cb)=>{
    let jsFile = './data/shop.json';
    fs.readFile(jsFile, 'utf8', (err, data) => {
        info = JSON.parse(data);
        cb();
    })
})

gulp.task('writeResult', (cb) => {
     let jsonArr = [];
     for (let key in info) {
        jsonArr.push(info[key]);
     }

    var xls = json2xls(jsonArr);
    fs.writeFileSync('./out/data.xlsx', xls, 'binary');
     cb();
})

gulp.task('test',gulp.series('readFile', 'writeResult', (cb)=>{
    cb();
}))
