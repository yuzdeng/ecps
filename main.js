var Path = require('path');
var Fs = require('fs');
var Optimist = require('optimist');

var Util = require(__dirname + '/util');

Optimist.usage([
	'Usage: ecps --config=[CONFIG_FILE]\n\n',
	'Examples:\n',
	'ecps src/js/g.js\n',
	'ecps src/css/g.less\n'
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

var args = ARGV._;

var arguments = Util.getConfigArgs(args,ARGV.config);

if (arguments.config === null) {
	Util.error('File not found: ecps-config.js');
	process.exit();
}

var build = require(__dirname + '/lib/build');

build(arguments.args, arguments.config);
