type CtrRadarChartDrawPropertyInfo = {
	lineRadius: number ,
	lineColor: number ,
	lineAlpha: number ,
	bgColor: number ,
	bgAlpha: number 
}

type CtrRadarChartDrawShapeInfo = {
	radius: number ,
	color: number ,
	alpha: number ,

}

type CtrRadarChartPropertyData = {
	name: string , 
	currentValue: number ,
	compairedValue: number ,
	maxValue: number , 
	nameColor: number , 
	valueColor: number , 
	labelSize: number 
}

enum EnumCtrRadarShowLineType {
	bgImg = 0 ,			//整图替换雷达图
	vectorLine ,		//矢量线段画雷达图
	imgLine 			//图片做线段画雷达图
} 

enum EnumCtrRadarShowProPointType {
	noPoint,		//不显示属性点
	verctorPoint,	//矢量图
	imgPoint,		//图片点
}

enum EnumCtrRadarShowProType {
	self = 0 ,				//单独一个
	comparison,			//对比两个
}

enum EnumCtrRadarShowValueType {
	showNone,			//""
	showOnlyValue,		//"89"
	showPercent,		//"89%"
	showAll,			//"89/100"
}

/**
 * @brief 绘制属性雷达图
 *  以圆心为锚点
 * 
 * 	支持修改圈数，半径
 *  支持矢量图绘制雷达图底图，连线，属性范围连线，底图，属性点
 *  支持图片贴图显示雷达图底图，连线，属性范围连线，底图，属性点
 * 	支持雷达底图使用整张图片替换
 * 	支持两个雷达属性图对比
 *  支持属性文本修改颜色，大小，显示百分比，显示当前值，显示当前值和最大值
 */
class CtrRadarChart extends eui.Component implements  eui.UIComponent {
	private mCycles: number = 3 ; 	//m圈
	private mRadius: number = 0; 	//正多边形外接圆半径
	private mLabelDist: number = 30 ;
	private mValueToFixed: number = 0 ;  //成比例时小数点后保留位数
	private mDrawPropertyInfo: Array<CtrRadarChartDrawPropertyInfo>  = [{ lineRadius: 4 ,lineColor: 0x609D56,lineAlpha: 1, bgColor: 0x76A677, bgAlpha: 0.5 } , { lineRadius: 4 ,lineColor: 0x0033ff,lineAlpha: 1, bgColor: 0x0022ff, bgAlpha: 0.5 }]; 
	private mDrawPropertyPointInfo:Array<CtrRadarChartDrawShapeInfo>  = [{ radius: 10 ,color: 0x009028,alpha: 1}, { radius: 10 ,color: 0x3D9000,alpha: 1}] ;
	private mImgNamePropertyPoint: string = "";
	private mShowPropertyPointType: EnumCtrRadarShowProPointType = EnumCtrRadarShowProPointType.noPoint;
	private mDrawBgLineInfo: CtrRadarChartDrawShapeInfo = { radius: 4 ,color: 0xB1BEC8,alpha: 1} ;
	private mDataArray: Array<CtrRadarChartPropertyData> = [] ; 
	private mShowBgLineType: EnumCtrRadarShowLineType = EnumCtrRadarShowLineType.vectorLine ; 
	private mImgNameBgLine: string = "";
	private mImgBg: string = "";
	private mShowPropertyType: EnumCtrRadarShowProType = EnumCtrRadarShowProType.self;
	private mShowValueType: EnumCtrRadarShowValueType = EnumCtrRadarShowValueType.showNone;

	private mSourcePos: egret.Point = new egret.Point(0,0);
	private mBgArray: Array<egret.Shape> = [] ; 
	private mSides: number = 0 ;	//n变形
	private mLinePointArray: Array< Array <egret.Point> > = [] ;    //二维数组，[ 第几个环:[每个环里各个顶点坐标] ]
	private mPropertyPointArray:Array<Array<egret.Point>>  = [] ; 			//[属性归属者  [各个属性坐标]]
	private mLineAngle: Array<number> = [] ;		//记录对应属性线的角度，用来计算对应点的位置
	private mPI: number = Math.PI ; 




