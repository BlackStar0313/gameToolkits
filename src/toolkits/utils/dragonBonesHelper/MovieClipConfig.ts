enum MovieClipEnum {
	soldier = 0 , 
}

type MovieClipTextureData = {
	mc_json : string , 
	mc_texture_png: string ,
	mc_name: string 
}


/**
 * Created by BlackStar
 * @brief 根据不同项目配置不同的动画信息
 */
class MovieClipConfig {
	public constructor() {
	}

	//填写对应配置文件信息，由DragonbonesEnum直接取信息值
	public static McTextureInfoArray: Array<MovieClipTextureData> = [
		{ mc_json: "db_soldier_walker_mc_json" , mc_texture_png: "db_soldier_walker_tex_png" , mc_name: "db_soldier_walker" } 
	]


	//这里自定义一些动画frame的名字，在play的时候传入frame的name
	public static STR_CLIP_SOLDIER_MOVE: string = "move" ; 
	public static STR_CLIP_SOLDIER_FIGHT: string = "fight" ; 
	public static STR_CLIP_SOLDIER_DIE: string = "dead" ; 

}