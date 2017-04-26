ECPS - Static Package Manager
=================================================

ECPS

## 安装

```
npm install ecps -g
```

## 使用方法

```bash
ecps [COMMAND]
```

### 目录结构

```
src/		# 源代码
	js/
	css/
	img/
build/		# 打包后代码，未压缩
	js/
	css/
dist/		# 压缩后代码
	js/
	css/
	img/
```

### 构建JS

```bash
ecps src/js/g.js
ecps src/js/page/demo.js
ecps src/js
```

### 构建LESS

```bash
ecps src/css/g.less
ecps src/css/page/demo.less
ecps src/css
```

### 构建图片

```bash
ecps src/img/demo.png
ecps src/img
```

### 压缩打包后的代码

```bash
ecps min build/js/g.js
```

### 指定配置
用config参数指定配置，默认用当前目录下的`ecps-config.js`。

```bash
ecps src/js/g.js --config=my-config.js
```

### 整理build、dist目录

删除build、dist里的多余的目录和文件。

```bash
ecps cleanup
```

### 配置说明

* main：JS和CSS入口文件。
* libjs：全局非AMD文件。
* globaljs：全局入口文件。
