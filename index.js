var Build = require('./lib/build');
var Util = require(__dirname + '/util');
var gulpAMD = require('./lib/gulp-amd');
module.exports={
    build : function (args,config) {
        var arguments = Util.getConfigArgs(args,config);

        if (arguments.config === null) {
            Util.error('File not found: ecps-config.js');
            return false;
        }
        Build(arguments.args, arguments.config);
    },
    gulpAMD: gulpAMD
};