	/**
	 * @param dataArray 属性数组
	 * @param cycles 显示的正多边形宽度
	 * @param radius 正多边形外接圆半径
	 */
	public constructor(dataArray: Array<CtrRadarChartPropertyData> ,cycles: number = 3 , radius: number = 150) {
		super();

		this.skinName = `<?xml version="1.0" encoding="utf-8"?>
		<e:Skin class="CtrRadarChartSkin" width="400" height="300" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >
			<w:Config id="15f06854cab" ></w:Config>
		</e:Skin>`

		this.mCycles = cycles ; 
		this.mRadius = radius ;

		this.setDataArray(dataArray);
	}


	/**
	 * @brief 设置属性点类型
	 * @param type 属性点类型： 不显示，矢量图显示，图片显示
	 * @param img 图片显示时图片名字
	 * @param drawPropertyPointInfoSelf 矢量图属性点自身属性
	 * @param drawPropertyPointInfoCompaired 矢量图对比属性点自身属性
	 */
	public SetShowPropertyPointType(type: EnumCtrRadarShowProPointType , img?: string , drawPropertyPointInfoSelf?: CtrRadarChartDrawShapeInfo ,drawPropertyPointInfoCompaired?: CtrRadarChartDrawShapeInfo ) { 
		this.mShowPropertyPointType = type; 
		if (type == EnumCtrRadarShowProPointType.imgPoint) {
			this.mImgNamePropertyPoint = img ;
		}
		else if (type == EnumCtrRadarShowProPointType.verctorPoint) {
			if (drawPropertyPointInfoSelf) {
				this.mDrawPropertyPointInfo[EnumCtrRadarShowProType.self] = drawPropertyPointInfoSelf;
			}
			if (drawPropertyPointInfoCompaired) {
				this.mDrawPropertyPointInfo[EnumCtrRadarShowProType.comparison] = drawPropertyPointInfoCompaired;
			}
		}
	}
	public GetShowPropertyPointType():EnumCtrRadarShowProPointType { return this.mShowPropertyPointType ; }

	/**
	 * @brief 设置雷达图背景线条属性
	 * @param type 背景线条类型: 整图做背景，矢量图画线，图片画线
	 * @param imgBg 整图做背景，图片名字
	 * @param imgLine 图片画线时，图片名字
	 * @param drawBgLineInfo 矢量图画线时，相关属性
	 */
	public SetShowBgLineType(type: EnumCtrRadarShowLineType ,imgBg?: string , imgLine?: string , drawBgLineInfo?: CtrRadarChartDrawShapeInfo ) { 
		this.mShowBgLineType = type; 

		if (type == EnumCtrRadarShowLineType.bgImg) {
			this.mImgBg = imgBg;
		}
		else if (type == EnumCtrRadarShowLineType.imgLine) {
			this.mImgNameBgLine = imgLine;
		}
		else if (type == EnumCtrRadarShowLineType.vectorLine) {
			this.mDrawBgLineInfo = drawBgLineInfo;
		}
	}
	public GetShowBgLineType():EnumCtrRadarShowLineType { return this.mShowBgLineType ; }

	/**
	 * @brief 设置雷达图属性范围显示
	 * @param type 是否有对比属性
	 * @param selfOne 本身属性显示参数
	 * @param compaireOne 对比属性显示参数
	 */
	public SetShowPropertyType(type: EnumCtrRadarShowProType , selfOne?:CtrRadarChartDrawPropertyInfo, compaireOne?: CtrRadarChartDrawPropertyInfo) { 
		this.mShowPropertyType = type ; 
		if (type == EnumCtrRadarShowProType.self) {
			if (selfOne) {
				this.mDrawPropertyInfo[EnumCtrRadarShowProType.self] = selfOne;
			}
		}
		else if (type == EnumCtrRadarShowProType.comparison) {
			if (selfOne) {
				this.mDrawPropertyInfo[EnumCtrRadarShowProType.self] = selfOne;
			}
			if (compaireOne) {
				this.mDrawPropertyInfo[EnumCtrRadarShowProType.comparison] = compaireOne; 
			}
		}
	}
	// public GetShowPropertyType():CtrRadarChartDrawPropertyInfo { return this.mDrawPropertyInfoSelf;}


