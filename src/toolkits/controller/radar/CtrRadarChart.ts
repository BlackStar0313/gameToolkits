type CtrRadarChartDrawPropertyInfo = {
	pointRadius: number ,
	pointColor: number ,
	pointAlpha: number ,
	lineRadius: number ,
	lineColor: number ,
	lineAlpha: number ,
	bgColor: number ,
	bgAlpha: number 
}

type CtrRadarChartDrawBgLineInfo = {
	radius: number ,
	color: number ,
	alpha: number ,

}

type CtrRadarChartPropertyData = {
	name: string , 
	currentValue: number ,
	maxValue: number , 
	nameColor: number , 
	valueColor: number , 
	labelSize: number 
}

enum EnumCtrRadarDrawLineType {
	bgImg = 0 ,			//整图替换雷达图
	vectorLine ,		//矢量线段画雷达图
	imgLine 			//图片做线段画雷达图
} 

/**
 * @brief 绘制属性雷达图
 *  以圆心为锚点
 * 
 *  支持矢量图绘制雷达图底图，连线，属性范围连线，底图，属性点
 *  即将支持图片贴图显示雷达图底图，连线，属性范围连线，底图，属性点
 */
class CtrRadarChart extends eui.Component implements  eui.UIComponent {
	private mCycles: number = 3 ; 	//m圈
	private mRadius: number = 0; 	//正多边形外接圆半径
	private mIsValidateImmediately: boolean = true ;
	private mLabelDist: number = 30 ;
	private mIsShowPercentValue: boolean = false ;  
	private mValueToFixed: number = 0 ;  //成比例时小数点后保留位数
	private mIsDrawPropertyPoint: boolean = false ; 
	private mDrawPropertyInfo: CtrRadarChartDrawPropertyInfo = { pointRadius: 10 ,pointColor: 0x3D9028,pointAlpha: 1 , lineRadius: 4 ,lineColor: 0x609D56,lineAlpha: 1, bgColor: 0x76A677, bgAlpha: 0.5 } ; 
	private mDrawBgLineInfo: CtrRadarChartDrawBgLineInfo = { radius: 4 ,color: 0xB1BEC8,alpha: 1} ;
	private mDataArray: Array<CtrRadarChartPropertyData> = [] ; 
	private mBgLineType: EnumCtrRadarDrawLineType = EnumCtrRadarDrawLineType.vectorLine ; 
	private mBgLineImgName: string = "";
	private mBgImg: string = "";

	private mSourcePos: egret.Point = new egret.Point(0,0);
	private mBgArray: Array<egret.Shape> = [] ; 
	private mSides: number = 0 ;	//n变形
	private mLinePointArray: Array< Array <egret.Point> > = [] ;    //二维数组，[ 第几个环:[每个环里各个顶点坐标] ]
	private mPropertyPointArray: Array<egret.Point> = [] ; 			//各个属性坐标
	private mLineAngle: Array<number> = [] ;		//记录对应属性线的角度，用来计算对应点的位置
	private mPI: number = Math.PI ; 




	/**
	 * @param dataArray 属性数组
	 * @param isValidateImmediately 是否在addchild之后，马上绘制
	 * @param cycles 显示的正多边形宽度
	 * @param radius 正多边形外接圆半径
	 * @param drawPropertyInfo 绘制属性图时用到的信息
	 * @param drawBgLineInfo 绘制雷达底图用到的信息
	 */
	public constructor(dataArray: Array<CtrRadarChartPropertyData>, isValidateImmediately: boolean = true ,cycles: number = 3 , radius: number = 150 , drawPropertyInfo ?:CtrRadarChartDrawPropertyInfo ,drawBgLineInfo ?:CtrRadarChartDrawBgLineInfo) {
		super();

		this.skinName = `<?xml version="1.0" encoding="utf-8"?>
		<e:Skin class="CtrRadarChartSkin" width="400" height="300" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >
			<w:Config id="15f06854cab" ></w:Config>
		</e:Skin>`

		this.mIsValidateImmediately = isValidateImmediately;
		this.mCycles = cycles ; 
		this.mRadius = radius ;

		if (drawPropertyInfo) {
			this.mDrawPropertyInfo = drawPropertyInfo;
		}
		if (drawBgLineInfo) {
			this.mDrawBgLineInfo = drawBgLineInfo ; 
		}


		//test code 
		// this.mBgLineType = EnumCtrRadarDrawLineType.bgImg;
		this.mBgLineImgName = "img_radar_line_png";
		this.mBgImg = "img_radar_bg_png"
		// let data1:CtrRadarChartPropertyData = { name: "胸", currentValue: 90 , maxValue: 100 , color: 0xeeffcc };
		// let data2 = { name: "屁股", currentValue: 80 , maxValue: 100 , color: 0xeeffcc };
		// let data3 = { name: "腰", currentValue: 60 , maxValue: 100 , color: 0xeeffcc };
		// let data4 = { name: "腿", currentValue: 20 , maxValue: 100 , color: 0xeeffcc };
		// let data5 = { name: "手", currentValue: 40 , maxValue: 100 , color: 0xeeffcc };
		// let data6 = { name: "脸", currentValue: 50 , maxValue: 100 , color: 0xeeffcc };
		// this.mDataArray.push(data1);
		// this.mDataArray.push(data2);
		// this.mDataArray.push(data3);
		// this.mDataArray.push(data4);
		// this.mDataArray.push(data5);
		// this.mDataArray.push(data6);

		this.setDataArray(dataArray);
	}

