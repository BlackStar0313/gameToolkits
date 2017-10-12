class GameMainscene extends egret.DisplayObjectContainer{
	public static _inst: GameMainscene = null ; 
	public constructor() {
		super();
		this.once(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
	}

	public GetInstatnce(): GameMainscene {
		if (GameMainscene._inst == null) {
			GameMainscene._inst = new GameMainscene() ; 
		}
		return GameMainscene._inst; 
	}

	public onAddToStage(): void {
		this.initialize();
	}
	
	private initialize(): void {
		// //test CtlNetStatusStruct
		// //<<<<<<<<<<<<<<<<<<
		// let struct: CtlNetStatusStruct = { 	
		// 	currentValue: 100 , 
		// 	signalExcellentValue: 20 ,
		// 	signalGoodValue: 50 ,
		// 	signalPoorValuEe: 100 , 
		// 	imgExcellentName: "net_green_png" , 
		// 	imgGoodName: "net_yellow_png" ,
		// 	imgPoorName: "net_red_png" , 
		// }
		// let ctlNetStatus: CtrNetStatus = new CtrNetStatus(struct);
		// this.addChild(ctlNetStatus);

		// let timer: egret.Timer = new egret.Timer(800);
		// timer.addEventListener(egret.TimerEvent.TIMER, function(evt: egret.TimerEvent) {
		// 	let randValue: number = Math.floor(Math.random() * 200);
		// 	ctlNetStatus.updateStatus(randValue);
		// 	console.log("~~~~~~~  current value is " , randValue );
		// } , this );
		// timer.start();
		// //>>>>>>>>>>>>>>>>>>

		//test CtrRadarChart
		let ctrRaderChart: CtrRadarChart = new CtrRadarChart();
		ctrRaderChart.x = 300 ; 
		ctrRaderChart.y = 500 ;
		this.addChild(ctrRaderChart);
	}
}