var Path = require('path');
var Fs = require('fs');
var Optimist = require('optimist');

var Util = require(__dirname + '/util');

var TASK_MAP = {
	build : true,
	min : true,
	list : true,
	cleanup : true,
	check : true,
	vm : true,
	iconfont : true
};

Optimist.usage([
	'Usage: ecps [COMMAND] --config=[CONFIG_FILE]\n\n',
	'Examples:\n',
	'ecps src/js/g.js\n',
	'ecps src/css/g.less\n',
	'ecps min build/js/g.js\n',
	'ecps cleanup\n'
].join(''));

var ARGV = Optimist.argv;

if (ARGV.help || ARGV.h) {
	Optimist.showHelp();
	process.exit();
}

if (ARGV.version || ARGV.v) {
	var packageInfo = JSON.parse(Util.readFileSync(__dirname + '/package.json', 'utf-8'));
	console.log(packageInfo.version);
	process.exit();
}

var cmd;
var args;

if (ARGV._.length > 0 && TASK_MAP[ARGV._[0]]) {
	cmd = ARGV._[0];
	args = ARGV._.slice(1);
} else {
	cmd = 'build';
	args = ARGV._;
}

var config = null;

var dirPath = args.length > 0 ? args[0] : '.';

if (!Fs.existsSync(dirPath)) {
	dirPath = '.';
}

var dirStat = Fs.statSync(dirPath);

if (!dirStat.isDirectory()) {
	dirPath = Path.dirname(dirPath);
}

dirPath = Path.resolve(dirPath);

var path = Util.undef(ARGV.config, './ecps-config.js');
path = Path.resolve(path);

if (Fs.existsSync(path)) {
	config = require(path);
}else{
	while (true) {
		path = Path.resolve(dirPath + '/ecps-config.js');

		if (Fs.existsSync(path)) {
			config = require(path);
			break;
		}

		var parentPath = Path.dirname(dirPath);

		if (parentPath == dirPath) {
			break;
		}

		dirPath = parentPath;
	}
}


if (config === null) {
	Util.error('File not found: ecps-config.js');
	process.exit();
}

var Task = require(__dirname + '/tasks/' + cmd);

Task.run(args, config);
