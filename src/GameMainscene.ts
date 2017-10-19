class GameMainscene extends egret.DisplayObjectContainer{
	public static _inst: GameMainscene = null ; 

	private mTestLayer: TestToolsLayer = null ; 
	public constructor() {
		super();
		this.once(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
	}

	public static GetInstatnce(): GameMainscene {
		if (GameMainscene._inst == null) {
			GameMainscene._inst = new GameMainscene() ; 
		}
		return GameMainscene._inst; 
	}

	public onAddToStage(): void {
		this.initialize();
	}
	
	private initialize(): void {
		this.mTestLayer = new TestToolsLayer();
		this.addChild(this.mTestLayer);
	}

	public GetTestMainLayer(): TestToolsLayer {
		return this.mTestLayer;
	}

	public SetTestLayerVisible(isVisible: boolean): void {
		if (isVisible ) {
			this.addChild(this.mTestLayer);
		}
		else {
			this.removeChild(this.mTestLayer);
		}
	}	
}