	public SetCycles(cycles: number): void { this.mCycles = cycles ; }
	public SetRadius(radius: number): void { this.mRadius = radius ; }
	public SetDrawBgLineInfo(info: CtrRadarChartDrawBgLineInfo): void { this.mDrawBgLineInfo = info; }
	public SetDrawPropertyInfo(info: CtrRadarChartDrawPropertyInfo): void { this.mDrawPropertyInfo = info; }

	public set isDrawPropertyPoint(isDraw: boolean ) { this.mIsDrawPropertyPoint = isDraw; }
	public get isDrawPropertyPoint():boolean { return this.mIsDrawPropertyPoint ; }

	public set isValidateImmediately(isValidate: boolean ) { this.mIsValidateImmediately = isValidate; }
	public get isValidateImmediately():boolean { return this.mIsValidateImmediately ; }

	public set isShowPercentValue(isShowPercent: boolean ) { this.mIsShowPercentValue = isShowPercent; }
	public get isShowPercentValue():boolean { return this.mIsShowPercentValue ; }

	public set valueToFixed(value: number ) { this.mValueToFixed = value; }
	public get valueToFixed():number { return this.mValueToFixed ; }

	/**
	 * 属性相对于点的距离
	 */
	public set labelDist(value: number ) { this.mLabelDist = value; }
	public get labelDist():number { return this.mLabelDist ; }

	private setDataArray(dataArray: Array<CtrRadarChartPropertyData>): void {
		for (let i = 0 ; i < dataArray.length ; ++i) {
			this.mDataArray.push({ name: dataArray[i].name, 
									currentValue: dataArray[i].currentValue , 
									maxValue: dataArray[i].maxValue , 
									nameColor: dataArray[i].nameColor, 
									valueColor: dataArray[i].valueColor ,
									labelSize: dataArray[i].labelSize});
		}

	}




	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		this.preInit();

