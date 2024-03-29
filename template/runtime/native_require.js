
var game_file_list = [
    //以下为自动修改，请勿修改
    //----auto game_file_list start----
	"libs/modules/egret/egret.js",
	"libs/modules/egret/egret.native.js",
	"libs/modules/game/game.js",
	"libs/modules/res/res.js",
	"libs/modules/eui/eui.js",
	"libs/modules/tween/tween.js",
	"libs/modules/dragonBones/dragonBones.js",
	"bin-debug/GameMainscene.js",
	"bin-debug/toolkits/controller/radar/CtrRadarChart.js",
	"bin-debug/LoadingUI.js",
	"bin-debug/Main.js",
	"bin-debug/ThemeAdapter.js",
	"bin-debug/test/TestAnimationLayer.js",
	"bin-debug/test/TestCtrRadarChartLayer.js",
	"bin-debug/test/TestNetStatusLayer.js",
	"bin-debug/test/TestToolsLayer.js",
	"bin-debug/test/TestToolsLayerCell.js",
	"bin-debug/toolkits/controller/netStatus/CtrNetStatus.js",
	"bin-debug/AssetAdapter.js",
	"bin-debug/toolkits/utils/GTLocalStorage.js",
	"bin-debug/toolkits/utils/GTSoundEngine.js",
	"bin-debug/toolkits/utils/GTUtils.js",
	"bin-debug/toolkits/utils/dragonBonesHelper/GTDragonBonesConfig.js",
	"bin-debug/toolkits/utils/dragonBonesHelper/GTDragonBonesManager.js",
	"bin-debug/toolkits/utils/dragonBonesHelper/GTMovieClipConfig.js",
	"bin-debug/toolkits/utils/dragonBonesHelper/GTMovieClipManager.js",
	"bin-debug/toolkits/utils/layerHelper/GTBasicItemRenderer.js",
	"bin-debug/toolkits/utils/layerHelper/GTBasicLayer.js",
	"bin-debug/toolkits/utils/layerHelper/GTLayerActionHelper.js",
	"bin-debug/toolkits/utils/layerHelper/GTLayerManager.js",
	//----auto game_file_list end----
];

var window = this;

egret_native.setSearchPaths([""]);

egret_native.requireFiles = function () {
    for (var key in game_file_list) {
        var src = game_file_list[key];
        require(src);
    }
};

egret_native.egretInit = function () {
    if(egret_native.featureEnable) {
        //控制一些优化方案是否开启
        var result = egret_native.featureEnable({
            
        });
    }
    egret_native.requireFiles();
    //egret.dom为空实现
    egret.dom = {};
    egret.dom.drawAsCanvas = function () {
    };
};

egret_native.egretStart = function () {
    var option = {
        //以下为自动修改，请勿修改
        //----auto option start----
		entryClassName: "Main",
		frameRate: 30,
		scaleMode: "showAll",
		contentWidth: 750,
		contentHeight: 1206,
		showPaintRect: false,
		showFPS: false,
		fpsStyles: "x:0,y:0,size:12,textColor:0xffffff,bgAlpha:0.9",
		showLog: false,
		logFilter: "",
		maxTouches: 2,
		textureScaleFactor: 1
		//----auto option end----
    };

    egret.native.NativePlayer.option = option;
    egret.runEgret();
    egret_native.Label.createLabel("/system/fonts/DroidSansFallback.ttf", 20, "", 0);
    egret_native.EGTView.preSetOffScreenBufferEnable(true);
};