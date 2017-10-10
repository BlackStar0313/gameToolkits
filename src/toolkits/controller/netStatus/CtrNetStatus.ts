
/**
 * 区间值为左闭右开
 */
type CtlNetStatusStruct = {
	currentValue: number , 
	signalExcellentValue: number ,
	signalGoodValue: number ,
	signalPoorValuEe: number , 
	imgExcellentName: string , 
	imgGoodName: string ,
	imgPoorName: string , 
}

enum enumCtlNetStatusType {
	excellent = 0 , 
	good ,
	poor 
}

/**
 * @brief 表示网络状态的控件
 * 需要将CtlNetStatusStruct 构造函数中初始化 中各个区间值和 对应图片名字
 * 在需要的地方随时更新rtt值来变换图片 updateStatus()
 */
class CtrNetStatus extends eui.Component implements  eui.UIComponent {
	public mImg_netStatus:eui.Image = null;

	// private cImgRed: string = "net_red_png";
	// private cImgYellow: string = "net_yellow_png";
	// private cImgGreen: string = "net_green_png";
	private mNetStatusStruct: CtlNetStatusStruct = null ; 
	private mNetStatusType: enumCtlNetStatusType = enumCtlNetStatusType.excellent;

	public constructor(struct: CtlNetStatusStruct) {
		super();
		this.mNetStatusStruct = struct ;

		this.skinName = `<?xml version="1.0" encoding="utf-8"?>
		<e:Skin class="CtrNetStatusSkin" width="400" height="300" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >
			<w:Config id="15f06854cab" ></w:Config>
		</e:Skin>`
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		this.updateStatus(this.mNetStatusStruct.currentValue);
	}

	/**
	 * 在需要的地方随时更新rtt值来变换图片
	 */
	public updateStatus(value: number ): void {
		this.mNetStatusStruct.currentValue = value ; 
		if (this.mNetStatusStruct.currentValue < this.mNetStatusStruct.signalExcellentValue ) {
			this.mNetStatusType = enumCtlNetStatusType.excellent ; 
		}
		else if (this.mNetStatusStruct.currentValue >= this.mNetStatusStruct.signalExcellentValue &&
				this.mNetStatusStruct.currentValue < this.mNetStatusStruct.signalGoodValue ) {

			this.mNetStatusType = enumCtlNetStatusType.good;
		}
		else {
			this.mNetStatusType = enumCtlNetStatusType.poor; 
		}


		let isNew: boolean = false ; 
		if (!this.mImg_netStatus) {
			this.mImg_netStatus = new eui.Image();
			isNew = true ; 
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
			this.width = this.mImg_netStatus.width ; 
			this.height = this.mImg_netStatus.height ; 
		}
	}
	
}