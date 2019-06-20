const gulp = require('gulp');
// const del = require('del');
// const shell = require('gulp-shell');
const fs = require('fs');
const json2xls = require('json2xls');

let configSeed = {};
let configShop = {};
let configCrop = {};

let selfInfo ;

gulp.task("loadConfig" ,  (cb) => {
    let jsFile = './data/shop.json';
    let promise1 = new Promise(function(resolve, reject) {
        fs.readFile(jsFile, 'utf8', (err, data) => {
            configShop = JSON.parse(data);
            resolve();
        });
    });

    let promise2 = new Promise(function(resolve, reject) {
        jsFile = './data/seeds.json';
        fs.readFile(jsFile, 'utf8', (err, data) => {
            configSeed = JSON.parse(data);
            resolve();
        });
    });

    let promise3 = new Promise(function(resolve, reject) {
        jsFile = './data/crop_economy.json';
        fs.readFile(jsFile, 'utf8', (err, data) => {
            configCrop = JSON.parse(data);
            resolve();
        });
    });

    Promise.all([promise1, promise2, promise3]).then(()=>{
        cb();
    });
});

function initData () {
    let cropInfo = {};
    for (let key in configSeed) {
        let node = configSeed[key];
        if (!cropInfo[node.seed_id]) {
            cropInfo[node.seed_id] = {
                nextCount: node.count,
                buyInfo: {}
            }
        }
    }

    selfInfo = {
        cropInfo : cropInfo,
        shopArr: [],
        nodeArr: [],
        curCoin: 0
    }
    console.log(selfInfo);
}

// gulp.task('writeResult', (cb) => {
//      let jsonArr = [];
//      for (let key in info) {
//         jsonArr.push(info[key]);
//      }

//     var xls = json2xls(jsonArr);
//     fs.writeFileSync('./out/data.xlsx', xls, 'binary');
//      cb();
// })

// gulp.task('test',gulp.series('readFile', 'writeResult', (cb)=>{
//     cb();
// }))

gulp.task('start',gulp.series("loadConfig", (cb)=>{
    initData();
    cb();
}));
