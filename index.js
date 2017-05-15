const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Writer = require('broccoli-caching-writer');
const helpers = require('broccoli-kitchen-sink-helpers');
const walkSync = require('walk-sync'); // maybe remove
const mapSeries = require('promise-map-series'); // remove in future
const separator = require('postcss-separator');

Separator.prototype = Object.create(Writer.prototype);
Separator.prototype.constructor = Separator;
Separator.prototype.build = function(srcDir, destDir) {
	// var self = this;
  console.log('build is called');
	const paths = walkSync(srcDir);

	return mapSeries(paths, (relativePath) => {
		if (/\/$/.test(relativePath)) {
			mkdirp.sync(`${destDir}/${relativePath}`);
		} else {
			helpers.copyPreserveSync(path.join(srcDir, relativePath), path.join(destDir, relativePath))

			if (/\.css$/.test(relativePath)) {
				const srcPath = path.join(srcDir, relativePath);
				const destPath = path.join(destDir, relativePath);

				const rawcss = fs.readFileSync(srcPath, { encoding: 'utf8' });
				const data = new separator.separate(rawcss, { dataFile: true });
				const original = new separator.separate(rawcss, { dataFile: false });

				if (data.css) { // write files overwriting originals + data (if there is any data)
					fs.writeFileSync(destPath, original.css, { encoding: 'utf8' });
					const dataDestPath = destPath.replace(/\.css$/, '-data.css');
					fs.writeFileSync(dataDestPath, data.css, { encoding: 'utf8' });
				}
			}
		}
	});
}

function Separator(inputTree, options={}) {
	console.log(inputTree);
	return Writer.call(this, inputTree, options);
	// if (!(this instanceof Separator)) {
	// 	return new Separator(inputTree, options);
	// }
	//
	// this.inputTree = inputTree;
	// this.options = options || {};
};

module.exports = Separator;
