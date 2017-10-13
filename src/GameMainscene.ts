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
		//<<<<<<<<<<<<<<<<<<<<<<<<<<<
		let dataArray: Array<CtrRadarChartPropertyData> = [] ; 
		let data1:CtrRadarChartPropertyData = { name: "胸", currentValue: 90 , maxValue: 100 , nameColor: 0xeeffcc , valueColor: 0xeeff00 ,labelSize: 30};
		let data2 = { name: "屁股", currentValue: 80 , maxValue: 100 , nameColor: 0xeecccc , valueColor: 0xeeff00 ,labelSize: 30};
		let data3 = { name: "腰", currentValue: 60 , maxValue: 100 , nameColor: 0xeebbcc , valueColor: 0xeeff00 ,labelSize: 30};
		let data4 = { name: "腿", currentValue: 20 , maxValue: 100 , nameColor: 0xeeaacc , valueColor: 0xeeff00 ,labelSize: 30};
		let data5 = { name: "手", currentValue: 40 , maxValue: 100 , nameColor: 0xaaffcc , valueColor: 0xeeff00 ,labelSize: 30};
		let data6 = { name: "脸", currentValue: 50 , maxValue: 100 , nameColor: 0xbbffcc , valueColor: 0xeeff00 ,labelSize: 30};
		dataArray.push(data1);
		dataArray.push(data2);
		dataArray.push(data3);
		dataArray.push(data4);
		dataArray.push(data5);
		dataArray.push(data6);
		let ctrRaderChart: CtrRadarChart = new CtrRadarChart(dataArray, true );
		ctrRaderChart.x = 300 ; 
		ctrRaderChart.y = 500 ;
		ctrRaderChart.isShowPercentValue = true ; 
		this.addChild(ctrRaderChart);

		let drawBgLineInfo: CtrRadarChartDrawBgLineInfo = { radius: 4 ,color: 0x00ff00,alpha: 1} ;
		ctrRaderChart.SetDrawBgLineInfo(drawBgLineInfo);
		let drawPropertyInfo: CtrRadarChartDrawPropertyInfo = { pointRadius: 10 ,pointColor: 0xff00ff,pointAlpha: 1 , lineRadius: 4 ,lineColor: 0xff00ff,lineAlpha: 1, bgColor: 0xff0000, bgAlpha: 0.5 };
		ctrRaderChart.SetDrawPropertyInfo(drawPropertyInfo);
		// ctrRaderChart.ValidateCtrNow();

		
		//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	}
}