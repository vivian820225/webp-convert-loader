/**
 * Options for image converter.
 * @typedef {Object} converterOptions
 * @property {string} name - The name of the compressed image file. If not passed, the hash will be used by default.
 * @property {string} preset - The type of file, which can be default, photo, picture, drawing, icon, or text.
 * @property {number} quality - The quality of the compressed image.
 * @property {number} alphaQuality - Set the transparency compression quality between 0 and 100.
 * @property {number} method - Specify the compression method to use between 0 (fastest) and 6 (slowest). This parameter controls the trade-off between encoding speed, file size, and quality.
 * @property {number} sns - Set the amplitude of spatial noise shaping between 0 and 100.
 * @property {boolean} autoFilter - Set the strength of block filtering between 0 (off) and 100.
 * @property {number} sharpness - Set the sharpness of the filter between 0 (sharpest) and 7 (least sharp).
 * @property {boolean} lossless - Whether to use lossless encoding for the image.
 */

var imagemin = require("imagemin");
var imageminWebp = require("imagemin-webp");
var imageminJpegtran = require("imagemin-jpegtran");
var imageminPngquant = require("imagemin-pngquant");
var loaderUtils = require("loader-utils");
var mime = require("mime");

module.exports = function (content) {
  this.cacheable && this.cacheable();
  if (!this.emitFile) {
    throw new Error("emitFile is required from module system");
  }
  var callback = this.async();
  var called = false;
  // Get configuration parameters
  var query = loaderUtils.getOptions(this);
  // Generate hash
  var url = loaderUtils.interpolateName(this, query.name || "[hash].[ext]", {
    content: content,
    regExp: query.regExp,
  });

  // Generate webp url
  var webpUrl = url.substring(0, url.lastIndexOf(".")) + ".webp";
  // Set default value
  let limit = 10 * 1024;
  if (query.limit) {
    limit = parseInt(query.limit, 10);
  }
  // Get the file type
  var mimetype = query.mimetype || query.minetype || mime.getType(this.resourcePath);
  // If less than the default 10k or the custom range, output base64 directly
  if (limit <= 0 || content.length < limit) {
    return callback(null, "module.exports = " + JSON.stringify("data:" + (mimetype ? mimetype + ";" : "") + "base64," + content.toString("base64")));
  }

  // Define the parameters for the output webp file
  var options = {
    preset: query.preset || "default",
    quality: query.quality || 80,
    alphaQuality: query.alphaQuality || 100,
    method: query.method || 1,
    sns: query.sns || 80,
    autoFilter: query.autoFilter || false,
    sharpness: query.sharpness || 0,
    lossless: query.lossless || false,
    bypassOnDebug: query.bypassOnDebug || false,
  };

  if (query.size) {
    options.size = query.size; // Set target size (in bytes)
  }

  if (query.filter) {
    options.filter = query.filter;
  }

  // Debugging
  if (this.debug === true && options.bypassOnDebug === true) {
    callback(null, "module.exports = __webpack_public_path__ + " + JSON.stringify(url) + ";");
  } else {
  // image compression
  imagemin
    .buffer(content, {
      plugins: [
        imageminWebp(options),
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    })
    .then((file) => {
      // Output the source file
      this.emitFile(url, content);
      // Output the webp file
      this.emitFile(webpUrl, file);
      // Default to display the original image
      callback(
        null,
        "module.exports = __webpack_public_path__ + " +
          JSON.stringify(url) +
          ";"
      );
    })
    .catch((err) => {
      callback(err);
    });
  }
};

module.exports.raw = true;
