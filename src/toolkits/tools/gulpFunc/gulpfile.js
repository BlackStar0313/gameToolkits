const gulp = require('gulp');
// const del = require('del');
// const shell = require('gulp-shell');
const fs = require('fs');
const json2xls = require('json2xls');

let configSeed = {};
let configShop = {};
let configCrop = {};

let maxLevel = 50;

let selfInfo ;
let curTime  = 0;
let delayTime = 1800;
let haveBuySeedArr = [];
let beforeCoin = 0;
let afterCoin = 0;
let curSecProduce  = 0;
let nodeArr = [];

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
        curCoin: 0
    }
    console.log(selfInfo);
}

function isEnd() {
	let configLen = Object.keys(configSeed).length
	// if (configLen == haveBuySeedArr.lenght) {
	// 	return true;
	// }
	// if (haveBuySeedArr.length >= 400) {
	// 	return true;
	// }

	if (curTime >= 604800) {
		return true;
	}
	return false;

	// let value = false ;
	// for (let key in selfInfo.cropInfo) {
	// 	let buyInfo = selfInfo.cropInfo[key];
	// 	for (let count in buyInfo) {
	// 		let cropIdx = buyInfo[count].cropIdx;
	// 		if (configCrop[cropIdx] && configCrop[cropIdx].level != 50) {
	// 			value = true ;
	// 			return false ;
	// 		}
	// 	}
	// }
 //    return value ;
}

function copyObj(obj) {
	// return Object.assign({}, obj);
	return JSON.parse(JSON.stringify(obj));
	return obj;

  // console.log("%%%%%%%%%%%   obj  is " , obj)

  // let target = {};
  // for (let prop in obj) {
  //   if (obj.hasOwnProperty(prop)) {
  //   	let value = obj[prop]
  //   	if (typeof value === "object") {
  //   		value = copyObj(obj);
  //   	}
  //       target[prop] = value;
  //   }
  // }
  // return target;

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
        if (!buyCoinfig || buyCoinfig.seed_id != key) {
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
        	canBuyDic[key + buyCoinfig.count] = { 
        		seedId: key ,
        		nextIdx: seedInfo.nextCountIdx , 
        		secProduce: secProduce,
        		cost: buyPrice,
        		type: "buySeed",
        		subSecProduce: secProduce - curSecProduce
        	};

        	// console.log("*************** find dic " , canBuyDic[key])
        }
    }

    let max = null ;
    for (let key in canBuyDic) {
    	let compare = canBuyDic[key];
    	if (!max || max.cost/max.subSecProduce > compare.cost/compare.subSecProduce) {
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
        	if ( upgradeInfo && upgradeInfo.crop == key && upgradeInfo.level <= maxLevel && upgradeInfo.upgrade_price <= selfInfo.curCoin) {

        		let copy = copyObj(info)
        		copy.cropInfo[key].buyInfo[count].cropIdx = idx;
        		// console.log(" upgrade  end is ", copy.cropInfo[key].buyInfo);
        		let secProduce = calcSecProduce(copy.cropInfo , copy.shopArr);
	        	canBuyDic[key + count] = { 
	        		seedId: key ,
	        		count: count, 
	        		secProduce: secProduce,
	        		cost: upgradeInfo.upgrade_price,
	        		type: "upgrade",
	        		subSecProduce: secProduce - curSecProduce
	        	};
	        	// console.log(" upgrade  end is ", info.cropInfo[key].buyInfo);
        	}
        }
    }

    let max = null ;
    for (let key in canBuyDic) {
    	let compare = canBuyDic[key];
    	if (!max || max.cost/max.subSecProduce > compare.cost/compare.subSecProduce) {
    		max = compare;
    	}
    }
    // console.log(" buy  all can buy ", cropInfo[1]);
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
			type: "buyItems",
			subSecProduce: secProduce - curSecProduce
		}
	}
	return null;
}

function getFirstCropIdx(seedId) {
	for (let key in configCrop) {
		if (configCrop[key].crop == seedId) {
			return configCrop[key].idx;
		}
	}
}

function addSth(condition) {
	if (!condition) {
		return ;
	}

	if (condition.type == "buySeed") {
		let buyCoinfig = configSeed[condition.nextIdx];
		let seedInfo = selfInfo.cropInfo[condition.seedId]
		seedInfo.buyInfo[buyCoinfig.count] = {
    		cropIdx: getFirstCropIdx(condition.seedId),
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
	// console.log("##################   sub coin is +  " + condition.cost + " type is  " + condition.type + " cost time  " + curTime)
	// console.log("#############  retain coin is " + selfInfo.curCoin + " sub coin is  " + condition.cost + " action is " + condition.type + " length is " + haveBuySeedArr.length + " cost time " + curTime) ;
}

function generalNode(result) {
	let node = {
		sec: curTime,
		totalCoin: afterCoin - beforeCoin,
		coinsLeft: selfInfo.curCoin,
		coinsPerSec: curSecProduce,
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

	nodeArr.push(node)
	// console.log(node);
}

function writeResult (){
	// let jsonArr = [];
 //    for (let key in info) {
 //        jsonArr.push(info[key]);
 //    }
	 console.log("### begin to general  result ");
    var xls = json2xls(nodeArr);
 	console.log("### begin to write result ");
    fs.writeFileSync('./out/data.xlsx', xls, 'binary');
 	console.log("### end  to write result ");
}

function mainLoop () { 
	generalNode(null);
    while (!isEnd()) {
		let coin = addCoin();
		afterCoin += coin;
        curTime += delayTime;


        let isFirst = true ;
        let endResult = null ;
		while(true) {
			curSecProduce = calcSecProduce(selfInfo.cropInfo , selfInfo.shopArr);
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
			if (!item || !seed) {
				result = !!item ? item : seed;
			}
			else {
				result = seed.cost/seed.subSecProduce < item.cost/item.subSecProduce ? seed : item;
			}


			if (!result || !upgrade) {
				result = !!result ? result : upgrade;
			}
			else {
				result = upgrade.cost/upgrade.subSecProduce < result.cost/result.subSecProduce ? upgrade : result;
			}

			// console.log(" main loop result seed is " , seed)
			// console.log(" main loop result upgrade is " , upgrade)
			// console.log(" main loop result item is " , item)


			// let result = seed
			if (!result && isFirst == false) {
				break;
			}
			endResult = result;
			addSth(result);

	        isFirst = false;
		}

        generalNode(endResult);
		// let secProduce = calcSecProduce(selfInfo.cropInfo , selfInfo.shopArr);
		// console.log("cur result is " , result);
		// console.log("~~~~~~~~~ rand coin is   " + result + " time  " + curTime + " cur  " + haveBuySeedArr.length);


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
