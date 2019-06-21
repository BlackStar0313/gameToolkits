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
let haveBuySeedArr = [];
let beforeCoin = 0;
let afterCoin = 0;

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
    // selfInfo.cropInfo[1].nextCountIdx = 1;
    // selfInfo.cropInfo[1].buyInfo[1] = {
    // 	cropIdx: 0,
    // 	retainTime: 0
    // };

    // selfInfo.cropInfo[1].nextCountIdx = 2;
    // selfInfo.cropInfo[1].buyInfo[2] = {
    // 	cropIdx: 1,
    // 	retainTime: 0
    // };

    // // selfInfo.cropInfo[2].nextCountIdx = 2;
    // // selfInfo.cropInfo[2].buyInfo[1] = {
    // // 	cropIdx: 0,
    // // 	retainTime: 0
    // // };   
    // selfInfo.curCoin = 0
}

function isEnd() {
	let configLen = Object.keys(configSeed).length
	// if (configLen == haveBuySeedArr.lenght) {
	// 	return true;
	// }
	if (haveBuySeedArr.length >= 10) {
		return true;
	}
    return false ;
}

function copyObj(obj) {
	// return Object.assign({}, obj);
	return JSON.parse(JSON.stringify(obj));
}

function getItemsMultiplier(shopArr) {
	let multiplier = 1 ;
	shopArr.map((idx)=>{
		multiplier *= configShop[idx].multiplier;
	});
	// console.log("  items multiplier is " , multiplier);
    return multiplier;
}

function calcSecProduce(cropInfo, shopArr) {
    let calc = 0;
    for(let key in cropInfo) {
        let buyInfo = cropInfo[key].buyInfo;
        for (let count in buyInfo) {
            let cropIdx = buyInfo[count].cropIdx;
            let retainTime = buyInfo[count].retainTime;
            let cropConfig = configCrop[cropIdx];
            // console.log("~~~~~~~~  calcSecProduce  ", cropConfig)
            calc += cropConfig.profit / cropConfig.produceTime;
        }
    }
    calc *= getItemsMultiplier(shopArr);
    // console.log("~~~~calccoin is ", calc);
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
    let addCoin = calc * getItemsMultiplier(selfInfo.shopArr);
    selfInfo.curCoin += addCoin;
    return addCoin;
    // console.log("~~~~addCoin cur  is ", selfInfo.curCoin);
}

function conditionBuySeed(info) {
	let canBuyDic = {};
	let cropInfo = info.cropInfo;
    for(let key in cropInfo) {
        seedInfo = cropInfo[key];
        let buyCoinfig = configSeed[seedInfo.nextCountIdx];
        if (!buyCoinfig) {
        	continue;
        }
        let buyPrice = buyCoinfig.buyPrice;
                	// console.log(" add new can buyprice is  "  + buyPrice + " selfInfo.curCoin  " + selfInfo.curCoin);
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
        		cost: buyPrice,
        		type: "buySeed"
        	};

        	// console.log("*************** find dic " , canBuyDic[key])
        }
    }

    let max = null ;
    for (let key in canBuyDic) {
    	let compare = canBuyDic[key];
    	if (!max || max.secProduce < compare.secProduce) {
    		max = compare;
    	}
    }
    // console.log(" buy  all can buy ", canBuyDic);
    // console.log(" max is " , max );
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
        		// console.log(" upgrade  end is ", copy.cropInfo[key].buyInfo);
        		let secProduce = calcSecProduce(copy.cropInfo , copy.shopArr);
	        	canBuyDic[key] = { 
	        		seedId: key ,
	        		count: count, 
	        		secProduce: secProduce,
	        		cost: upgradeInfo.upgrade_price,
	        		type: "upgrade"
	        	};
	        	// console.log(" upgrade  end is ", info.cropInfo[key].buyInfo);
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
    // console.log(" buy  all can buy ", canBuyDic);
    // console.log(" max is " , max );
    return max;
}

