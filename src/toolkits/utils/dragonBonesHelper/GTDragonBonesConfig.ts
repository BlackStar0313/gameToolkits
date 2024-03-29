enum DragonbonesEnum {
	btn = 0 , 
	ball ,
	worker
}

type DragonbonesTextureData = {
	db_json : string , 
	db_texture_json: string , 
	db_texture_png: string 
}

/**
 * Created by BlackStar
 * @brief 根据不同项目配置不同的动画信息
 */
class GTDragonBonesConfig {
	public constructor() {
	}

	//填写对应配置文件信息，由DragonbonesEnum直接取信息值
	public static DbTextureInfoArray: Array<DragonbonesTextureData> = [
		{ db_json: "db_btn_ske_json" , db_texture_json: "db_btn_tex_json" , db_texture_png: "db_btn_tex_png"} ,
		{ db_json: "db_evolve_burn_ske_json" , db_texture_json: "db_evolve_burn_tex_json" , db_texture_png: "db_evolve_burn_tex_png"} ,
		{ db_json: "worker_ske_json" , db_texture_json: "worker_tex_json" , db_texture_png: "worker_tex_png"}  
	]

	//具体动画名字部分
    public static STR_ARM_BTN1_JUMP: string = "btn1_jump";
	public static STR_ARM_BTN1_STOP: string = "btn1_stop";
	public static STR_ARM_BTN2_JUMP: string = "btn2_jump";
	public static STR_ARM_BTN2_STOP: string = "btn2_stop";

	public static STR_EVOLVE_BURN:string = "burn";

	public static STR_WORKER_EXPLO: string = "exploit_01";


	//动画分租的名字
	public static STR_ARMATURE_DEFAULT_NAME: string = "Armature" ; 
	public static STR_GROUP_RES_NAME: string = "animation";
	public static STR_MOVIE_CLIP_NAME:string = "MovieClip";


}