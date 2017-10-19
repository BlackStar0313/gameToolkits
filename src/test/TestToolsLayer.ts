enum enumToolsKit{
	CtrNetStatus = 1,
	CtrRadarChart , 
}

class TestToolsLayer extends eui.Component implements  eui.UIComponent {
public scroller_tools:eui.Scroller;
public list_tools:eui.List;


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
		let array: Array<number > = [] ; 
		array.push(enumToolsKit.CtrNetStatus);
		array.push(enumToolsKit.CtrRadarChart);

		let collection: eui.ArrayCollection = new eui.ArrayCollection();
		collection.source = array ; 
		this.list_tools.itemRenderer = TestToolsLayerCell;
		this.list_tools.dataProvider = collection;
		this.scroller_tools.viewport = this.list_tools ; 
	}
	
}