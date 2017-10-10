var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GameMainscene = (function (_super) {
    __extends(GameMainscene, _super);
    function GameMainscene() {
        var _this = _super.call(this) || this;
        _this.once(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    GameMainscene.prototype.GetInstatnce = function () {
        if (GameMainscene._inst == null) {
            GameMainscene._inst = new GameMainscene();
        }
        return GameMainscene._inst;
    };
    GameMainscene.prototype.onAddToStage = function () {
        this.initialize();
    };
    GameMainscene.prototype.initialize = function () {
        //test CtlNetStatusStruct
        //<<<<<<<<<<<<<<<<<<
        var struct = {
            currentValue: 100,
            signalExcellentValue: 20,
            signalGoodValue: 50,
            signalPoorValuEe: 100,
            imgExcellentName: "net_green_png",
            imgGoodName: "net_yellow_png",
            imgPoorName: "net_red_png",
        };
        var ctlNetStatus = new CtrNetStatus(struct);
        this.addChild(ctlNetStatus);
        var timer = new egret.Timer(800);
        timer.addEventListener(egret.TimerEvent.TIMER, function (evt) {
            var randValue = Math.floor(Math.random() * 200);
            ctlNetStatus.updateStatus(randValue);
            console.log("~~~~~~~  current value is ", randValue);
        }, this);
        timer.start();
        //>>>>>>>>>>>>>>>>>>
    };
    return GameMainscene;
}(egret.DisplayObjectContainer));
GameMainscene._inst = null;
__reflect(GameMainscene.prototype, "GameMainscene");
//# sourceMappingURL=GameMainscene.js.map