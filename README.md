ECPS - Static Package Manager
=================================================

ECPS

## Install

```
npm install ecps -g
```

## Usage

```bash
ecps [COMMAND]
```

### Table of Contents

```
src/		# source code
	js/
	css/
	img/
dist/		# combo/compress files
	js/
	css/
	img/
```

### Build Command

```bash
ecps src/js/g.js
ecps src/js/page/demo.js
ecps src/js
```

### Build SASS

```bash
ecps src/css/test.scss
ecps src/css
```

### Build Image

```bash
ecps src/img/demo.png
ecps src/img
```

### Customize Config
use config arg to customize config file, default config file is ecps-config.js

```bash
ecps src/js/g.js --config=my-config.js
```

### Config Arg

* main：the enter file about JS and CSS
* libjs：global normal file(not the AMD file)
* globaljs：global enter file, if a AMD module already packed in the globaljs,the other sub AMD file won't packed it again unless you add it in ignoreJs
* ignoreJs: ignore the AMD module packed in globaljs, still packed the module in.
* isCompress: weather or not compress the file in dist.
