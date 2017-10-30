class TestAnimationLayer extends eui.Component implements  eui.UIComponent {
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
	}

	private init(): void {
		this.btn_close.addEventListener(egret.TouchEvent.TOUCH_END, this.handleTouch, this);

		let arm: dragonBones.Armature = GTDragonBonesManager.GetInstance().createDragoneBonesAramture(DragonbonesEnum.ball,GTDragonBonesConfig.STR_MOVIE_CLIP_NAME );
		this.addChildAt(arm.getDisplay() , 1);  
		arm.display.x = this.x + this.width/2; 
		arm.display.y = this.y + this.height/2; 
		arm.animation.play(GTDragonBonesConfig.STR_EVOLVE_BURN );
		GTDragonBonesManager.GetInstance().AddArmInWorldClock(arm);


		let solderMc: egret.MovieClip = GTMovieClipManager.GetInstance().createAndGetMovieClip(MovieClipEnum.soldier , 30);
		GTMovieClipManager.GetInstance().fixPos(solderMc);
		GTMovieClipManager.GetInstance().playMovieClip(solderMc , -1 , GTMovieClipConfig.STR_CLIP_SOLDIER_FIGHT) ; 
		solderMc.x = this.x + this.width/2 ;
		solderMc.y = this.y + this.height/4 * 3;
		this.addChild(solderMc);
	}

	public handleTouch(event:egret.Event):void
	{ 
		switch(event.target)
		{
			case this.btn_close:
			{
				this.parent.removeChild(this);
				GameMainscene.GetInstatnce().SetTestLayerVisible(true);
				break;
			}
			default:
			break;
		}
	}
	
}