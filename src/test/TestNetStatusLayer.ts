class TestNetStatusLayer extends eui.Component implements  eui.UIComponent {
public group_basic:eui.Group;
public btn_close:eui.Button;

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

		this.init();

		this.btn_close.addEventListener(egret.TouchEvent.TOUCH_END, this.handleTouch, this);
	}

	private init(): void {
		let struct: CtlNetStatusStruct = { 	
			currentValue: 100 , 
			signalExcellentValue: 20 ,
			signalGoodValue: 50 ,
			signalPoorValuEe: 100 , 
			imgExcellentName: "net_green_png" , 
			imgGoodName: "net_yellow_png" ,
			imgPoorName: "net_red_png" , 
		}
		let ctlNetStatus: CtrNetStatus = new CtrNetStatus(struct);
		this.addChild(ctlNetStatus);

		let timer: egret.Timer = new egret.Timer(800);
		timer.addEventListener(egret.TimerEvent.TIMER, function(evt: egret.TimerEvent) {
			let randValue: number = Math.floor(Math.random() * 200);
			ctlNetStatus.updateStatus(randValue);
			console.log("~~~~~~~  current value is " , randValue );
		} , this );
		timer.start();
	}
	

	public handleTouch(event:egret.Event):void
	{ 
		this.parent.removeChild(this);
		GameMainscene.GetInstatnce().SetTestLayerVisible(true);
	}
}