
exports.root = __dirname;

exports.isCompress = false;

exports.jsSrcPath = '/src/js';

exports.main = {
	"js" : [
		"libs.js",
		"g.js",
		// "lazy/demo.js",
		// "page/demo.js"
		'views/commons/nav/accountOrgNav/accountOrgNavApp.js'
	],
	"css" : [
		// "g.less"
	]
};

exports.libjs = {
	"libs.js" : ["lib/jquery.js", "lib/fix.js", "lib/oz.js", "lib/config.js"]
};
exports.ignoreJs=[
    "g.js"
];
exports.ignoreMobileJs=[];
exports.globaljs = [
	"g.js"
];
