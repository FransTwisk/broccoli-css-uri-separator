var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var Writer = require('broccoli-caching-writer');
var helpers = require('broccoli-kitchen-sink-helpers');
var walkSync = require('walk-sync');
var mapSeries = require('promise-map-series');
var separator = require('postcss-separator');

module.exports = Separator;
Separator.prototype = Object.create(Writer.prototype);
Separator.prototype.constructor = Separator;

function Separator(inputTree, options) {
	if (!(this instanceof Separator)) {
		return new Separator(inputTree, options);
	}
	this.inputTree = inputTree;
	this.options = options || {};
};

Separator.prototype.updateCache = function(srcDir, destDir) {
	var self = this;
	var paths = walkSync(srcDir);

	return mapSeries(paths, function(relativePath) {
		if (/\/$/.test(relativePath)) {
			mkdirp.sync(destDir + '/' + relativePath);
		} else {
			helpers.copyPreserveSync(path.join(srcDir, relativePath), path.join(destDir, relativePath))

			if (/\.css$/.test(relativePath)) {
				var srcPath = path.join(srcDir, relativePath);
				var destPath = path.join(destDir, relativePath);

				var rawcss = fs.readFileSync(srcPath, {encoding: 'utf8'});
				var data = separator.separate(rawcss, {dataFile: true});
				var original = separator.separate(rawcss, {dataFile: false});

				// write files overwriting originals + data (if there is any data)
				var dataDestPath = destPath.replace(/\.css$/, '-data' + '.css');
				fs.writeFileSync(destPath, original.css, { encoding: 'utf8'});
				if(data.css) {
					fs.writeFileSync(dataDestPath, data.css, { encoding: 'utf8'});
				}
			}
		}
	});
}
