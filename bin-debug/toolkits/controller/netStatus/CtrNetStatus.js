var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var enumCtlNetStatusType;
(function (enumCtlNetStatusType) {
    enumCtlNetStatusType[enumCtlNetStatusType["excellent"] = 0] = "excellent";
    enumCtlNetStatusType[enumCtlNetStatusType["good"] = 1] = "good";
    enumCtlNetStatusType[enumCtlNetStatusType["poor"] = 2] = "poor";
})(enumCtlNetStatusType || (enumCtlNetStatusType = {}));
/**
 * @brief 表示网络状态的控件
 * 需要将CtlNetStatusStruct 构造函数中初始化 中各个区间值和 对应图片名字
 * 在需要的地方随时更新rtt值来变换图片 updateStatus()
 */
var CtrNetStatus = (function (_super) {
    __extends(CtrNetStatus, _super);
    function CtrNetStatus(struct) {
        var _this = _super.call(this) || this;
        _this.mImg_netStatus = null;
        // private cImgRed: string = "net_red_png";
        // private cImgYellow: string = "net_yellow_png";
        // private cImgGreen: string = "net_green_png";
        _this.mNetStatusStruct = null;
        _this.mNetStatusType = enumCtlNetStatusType.excellent;
        _this.mNetStatusStruct = struct;
        _this.skinName = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n\t\t<e:Skin class=\"CtrNetStatusSkin\" width=\"400\" height=\"300\" xmlns:e=\"http://ns.egret.com/eui\" xmlns:w=\"http://ns.egret.com/wing\" >\n\t\t\t<w:Config id=\"15f06854cab\" ></w:Config>\n\t\t</e:Skin>";
        return _this;
    }
    CtrNetStatus.prototype.partAdded = function (partName, instance) {
        _super.prototype.partAdded.call(this, partName, instance);
    };
    CtrNetStatus.prototype.childrenCreated = function () {
        _super.prototype.childrenCreated.call(this);
        this.updateStatus(this.mNetStatusStruct.currentValue);
    };
    /**
     * 在需要的地方随时更新rtt值来变换图片
     */
    CtrNetStatus.prototype.updateStatus = function (value) {
        this.mNetStatusStruct.currentValue = value;
        if (this.mNetStatusStruct.currentValue < this.mNetStatusStruct.signalExcellentValue) {
            this.mNetStatusType = enumCtlNetStatusType.excellent;
        }
        else if (this.mNetStatusStruct.currentValue >= this.mNetStatusStruct.signalExcellentValue &&
            this.mNetStatusStruct.currentValue < this.mNetStatusStruct.signalGoodValue) {
            this.mNetStatusType = enumCtlNetStatusType.good;
        }
        else {
            this.mNetStatusType = enumCtlNetStatusType.poor;
        }
        var isNew = false;
        if (!this.mImg_netStatus) {
            this.mImg_netStatus = new eui.Image();
            isNew = true;
        }
        switch (this.mNetStatusType) {
            case enumCtlNetStatusType.excellent:
                if (this.mImg_netStatus.source != this.mNetStatusStruct.imgExcellentName) {
                    this.mImg_netStatus.source = this.mNetStatusStruct.imgExcellentName;
                }
                break;
            case enumCtlNetStatusType.good:
                if (this.mImg_netStatus.source != this.mNetStatusStruct.imgGoodName) {
                    this.mImg_netStatus.source = this.mNetStatusStruct.imgGoodName;
                }
                break;
            case enumCtlNetStatusType.poor:
                if (this.mImg_netStatus.source != this.mNetStatusStruct.imgPoorName) {
                    this.mImg_netStatus.source = this.mNetStatusStruct.imgPoorName;
                }
                break;
            default:
                break;
        }
        if (isNew) {
            this.addChild(this.mImg_netStatus);
            this.mImg_netStatus.x = 0;
            this.mImg_netStatus.y = 0;
            this.width = this.mImg_netStatus.width;
            this.height = this.mImg_netStatus.height;
        }
    };
    return CtrNetStatus;
}(eui.Component));
__reflect(CtrNetStatus.prototype, "CtrNetStatus", ["eui.UIComponent", "egret.DisplayObject"]);
//# sourceMappingURL=CtrNetStatus.js.map