class TestToolsLayerCell extends eui.ItemRenderer {
public img_bg:eui.Image;
public label_name:eui.Label;
	private cImgNormal: string = "bg_1_png";
	private cImgClick: string = "bg_1_s_png";
	private mType: enumToolsKit = enumToolsKit.CtrRadarChart;

	public constructor() {
		super();
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		this.initEvent();
	}

	private initEvent(): void {
		this.img_bg.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
		this.img_bg.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.touchReleaseOutside, this);
		this.img_bg.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);
	}
	
	protected dataChanged(): void {
		this.mType = this.data ;

		switch (this.mType) {
			case enumToolsKit.CtrNetStatus:
			{
				this.label_name.text = "网络状态图控件";
				break;
			}
				
			case enumToolsKit.CtrRadarChart:
			{
				this.label_name.text = "属性雷达图控件";
				break;
			}

			case enumToolsKit.UtilsAnimation:
			{
				this.label_name.text = "动画展示";
				break;
			}
			default:
				break;
		}
	}

	private touchBegin(evt: egret.TouchEvent): void {
		this.img_bg.source = this.cImgClick;
	}

	private touchEnd(evt: egret.TouchEvent): void {
		this.img_bg.source = this.cImgNormal;
		switch (this.mType) {
			case enumToolsKit.CtrNetStatus:
			{
				GameMainscene.GetInstatnce().SetTestLayerVisible(false);
				let layer: TestNetStatusLayer = new TestNetStatusLayer();
				GameMainscene.GetInstatnce().addChildAt(layer , 1);
				break;
			}
				
			case enumToolsKit.CtrRadarChart:
			{
				GameMainscene.GetInstatnce().SetTestLayerVisible(false);
				let layer: TestCtrRadarChartLayer = new TestCtrRadarChartLayer();
				GameMainscene.GetInstatnce().addChildAt(layer, 1);
				break;
			}

			case enumToolsKit.UtilsAnimation:
			{
				GameMainscene.GetInstatnce().SetTestLayerVisible(false);
				let layer: TestAnimationLayer = new TestAnimationLayer();
				GameMainscene.GetInstatnce().addChildAt(layer, 1);
			}
			default:
				break;
		}
	}

	private touchReleaseOutside(evt: egret.TouchEvent): void {
		this.img_bg.source = this.cImgNormal;
	}
}