function conditionBuyItems(info) {
	let maxId = 0;
	info.shopArr.map((idx)=>{
		maxId = Math.max(idx, maxId);
	});
	let nextIdx =  maxId + 1 ;
	// console.log("%%%%%%%%%%%  nextIdx " , nextIdx);
	if (configShop[nextIdx] && configShop[nextIdx].price <= selfInfo.curCoin) {
		info.shopArr.push(nextIdx);
		let secProduce = calcSecProduce(info.cropInfo , info.shopArr);
		return {
			itemIdx: nextIdx,
			secProduce: secProduce,
			cost: configShop[nextIdx].price,
			type: "buyItems"
		}
	}
	return null;
}

function addSth(condition) {
	if (!condition) {
		return ;
	}

	if (condition.type == "buySeed") {
		let buyCoinfig = configSeed[condition.nextIdx];
		let seedInfo = selfInfo.cropInfo[condition.seedId]
		seedInfo.buyInfo[buyCoinfig.count] = {
    		cropIdx: 0,
    		retainTime: 0 
    	};
    	seedInfo.nextCountIdx = condition.nextIdx + 1 ;
    	haveBuySeedArr.push(condition.nextIdx);
	}
	else if (condition.type == "upgrade") {
		++selfInfo.cropInfo[condition.seedId].buyInfo[condition.count].cropIdx;
	}
	else if (condition.type == "buyItems") {
		selfInfo.shopArr.push(condition.itemIdx);
	}

	selfInfo.curCoin -= condition.cost;
	// console.log("#############  retain coin is " + selfInfo.curCoin + " sub coin is  " + condition.cost + " action is " + condition.type + " length is " + haveBuySeedArr.length + " cost time " + curTime) ;
}

function generalNode(result) {
	let secProduce = calcSecProduce(selfInfo.cropInfo , selfInfo.shopArr);
	let node = {
		sec: curTime,
		totalCoin: afterCoin - beforeCoin,
		coinsPerSec: secProduce,
		items: selfInfo.shopArr.toString(),
		type: result ? result.type : ""
	}


	let allInfo = {};
	for (let key in configSeed) {
		let seedId = configSeed[key].seed_id;
		let count = configSeed[key].count;
		let nodeKey = `crop${seedId}_${count}`;
		if (!allInfo[nodeKey]) {
			if (selfInfo.cropInfo[seedId] && selfInfo.cropInfo[seedId].buyInfo[count]) {
				allInfo[nodeKey] = {
					seedId: seedId,
					count: count
				} 
			}
			else {
				allInfo[nodeKey] = null;
			}
		}
	}

	for (let key in allInfo) {
		let info = allInfo[key];
		let level =  !!info ? configCrop[ selfInfo.cropInfo[info.seedId].buyInfo[info.count].cropIdx].level : 0;
		node[key] = level;
	}

	selfInfo.nodeArr.push(node)
	// console.log(node);
}

function writeResult (){
	// let jsonArr = [];
 //    for (let key in info) {
 //        jsonArr.push(info[key]);
 //    }

    var xls = json2xls(selfInfo.nodeArr);
    fs.writeFileSync('./out/data.xlsx', xls, 'binary');
}

function mainLoop () { 
    while (!isEnd()) {
		let coin = addCoin();
		afterCoin += coin;

		let copy = copyObj(selfInfo);
		let seed = conditionBuySeed(copy);
		// console.log("####### seed condition is " ,seed)
		copy = copyObj(selfInfo);
		let upgrade = conditionUpgrade(copy);
		// console.log("####### upgrade condition is " ,upgrade)
		copy = copyObj(selfInfo);
		let item = conditionBuyItems(copy);
		// console.log("####### item condition is " ,item)

		let result = null ;
		if (!seed || !upgrade) {
			result = !!seed ? seed : upgrade;
		}
		else {
			result = seed.secProduce > upgrade.secProduce ? seed : upgrade;
		}

		if (!result || !item) {
			result = !!result ? result : upgrade;
		}
		else {
			result = result.secProduce > item.secProduce ? result : item;
		}


		// let result = seed
		addSth(result);
		// let secProduce = calcSecProduce(selfInfo.cropInfo , selfInfo.shopArr);
		// console.log("cur result is " , result);
		// console.log("~~~~~~~~~ rand coin is   " + result + " time  " + curTime + " cur  " + haveBuySeedArr.length);

        curTime += delayTime;

        generalNode(result);
        beforeCoin = afterCoin;

        console.log("~~~~~~~~~ cur time is   " + curTime + " cur  " + haveBuySeedArr.length);
    }

    writeResult();
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