		if (this.mIsValidateImmediately) 
			this.ValidateCtrNow();
	}

	public ValidateCtrNow(): void {
		this.clear();

		this.generateRadarPos();
		this.generatePropertyPos();

		this.drawBgRadarCycle();
		this.drawBgRadarLinkLine();
		this.drawPropertyInfo();
	}

	private preInit(): void {
		this.width = this.mRadius*2;
		this.height = this.mRadius*2;
		this.mSides = this.mDataArray.length;
	}

	private clear(): void {
		this.removeChildren();
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
				point.x = parseFloat( Math.cos(angle).toFixed(5)) * (cyclesR*(iCycles + 1)) ;		//排除原点作为了第一圈	
				point.y = parseFloat( Math.sin(angle).toFixed(5)) * (cyclesR*(iCycles + 1)) ;
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
		if (this.mBgLineType === EnumCtrRadarDrawLineType.vectorLine) {
			for (let iCycles = 0 ; iCycles < this.mCycles; ++iCycles) {
				let polygon: egret.Shape = new egret.Shape();
				polygon.graphics.lineStyle(this.mDrawBgLineInfo.radius , this.mDrawBgLineInfo.color);
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
		else if (this.mBgLineType === EnumCtrRadarDrawLineType.imgLine) {
			// for (let iCycles = 0 ; iCycles < this.mCycles; ++iCycles) {
			// 	let imgLine: eui.Image = new eui.Image(this.mBgLineImgName);
			// 	for (let iSides = 0 ; iSides < this.mSides; ++iSides) {
			// 		polygon.graphics.lineTo(this.mLinePointArray[iCycles][iSides].x , this.mLinePointArray[iCycles][iSides].y);
			// 	}
			// 	this.addChild(imgLine);
			// }
		}
		else {	//no line 
			if (this.mBgImg == "") {
				egret.error("please enter the bgimg or choose other way of drawing line ");
				return ;
			}

			let imgLine: eui.Image = new eui.Image(this.mBgImg);
			this.addChild(imgLine);
			imgLine.x = 0;
			imgLine.y = 0;
			imgLine.anchorOffsetX = imgLine.width/2;
			imgLine.anchorOffsetY = imgLine.height/2;
		}
		
	}

	private drawBgRadarLinkLine(): void {
		if (this.mBgLineType === EnumCtrRadarDrawLineType.vectorLine) {
			for (let iSides = 0 ; iSides < this.mSides ; ++iSides) {
				let line: egret.Shape = new egret.Shape();
				line.graphics.lineStyle(this.mDrawBgLineInfo.radius , this.mDrawBgLineInfo.color);
				line.graphics.moveTo(this.mSourcePos.x , this.mSourcePos.y);
				line.graphics.lineTo(this.mLinePointArray[this.mCycles-1][iSides].x , this.mLinePointArray[this.mCycles-1][iSides].y);
				line.graphics.endFill();
				this.addChild(line);
			}
		}
		else if (this.mBgLineType === EnumCtrRadarDrawLineType.imgLine) {

		}
		else {	//no line 
			
		}
		
	}

	private drawPropertyInfo(): void {
		//draw polygon
		let polygon: egret.Shape = new egret.Shape();
		polygon.graphics.lineStyle(this.mDrawPropertyInfo.lineRadius , this.mDrawPropertyInfo.lineColor);
		polygon.graphics.beginFill( this.mDrawPropertyInfo.bgColor, this.mDrawPropertyInfo.bgAlpha);
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
											this.mDrawPropertyInfo.pointRadius , 
											this.mDrawPropertyInfo.pointColor, 
											this.mDrawPropertyInfo.pointAlpha);
			}
		}

		//set label info 
		for (let iSides = 0 ; iSides < this.mSides; ++iSides) {
			let point: egret.Point = this.mLinePointArray[this.mCycles-1][iSides] ;
			point.x = point.x > this.mSourcePos.x ? point.x + this.mLabelDist : point.x - this.mLabelDist;
			point.y = point.y > this.mSourcePos.y ? point.y + this.mLabelDist : point.y - this.mLabelDist;
			
			let labelName: eui.Label = new eui.Label();
			this.addChild(labelName);
			labelName.size = this.mDataArray[iSides].labelSize;
			labelName.text = this.mDataArray[iSides].name;
			labelName.textAlign = point.x > this.mSourcePos.x ? egret.HorizontalAlign.LEFT : egret.HorizontalAlign.RIGHT;
			labelName.x = labelName.textAlign == egret.HorizontalAlign.LEFT ? point.x : point.x - labelName.width; 
			labelName.y = point.y > this.mSourcePos.y ? point.y - labelName.height : point.y ;
			labelName.textColor = this.mDataArray[iSides].nameColor;

			let value: string = "";
			if (this.mIsShowPercentValue) {
				value = (this.mDataArray[iSides].currentValue/this.mDataArray[iSides].maxValue * 100).toFixed(this.mValueToFixed) + "%";
			}
			else {
				value = this.mDataArray[iSides].currentValue + "/" + this.mDataArray[iSides].maxValue;
			}
			let labelValue: eui.Label = new eui.Label();
			this.addChild(labelValue);
			labelValue.size = this.mDataArray[iSides].labelSize;
			labelValue.textAlign = point.x > this.mSourcePos.x ? egret.HorizontalAlign.LEFT : egret.HorizontalAlign.RIGHT;
			labelValue.text = value;
			labelValue.x = labelValue.textAlign == egret.HorizontalAlign.LEFT ? point.x : point.x - labelValue.width;
			labelValue.y = labelName.y + labelName.height;
			labelValue.textColor = this.mDataArray[iSides].valueColor;
		}
	}

	private createShapPointCricle(x: number , y: number , radius: number , color: number , alpha: number): egret.Shape {
		var circle:egret.Shape = new egret.Shape();
		// centerPoint.graphics.lineStyle( 10, 0x00ff00 );
		circle.graphics.beginFill( color, alpha);
		circle.graphics.drawCircle( x, y, radius );
		circle.graphics.endFill();
		this.addChild( circle );
		return circle;
	}

}