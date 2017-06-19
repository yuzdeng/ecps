/**
 * @ignore  =====================================================================================
 * @description gulp plugin to package the Seajs modules.
 *  <pre>
 *      var ecps = require('ecps');
 *      gulp.src('xxx/xx/entries')
 *      .pipe(ecps.gulpAMD(options))
 *      .pipe(gulp.dest('dist')
 *  </pre>
 *  options: {
 *      sourceRoot: String
 *      ignoreDependedIds: [
 *          String | RegExp
 *      ]
 *  }
 * @file    gulp-amd
 * @version 1.0.0
 * @author  Damon Liu(damon.liudong@gmail.com)
 * @date    Created at 3:38 PM 14/06/2017
 * @ignore  =====================================================================================
 */
var Path = require('path');
var through2 = require('through2');
var Util = require('../util');
var fs = require('fs');
var _ = require('lodash');
var UglifyJS = require("uglify-js");
var decomment = require("decomment");

// Replace require.text to string
function replaceTemplate(entryFileContents, sourceRoot) {
    // replace template string  (\b)require\.text\(\s*(['"])(.+?)\2\s*\)    require\.text\(\s*(['"])(.+?)\1\s*\);?\s*
    entryFileContents = entryFileContents.replace(/(\b)require\s*\(\s*(['"])(.+?html+\s*?)\2\s*\)/g, function ($0, $1, $2, $3) {
        var templateFile = $3;
        var s = Util.readFileSync(Path.resolve(sourceRoot, templateFile), 'utf-8');
        s = s.replace(/^\uFEFF/, '');
        s = s.replace(/\\/g, '\\\\');
        s = s.replace(/(\r\n|\r|\n)\s*/g, '\\n');
        s = s.replace(/'/g, "\\'");
        return $1 + "'" + s + "'";
    });
    return entryFileContents;
}


// Remove comments, simple version
function removeComments(str) {
    return str.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
}

// Grep dependencies for AMD module
function grepDepList(entryFilePath, sourceRoot, recursion, ignoreDependedIds) {

    var depMap = {};
    var depList = [];
    var fileCache = {};

    function walk(path, isMain, recursion) {
        var fileStr = fileCache[path];
        if (!fileStr) {
            fileStr = Util.readFileSync(path, 'utf8');
            // fileStr = fixModule(path, fileStr);
            fileStr = decomment(fileStr);
            // console.log(fileStr);
            fileCache[path] = fileStr;
        }
        var regExp;
        if (isMain) {
            regExp = /(?:^|[^\w\.])require\s*\(\s*(?:\[([^\]]*)\]|'([^']*)'|"([^"]*)")/g;
        } else {
            regExp = /(?:^|[^\w\.])define\s*\(\s*['"].*?['"]\s*,\s*(?:\[([^\]]*)\]|'([^']*)'|"([^"]*)")/g;
        }

        var match;

        while ((match = regExp.exec(fileStr))) {
            var depIds = [];

            if (match[1]) {
                if (match[1].indexOf(".html") != -1) { //ignore html file
                    continue;
                }
                var depStr = removeComments(match[1]);
                depIds = depStr.split(',').map(function (val) {
                    val = val.trim();
                    return val.substr(1, val.length - 2);
                });
            } else {
                if ((match[3] && match[3].indexOf(".html") != -1) || (match[2] && match[2].indexOf(".html") != -1)) {
                    continue;
                }

                depIds = [match[3] || match[2]];
            }

            depIds.reverse().forEach(function (dependedModuleId) {
                var dependedModuleFilePath,
                    fullDependedModuleFilePath;
                if (dependedModuleId) {
                    if (/\.js$/.test(dependedModuleId)) {
                        Util.warn('The module Id end with .js, it usually ignore the suffix ".js" --> ' + dependedModuleId);
                        dependedModuleId = dependedModuleId.replace(/\.js$/, '');
                    }
                    for (var i = 0; i < ignoreDependedIds.length; i++) {
                        var check = ignoreDependedIds[i];
                        if (_.isString(check) && check === dependedModuleId) {
                            return;
                        } else if (_.isRegExp(check) && check.test(dependedModuleId)) {
                            Util.warn('ignore dependedModule -> ', dependedModuleId);
                            return;
                        }
                    }
                    dependedModuleFilePath = dependedModuleId + '.js';
                    dependedModuleFilePath = dependedModuleFilePath.replace(/^plugins\//, 'plugin/');
                    fullDependedModuleFilePath = Path.resolve(sourceRoot, dependedModuleFilePath);
                    try {
                        fs.statSync(fullDependedModuleFilePath);
                        if (typeof depMap[dependedModuleId] == 'undefined') {
                            depMap[dependedModuleId] = true;
                            if (recursion) {
                                // lazy module
                                walk(fullDependedModuleFilePath, true, false);
                                // normal module
                                walk(fullDependedModuleFilePath, false, true);
                            }
                            depList.push(dependedModuleId);
                        }
                    } catch (e) {
                        Util.error(path + " ===> " + "Can't find the fullDependedModuleFilePath: " + fullDependedModuleFilePath)
                    }
                }
            });
        }

        return fileStr;
    }

    walk(entryFilePath, true, recursion);
    walk(entryFilePath, false, recursion);

    return depList;
}

// Build JS (AMD)
function buildJsUtil(entryFilePath, sourceRoot, ignoreDependedIds) {
    ignoreDependedIds = ignoreDependedIds || [];

    var dependedModuleIdList = grepDepList(entryFilePath, sourceRoot, true, ignoreDependedIds);
    // Util.info(['Get the dependencies of entry file - ' + entryFilePath,].concat(dependedModuleIdList).join('\n'));

    var entryFileFinalContents = '\n(function($) {\n\n';
    dependedModuleIdList.forEach(function (dependedModuleId) {
        var fullDependedModuleFilePath = Path.resolve(sourceRoot, dependedModuleId + '.js');
        // Util.info('import: ' + dependedModuleId);
        entryFileFinalContents += '/* @source ' + dependedModuleId + '.js */;\n';
        var depContents = Util.readFileSync(fullDependedModuleFilePath, 'utf-8');
        // str = fixModule(filePath, str);
        depContents = replaceTemplate(depContents, sourceRoot);
        entryFileFinalContents += '\n' + depContents + '\n';
    });
    entryFileFinalContents += '/* @source  */;\n';

    var entryFileContents = Util.readFileSync(entryFilePath, 'utf-8');
    entryFileContents = replaceTemplate(entryFileContents, sourceRoot);
    entryFileFinalContents += '\n' + entryFileContents;
    entryFileFinalContents += '\n\n})(window.jQuery);\n';
    return entryFileFinalContents;
}
module.exports = function (options) {

    return through2.obj(function (file, enc, callback) {
        // we don't do streams (yet)
        if (file.isStream()) {
            this.emit('error', new Error('gulp-concat: Streaming not supported'));
            cb();
            return;
        }
        var contents = buildJsUtil(file.path, options.sourceRoot, options.ignoreDependedIds);
        file.contents = new Buffer(contents);
        this.push(file);
        callback();
    });
};
