# 通过gulp 来调用导出数据的python脚本并拷贝到配置的目录下

### 描述
- 真牛逼
- config.json配置文件，需要配置源目录和目标目录路径

### 使用方式

初始化添加依赖
```
 npm install 
```

创建config.json 配置路径

```
	{
	    "sourcePath": "/Users/liuzhiwei/work/h5game/letsfarm_scripts/config",
	    "targetPath": "./dest",
	    "gitSourcePath": "/Users/liuzhiwei/work/h5game/letsfarm_config/config",
	    "gitTargetPath": "./destGit"
	}
```

使用
从google doc down数据下来拷贝到目标目录
```
   gulp	copyDoc
```
从git仓库 pull 下数据来拷贝到目标目录
```
	gulp copyGit
```


