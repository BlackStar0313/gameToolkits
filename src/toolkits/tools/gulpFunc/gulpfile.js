const gulp = require('gulp');
// const del = require('del');
// const shell = require('gulp-shell');
const fs = require('fs');
const json2xls = require('json2xls');

let configSeed = {};
let configShop = {};
let configCrop = {};

let selfInfo ;
let curTime  = 0;
let delayTime = 10;

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
                nextCountIdx: node.idx,
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

    //test code 
    selfInfo.cropInfo[1].nextCountIdx = 1;
    selfInfo.cropInfo[1].buyInfo[1] = {
    	cropIdx: 0,
    	retainTime: 0
    };

    // selfInfo.cropInfo[1].nextCountIdx = 3;
    // selfInfo.cropInfo[1].buyInfo[2] = {
    // 	cropIdx: 1,
    // 	retainTime: 0
    // };

    // selfInfo.cropInfo[2].nextCountIdx = 2;
    // selfInfo.cropInfo[2].buyInfo[1] = {
    // 	cropIdx: 0,
    // 	retainTime: 0
    // };   
    selfInfo.curCoin = 0
}

function isEnd() {
    return false ;
}

function copyObj(obj) {
	// return Object.assign({}, obj);
	return JSON.parse(JSON.stringify(obj));
}

function getItemsMultiplier(shopArr) {
    return 1;
}

function calcSecProduce(cropInfo, shopArr) {
    let calc = 0;
    for(let key in cropInfo) {
        let buyInfo = cropInfo[key].buyInfo;
        for (let count in buyInfo) {
            let cropIdx = buyInfo[count].cropIdx;
            let retainTime = buyInfo[count].retainTime;
            let cropConfig = configCrop[cropIdx];
            console.log("~~~~~~~~  calcSecProduce  ", cropConfig)
            calc += cropConfig.profit / cropConfig.produceTime;
        }
    }
    calc *= getItemsMultiplier(shopArr);
    console.log("~~~~calccoin is ", calc);
    return calc;
}

function addCoin() {
    let calc = 0;
    let cropInfo = selfInfo.cropInfo;
    for(let key in cropInfo) {
        let buyInfo = cropInfo[key].buyInfo;
        for (let count in buyInfo) {
            let cropIdx = buyInfo[count].cropIdx;
            let retainTime = buyInfo[count].retainTime;
            let cropConfig = configCrop[cropIdx];
            buyInfo[count].retainTime = (retainTime + delayTime) % cropConfig.produceTime;
            calc += Math.floor((retainTime + delayTime) / cropConfig.produceTime) * cropConfig.profit
        }
    }
    selfInfo.curCoin += calc * getItemsMultiplier(selfInfo.shopArr);
    console.log("~~~~addCoin cur  is ", selfInfo.curCoin);
}

function conditionBuySeed(info) {
	let canBuyDic = {};
	let cropInfo = info.cropInfo;
    for(let key in cropInfo) {
        seedInfo = cropInfo[key];
        let buyCoinfig = configSeed[seedInfo.nextCountIdx];
        let buyPrice = buyCoinfig.buyPrice;
                	console.log(" add new can buyprice is  "  + buyPrice + " selfInfo.curCoin  " + selfInfo.curCoin);
        if (buyPrice <= selfInfo.curCoin) {
        	let calcInfo = copyObj(info)
        	calcInfo.cropInfo[key].buyInfo[buyCoinfig.count] = {
        		cropIdx: 0,
        		retainTime: 0 
        	}
        	let secProduce = calcSecProduce(calcInfo.cropInfo , info.shopArr);
        	canBuyDic[key] = { 
        		seedId: key ,
        		nextIdx: seedInfo.nextCountIdx , 
        		secProduce: secProduce,
        		type: "buySeed"
        	};
        }
    }

    let max = null ;
    for (let key in canBuyDic) {
    	let compare = canBuyDic[key];
    	if (!max || max.secProduce < compare.secProduce) {
    		max = compare;
    	}
    }
    console.log(" buy  all can buy ", canBuyDic);
    console.log(" max is " , max );
    return max;
}

function conditionUpgrade(info) {
	let canBuyDic = {};
	let cropInfo = info.cropInfo;
    for(let key in cropInfo) {
        seedInfo = cropInfo[key];
        for (let count in seedInfo.buyInfo) {
        	let countInfo = seedInfo.buyInfo[count];
        	idx = countInfo.cropIdx + 1 ;
        	upgradeInfo = configCrop[idx];
        	if (upgradeInfo && upgradeInfo.upgrade_price <= selfInfo.curCoin) {

        		let copy = copyObj(info)
        		copy.cropInfo[key].buyInfo[count].cropIdx = idx;
        		console.log(" upgrade  end is ", copy.cropInfo[key].buyInfo);
        		let secProduce = calcSecProduce(copy.cropInfo , copy.shopArr);
	        	canBuyDic[key] = { 
	        		seedId: key ,
	        		count: count, 
	        		secProduce: secProduce,
	        		type: "upgrade"
	        	};
	        	console.log(" upgrade  end is ", info.cropInfo[key].buyInfo);
        	}
        }
    }

    let max = null ;
    for (let key in canBuyDic) {
    	let compare = canBuyDic[key];
    	if (!max || max.secProduce < compare.secProduce) {
    		max = compare;
    	}
    }
    console.log(" buy  all can buy ", canBuyDic);
    console.log(" max is " , max );
    return max;
}

function conditionBuyItems(info) {

}

function mainLoop () { 
	// calcSecProduce(selfInfo.cropInfo , selfInfo.shopArr);
	addCoin();
	addCoin();
	addCoin();
	addCoin();

	let copy = copyObj(selfInfo);
	// let buy = buyNewSeed(copy)
	let buy = conditionUpgrade(copy);
    // while (!isEnd()) {


    //     curTime += delayTime;
    // }
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
    mainLoop();
    cb();
}));
