/**
 * Created by BlackStar
 * @brief movieClip的播放封装
 */
class GTMovieClipManager {
	public static m_pThis: GTMovieClipManager = null ; 
	public static STR_CLIP_SOLDIER_RATE: number = 30 ; 

	public constructor() {
	}

	public static GetInstance(): GTMovieClipManager {
		if (GTMovieClipManager.m_pThis === null) {
			GTMovieClipManager.m_pThis = new GTMovieClipManager();
		}
		return GTMovieClipManager.m_pThis;
	}

	public createAndGetMovieClip(mcEnum: MovieClipEnum, frameRate: number , eventObj: any = null , frameCallBackFunc: Function = null , completeCallBackFunc: Function = null , loopCompleteCallBack: Function = null ): egret.MovieClip {
		let data = RES.getRes(GTMovieClipConfig.McTextureInfoArray[mcEnum].mc_json);
		let txtr = RES.getRes(GTMovieClipConfig.McTextureInfoArray[mcEnum].mc_texture_png);
		let mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data , txtr);
		let mc1:egret.MovieClip = new egret.MovieClip(mcFactory.generateMovieClipData(GTMovieClipConfig.McTextureInfoArray[mcEnum].mc_name));

		if (!data || !txtr) {
			egret.error("~~~~~  did not to load res complated to create a dragonBones-animation ");
		}
		// mc.frameRate = mc.totalFrames ;
		//test code 
		// mc1.frameRate = 8;
		mc1.frameRate = frameRate;


		if (frameCallBackFunc != null && eventObj) {
			mc1.addEventListener(egret.Event.ENTER_FRAME, frameCallBackFunc , eventObj );
			mc1.addEventListener(egret.Event.REMOVED_FROM_STAGE ,function() {
				mc1.removeEventListener(egret.Event.ENTER_FRAME, frameCallBackFunc , eventObj );
			} ,this);
		}

		if (completeCallBackFunc != null && eventObj) {
			mc1.addEventListener(egret.Event.COMPLETE , completeCallBackFunc , eventObj );
			mc1.addEventListener(egret.Event.REMOVED_FROM_STAGE ,function() {
				mc1.removeEventListener(egret.Event.COMPLETE, completeCallBackFunc , eventObj );
			} ,this);
		}

		if (loopCompleteCallBack != null && eventObj) {
			mc1.addEventListener(egret.Event.LOOP_COMPLETE , loopCompleteCallBack , eventObj );
			mc1.addEventListener(egret.Event.REMOVED_FROM_STAGE ,function() {
				mc1.removeEventListener(egret.Event.LOOP_COMPLETE, loopCompleteCallBack , eventObj );
			} ,this);
		}

		return mc1 ; 
	}


	public replaceMovieClip(movie: egret.MovieClip , dataName: string , txtrName: string , MovieClipName: string , frameRate: number , eventObj: any = null , frameCallBackFunc: Function = null , completeCallBackFunc: Function = null , loopCompleteCallBack: Function = null ) {
		let data = RES.getRes(dataName);
		let txtr = RES.getRes(txtrName);
		let mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data , txtr);
		let movieData: egret.MovieClipData = mcFactory.generateMovieClipData(MovieClipName);
		movie.movieClipData = movieData ; 

		movie.frameRate = frameRate;
		if (frameCallBackFunc != null && eventObj) {
			movie.addEventListener(egret.Event.ENTER_FRAME, frameCallBackFunc , eventObj );
			movie.addEventListener(egret.Event.REMOVED_FROM_STAGE ,function() {
				movie.removeEventListener(egret.Event.ENTER_FRAME, frameCallBackFunc , eventObj );
			} ,this);
		}

		if (completeCallBackFunc != null && eventObj) {
			movie.addEventListener(egret.Event.COMPLETE , completeCallBackFunc , eventObj );
			movie.addEventListener(egret.Event.REMOVED_FROM_STAGE ,function() {
				movie.removeEventListener(egret.Event.COMPLETE, completeCallBackFunc , eventObj );
			} ,this);
		}

		if (loopCompleteCallBack != null && eventObj) {
			movie.addEventListener(egret.Event.LOOP_COMPLETE , loopCompleteCallBack , eventObj );
			movie.addEventListener(egret.Event.REMOVED_FROM_STAGE ,function() {
				movie.removeEventListener(egret.Event.LOOP_COMPLETE, loopCompleteCallBack , eventObj );
			} ,this);
		}
	}

	//因为导出数据图片会切掉透明边缘，位置会偏掉
	public fixPos(mc :egret.MovieClip):void {
		mc.x -= mc.getBounds().x ; 
		mc.y -= mc.getBounds().y ;
	}

	public playMovieClip(mc :egret.MovieClip, playTimes: number = -1 , frame : any  = 0): void {
		mc.gotoAndPlay(frame , playTimes);
	}

	public stopMovieClip(mc :egret.MovieClip , frame: any = 0): void {
		mc.gotoAndStop(frame);
	}

	// public stopMovieClip(mc: egret.MovieClip): void {
	// 	mc.stop();
	// }
}