	/**
	 * @brief 设置属性文本显示
	 * @param type 显示方式： "" , "80" , "89/100" "89%"
	 * @param valueToFixed 属性百分比小数点后保留位数
	 */
	public SetShowValueType(type: EnumCtrRadarShowValueType , valueToFixed: number = 0): void { 
		this.mShowValueType = type ;
		this.mValueToFixed = valueToFixed;
	}
	public GetShowValueType(): EnumCtrRadarShowValueType { return this.mShowValueType ;}



	public set cycles(v:number) { this.mCycles = v; }
	public get cycles():number { return this.mCycles;}

	public set radius(v:number) { this.mRadius = v; }
	public get radius():number { return this.mRadius;}



	/**
	 * 属性相对于点的距离
	 */
	public set labelDist(value: number ) { this.mLabelDist = value; }
	public get labelDist():number { return this.mLabelDist ; }

	private setDataArray(dataArray: Array<CtrRadarChartPropertyData>): void {
		for (let i = 0 ; i < dataArray.length ; ++i) {
			this.mDataArray.push({ name: dataArray[i].name, 
									currentValue: dataArray[i].currentValue , 
									compairedValue: dataArray[i].compairedValue ,
									maxValue: dataArray[i].maxValue , 
									nameColor: dataArray[i].nameColor , 
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
	}

	public DrawNow(): void {
		this.clear();

		this.generateRadarPos();
		this.generatePropertyPos();

		this.drawBgRadarCycle();
		this.drawBgRadarLinkLine();
		this.drawProperty();
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
			}
			this.mLinePointArray.push(arrayPoint);
		}
	}

	private generatePropertyPos(): void {
		this.mPropertyPointArray[EnumCtrRadarShowProType.self] = [];
		this.mPropertyPointArray[EnumCtrRadarShowProType.comparison] = [] ; 
		for (let i = 0 ;i < this.mSides; ++i) {
			
			let scale = this.mDataArray[i].currentValue / this.mDataArray[i].maxValue;
			let len = scale * this.mRadius;	//算出这个点的长度
			let angle: number = this.mLineAngle[i];
			let point: egret.Point = new egret.Point();
			point.x = Math.cos(angle) * len ;
			point.y = Math.sin(angle) * len ;
			this.mPropertyPointArray[EnumCtrRadarShowProType.self].push(point);

			if (this.mShowPropertyType == EnumCtrRadarShowProType.comparison) {
				let scaleCompaired = this.mDataArray[i].compairedValue / this.mDataArray[i].maxValue;
				let lenCompaired = scaleCompaired * this.mRadius;	//算出这个点的长度
				let angleCompaired: number = this.mLineAngle[i];
				let pointCompaired: egret.Point = new egret.Point();
				pointCompaired.x = Math.cos(angleCompaired) * lenCompaired ;
				pointCompaired.y = Math.sin(angleCompaired) * lenCompaired ;
				this.mPropertyPointArray[EnumCtrRadarShowProType.comparison].push(pointCompaired);
			}
		}
	}

	private drawBgRadarCycle(): void {
		if (this.mShowBgLineType === EnumCtrRadarShowLineType.vectorLine) {
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
		else if (this.mShowBgLineType === EnumCtrRadarShowLineType.imgLine) {
			for (let iCycles = 0 ; iCycles < this.mCycles; ++iCycles) {
				
				let beforePoint: egret.Point = new egret.Point(this.mLinePointArray[iCycles][0].x, this.mLinePointArray[iCycles][0].y);
				for (let iSides = 1 ; iSides <= this.mSides; ++iSides) {
					let afterPoint: egret.Point = null; 
					if (iSides == this.mSides) {
						afterPoint = new egret.Point(this.mLinePointArray[iCycles][0].x, this.mLinePointArray[iCycles][0].y);
					}
					else {
						afterPoint = new egret.Point(this.mLinePointArray[iCycles][iSides].x , this.mLinePointArray[iCycles][iSides].y);
					}
					
					let len: number = Math.sqrt(Math.pow((afterPoint.y - beforePoint.y),2) + Math.pow((afterPoint.x - beforePoint.x),2));
					let imgLine: eui.Image = new eui.Image(this.mImgNameBgLine);
					this.addChild(imgLine);
					imgLine.anchorOffsetY = imgLine.height/2;
					imgLine.x = beforePoint.x ;
					imgLine.y = beforePoint.y ; 
					imgLine.width = len;

					let rotation: number = Math.atan2((beforePoint.y - afterPoint.y) , (beforePoint.x - afterPoint.x) )/(2*Math.PI) * 360;
					imgLine.rotation = rotation + 180; 

					beforePoint = afterPoint;
				}
				
			}
		}
		else {	//no line 
			if (this.mImgBg == "") {
				egret.error("please enter the bgimg or choose other way of drawing line ");
				return ;
			}

			let imgLine: eui.Image = new eui.Image(this.mImgBg);
			this.addChild(imgLine);
			imgLine.x = 0;
			imgLine.y = 0;
			imgLine.anchorOffsetX = imgLine.width/2;
			imgLine.anchorOffsetY = imgLine.height/2;
		}
		
	}

	private drawBgRadarLinkLine(): void {
		if (this.mShowBgLineType === EnumCtrRadarShowLineType.vectorLine) {
			for (let iSides = 0 ; iSides < this.mSides ; ++iSides) {
				let line: egret.Shape = new egret.Shape();
				line.graphics.lineStyle(this.mDrawBgLineInfo.radius , this.mDrawBgLineInfo.color);
				line.graphics.moveTo(this.mSourcePos.x , this.mSourcePos.y);
				line.graphics.lineTo(this.mLinePointArray[this.mCycles-1][iSides].x , this.mLinePointArray[this.mCycles-1][iSides].y);
				line.graphics.endFill();
				this.addChild(line);
			}
		}
		else if (this.mShowBgLineType === EnumCtrRadarShowLineType.imgLine) {
			let beforePoint: egret.Point = new egret.Point(this.mSourcePos.x,this.mSourcePos.y);
			for (let iSides = 0 ; iSides < this.mSides ; ++iSides) {
				let afterPoint: egret.Point = new egret.Point(this.mLinePointArray[this.mCycles-1][iSides].x , this.mLinePointArray[this.mCycles-1][iSides].y);
				let len: number = Math.sqrt(Math.pow((afterPoint.y - beforePoint.y),2) + Math.pow((afterPoint.x - beforePoint.x),2));
				let imgLine: eui.Image = new eui.Image(this.mImgNameBgLine);
				this.addChild(imgLine);
				imgLine.anchorOffsetY = imgLine.height/2;
				imgLine.x = beforePoint.x ;
				imgLine.y = beforePoint.y ; 
				imgLine.width = len;

				let rotation: number = Math.atan2((beforePoint.y - afterPoint.y) , (beforePoint.x - afterPoint.x) )/(2*Math.PI) * 360;
				imgLine.rotation = rotation + 180; 
			}
		}
		else {	//no line 
			
		}
		
	}

	private drawProperty(): void {
		this.drawSelfProperty();
		this.drawCompairedProperty();
		this.drawPropertyName();
	}

	private drawSelfProperty(): void {
		this.drawPropertyPolygon(this.mPropertyPointArray[EnumCtrRadarShowProType.self] , this.mDrawPropertyInfo[EnumCtrRadarShowProType.self]);
		this.drawPropertyPoint(this.mPropertyPointArray[EnumCtrRadarShowProType.self] , this.mDrawPropertyPointInfo[EnumCtrRadarShowProType.self]);
	}

	private drawCompairedProperty(): void {
		if (this.mShowPropertyType == EnumCtrRadarShowProType.comparison) {
			this.drawPropertyPolygon(this.mPropertyPointArray[EnumCtrRadarShowProType.comparison], this.mDrawPropertyInfo[EnumCtrRadarShowProType.comparison]);
			this.drawPropertyPoint(this.mPropertyPointArray[EnumCtrRadarShowProType.comparison] , this.mDrawPropertyPointInfo[EnumCtrRadarShowProType.comparison]);
		}
	}


	private drawPropertyPolygon(propertyPointArray: Array<egret.Point> ,info: CtrRadarChartDrawPropertyInfo ): void {
		let polygon: egret.Shape = new egret.Shape();
		polygon.graphics.lineStyle(info.lineRadius , info.lineColor);
		polygon.graphics.beginFill( info.bgColor, info.bgAlpha);
		polygon.graphics.moveTo(propertyPointArray[0].x , propertyPointArray[0].y);
		for (let iSides = 0 ; iSides < propertyPointArray.length; ++iSides) {
			polygon.graphics.lineTo(propertyPointArray[iSides].x , propertyPointArray[iSides].y);
		}
		polygon.graphics.lineTo(propertyPointArray[0].x , propertyPointArray[0].y);
		polygon.graphics.endFill();
		this.addChild(polygon);
	}

	private drawPropertyPoint(propertyPointArray: Array<egret.Point> , pointInfoArray: CtrRadarChartDrawShapeInfo): void {
		if (this.mShowPropertyPointType == EnumCtrRadarShowProPointType.verctorPoint) {
			for (let iSides = 0 ; iSides < this.mSides; ++iSides) {
				this.createShapPointCricle(propertyPointArray[iSides].x , 
											propertyPointArray[iSides].y , 
											pointInfoArray.radius , 
											pointInfoArray.color, 
											pointInfoArray.alpha);
			}
		}
		else if (this.mShowPropertyPointType == EnumCtrRadarShowProPointType.imgPoint) {
			if (this.mImgNamePropertyPoint == "") {
				egret.error("please set the image name of the property point ");
				return ; 
			}

			for (let iSides = 0 ; iSides < this.mSides; ++iSides) {
				let imgPoint: eui.Image = new eui.Image(this.mImgNamePropertyPoint);
				this.addChild(imgPoint);
				imgPoint.x = propertyPointArray[iSides].x;
				imgPoint.y = propertyPointArray[iSides].y;
				imgPoint.anchorOffsetX = imgPoint.width/2;
				imgPoint.anchorOffsetY = imgPoint.height/2;
			}
		}
		else {		//EnumCtrRadarShowProPointType.noPoint
			
		}
		
	}

	private drawPropertyName(): void {
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

			let value: string = this.getShowValueStr(this.mDataArray[iSides].currentValue , this.mDataArray[iSides].maxValue);
			if (value != "") {
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

	private getShowValueStr(value: number , maxValue: number): string {
		switch (this.mShowValueType) {
			case EnumCtrRadarShowValueType.showNone: {
				return "";
			}

			case EnumCtrRadarShowValueType.showOnlyValue: {
				return value.toString();
			}

			case EnumCtrRadarShowValueType.showPercent: {
				return (value/maxValue * 100).toFixed(this.mValueToFixed) + "%";
			}

			case EnumCtrRadarShowValueType.showAll: {
				return value + "/" + maxValue;
			}

			default:
				break;
		}
		return "";
	}

}