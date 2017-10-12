type CtrRadarChartPropertyInfo = {
	pointRadius: number ,
	pointColor: number ,
	pointAlpha: number ,
	lineRadius: number ,
	lineColor: number ,
	lineAlpha: number ,
	bgColor: number ,
	bgAlpha: number 
}

type CtrRadarChartLineInfo = {
	radius: number ,
	color: number ,
	alpha: number ,

}

type CtrRadarChartPropertyData = {
	name: string , 
	currentValue: number ,
	maxValue: number , 
	color: number , 
}

/**
 * @brief 绘制属性雷达图
 *  支持矢量图绘制雷达图底图，连线，属性范围连线，底图，属性点
 *  即将支持图片贴图显示雷达图底图，连线，属性范围连线，底图，属性点
 */
class CtrRadarChart extends eui.Component implements  eui.UIComponent {
	private mSourcePos: egret.Point = new egret.Point(0,0);
	private mBgArray: Array<egret.Shape> = [] ; 
	private mSides: number = 0 ;	//n变形
	private mCycles: number = 0 ; 	//m圈
	private mRadius: number = 0; 	//正多边形外接圆半径
	private mLinePointArray: Array< Array <egret.Point> > = [] ;    //二维数组，[ 第几个环:[每个环里各个顶点坐标] ]
	private mPropertyPointArray: Array<egret.Point> = [] ; 			//各个属性坐标
	private mLineAngle: Array<number> = [] ;		//记录对应属性线的角度，用来计算对应点的位置
	private mPI: number = Math.PI ; 
	private mIsDrawPropertyPoint: boolean = false ; 
	private mRadarChartPropertyInfo: CtrRadarChartPropertyInfo = { pointRadius: 10 ,pointColor: 0xff00ff,pointAlpha: 1 , lineRadius: 4 ,lineColor: 0xff00ff,lineAlpha: 1, bgColor: 0xff0000, bgAlpha: 0.5 } ; 
	private mRadarChartLineInfo: CtrRadarChartLineInfo = { radius: 4 ,color: 0x00ff00,alpha: 1} ;
	private mDataArray: Array<CtrRadarChartPropertyData> = [] ; 
	private mLabelDist: number = 0 ; 

	public constructor() {
		super();

		this.skinName = `<?xml version="1.0" encoding="utf-8"?>
		<e:Skin class="CtrRadarChartSkin" width="400" height="300" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >
			<w:Config id="15f06854cab" ></w:Config>
		</e:Skin>`

		this.mSides = 6 ; 
		this.mCycles = 3 ; 
		this.mRadius = 200 ;
		this.mIsDrawPropertyPoint = true ;
		this.mLabelDist = 30;
		
		let data1:CtrRadarChartPropertyData = { name: "胸", currentValue: 90 , maxValue: 100 , color: 0xeeffcc };
		let data2 = { name: "屁股", currentValue: 80 , maxValue: 100 , color: 0xeeffcc };
		let data3 = { name: "腰", currentValue: 60 , maxValue: 100 , color: 0xeeffcc };
		let data4 = { name: "腿", currentValue: 20 , maxValue: 100 , color: 0xeeffcc };
		let data5 = { name: "手", currentValue: 40 , maxValue: 100 , color: 0xeeffcc };
		let data6 = { name: "脸", currentValue: 50 , maxValue: 100 , color: 0xeeffcc };
		this.mDataArray.push(data1);
		this.mDataArray.push(data2);
		this.mDataArray.push(data3);
		this.mDataArray.push(data4);
		this.mDataArray.push(data5);
		this.mDataArray.push(data6);


	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	private init(): void {
		this.preInit();

		this.generateRadarPos();
		this.generatePropertyPos();

		this.drawBgRadarCycle();
		this.drawBgRadarLinkLine();
		this.drawPropertyInfo();
	}

	private preInit(): void {
		this.width = this.mRadius*2;
		this.height = this.mRadius*2;
	}

	private generateRadarPos(): void {
		let pi: number = Math.PI;
		let disAngle: number = this.mSides%2 > 0 ? - (90/360)*2*pi  : 0; 	//基数的图形，已90°为开始点
		for (let iCycles = 0 ; iCycles < this.mCycles; ++iCycles) {
			let arrayPoint: Array <egret.Point> = [] ; 
			let cyclesR: number = this.mRadius/this.mCycles ; 
			for (let iSides = 0 ; iSides < this.mSides; ++iSides) {
				let angle: number = iSides* 2*pi/this.mSides + disAngle;
				let point: egret.Point = new egret.Point();
				point.x = Math.cos(angle) * (cyclesR*(iCycles + 1)) ;		//排除原点作为了第一圈	
				point.y = Math.sin(angle) * (cyclesR*(iCycles + 1)) ;
				arrayPoint.push(point);

				if (iCycles == 0) {
					this.mLineAngle.push(angle);
				}


				if (iSides == 0 && iCycles == this.mCycles-1) {
					this.createShapPointCricle(point.x , point.y , 10 , 0xff00ff, 1);
				}
				if (iSides == 1 && iCycles == this.mCycles-1) {
					this.createShapPointCricle(point.x , point.y , 10 , 0xffffff, 1);
				}
			}
			this.mLinePointArray.push(arrayPoint);
		}
	}

	private generatePropertyPos(): void {
		for (let i = 0 ;i < this.mSides; ++i) {
			let scale = this.mDataArray[i].currentValue / this.mDataArray[i].maxValue;
			let len = scale * this.mRadius;	//算出这个点的长度
			let angle: number = this.mLineAngle[i];
			let point: egret.Point = new egret.Point();
			point.x = Math.cos(angle) * len ;
			point.y = Math.sin(angle) * len ;
			this.mPropertyPointArray.push(point);
		}
	}

	private drawBgRadarCycle(): void {
		for (let iCycles = 0 ; iCycles < this.mCycles; ++iCycles) {
			let polygon: egret.Shape = new egret.Shape();
			polygon.graphics.lineStyle(this.mRadarChartLineInfo.radius , this.mRadarChartLineInfo.color);
			polygon.graphics.moveTo(this.mLinePointArray[iCycles][0].x , this.mLinePointArray[iCycles][0].y);
			for (let iSides = 0 ; iSides < this.mSides; ++iSides) {
				polygon.graphics.lineTo(this.mLinePointArray[iCycles][iSides].x , this.mLinePointArray[iCycles][iSides].y);
			}
			polygon.graphics.lineTo(this.mLinePointArray[iCycles][0].x , this.mLinePointArray[iCycles][0].y);
			polygon.graphics.endFill();
			this.addChild(polygon);
			this.mBgArray.push(polygon);
		}
	}

	private drawBgRadarLinkLine(): void {
		for (let iSides = 0 ; iSides < this.mSides ; ++iSides) {
			let line: egret.Shape = new egret.Shape();
			line.graphics.lineStyle(this.mRadarChartLineInfo.radius , this.mRadarChartLineInfo.color);
			line.graphics.moveTo(this.mSourcePos.x , this.mSourcePos.y);
			line.graphics.lineTo(this.mLinePointArray[this.mCycles-1][iSides].x , this.mLinePointArray[this.mCycles-1][iSides].y);
			line.graphics.endFill();
			this.addChild(line);
		}
	}

	private drawPropertyInfo(): void {
		//draw polygon
		let polygon: egret.Shape = new egret.Shape();
		polygon.graphics.lineStyle(this.mRadarChartPropertyInfo.lineRadius , this.mRadarChartPropertyInfo.lineColor);
		polygon.graphics.beginFill( this.mRadarChartPropertyInfo.bgColor, this.mRadarChartPropertyInfo.bgAlpha);
		polygon.graphics.moveTo(this.mPropertyPointArray[0].x , this.mPropertyPointArray[0].y);
		for (let iSides = 0 ; iSides < this.mPropertyPointArray.length; ++iSides) {
			polygon.graphics.lineTo(this.mPropertyPointArray[iSides].x , this.mPropertyPointArray[iSides].y);
		}
		polygon.graphics.lineTo(this.mPropertyPointArray[0].x , this.mPropertyPointArray[0].y);
		polygon.graphics.endFill();
		this.addChild(polygon);

		if (this.mIsDrawPropertyPoint) {
			for (let iSides = 0 ; iSides < this.mSides; ++iSides) {
				this.createShapPointCricle(this.mPropertyPointArray[iSides].x , 
											this.mPropertyPointArray[iSides].y , 
											this.mRadarChartPropertyInfo.pointRadius , 
											this.mRadarChartPropertyInfo.pointColor, 
											this.mRadarChartPropertyInfo.pointAlpha);
			}
		}

		//set label info 
		for (let iSides = 0 ; iSides < this.mSides; ++iSides) {
			let point: egret.Point = this.mLinePointArray[this.mCycles-1][iSides] ;
			point.x = point.x > this.mSourcePos.x ? point.x + this.mLabelDist : point.x - this.mLabelDist;
			point.y = point.y > this.mSourcePos.y ? point.y + this.mLabelDist : point.y - this.mLabelDist;
			
			let labelName: eui.Label = new eui.Label();
			labelName.text = this.mDataArray[iSides].name;
			labelName.x = point.x ; 
			labelName.y = point.y ;
			this.addChild(labelName);

			let labelValue: eui.Label = new eui.Label();
			labelValue.text = this.mDataArray[iSides].currentValue + "/" + this.mDataArray[iSides].maxValue;
			labelValue.x = point.x ;
			labelValue.y = point.y + 30;
			this.addChild(labelValue);
		}
	}

	private createShapPointCricle(x: number , y: number , radius: number , color: number , alpha: number): egret.Shape {
		var circle:egret.Shape = new egret.Shape();
		// centerPoint.graphics.lineStyle( 10, 0x00ff00 );
		circle.graphics.beginFill( color, alpha);
		circle.graphics.drawCircle( x, y, radius );
		circle.graphics.endFill();
		this.addChild( circle );
		return 
	}

}