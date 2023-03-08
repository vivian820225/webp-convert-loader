# webp-convert-loader
A webpack loader that can convert small images into base64 format and generate new webp images with the hash of the source file name. It also preserves the source image.
## Features
	1. In development mode, a webp image with the same name will be generated in the cache.
  2. Supports passing the limit parameter, which limits images under 10k to be converted to base64, while images above that size will be generated as webp images with the same name.
## Installation
```
npm install --save-dev webp-convert-loader
```
## Usage
1. webpack / vue-cli2.0 configure as follows:
```
{
  test: /\.(png|jpe?g)(\?.*)?$/,
  use: [{
    loader: "webp-convert-loader",
    options: {
      limit: 8192,
      quality: 90,
      name: 'static/img/[name].[hash:8].[ext]'
    }
  }]
}
```
2. vue-cli3.0 configure as follows:
```
module.exports = {
  chainWebpack: config => {
    const imageRule = config.module.rule('images')
    imageRule.uses.clear()
    config.module.rule('webp')
      .test(/\.(jpe?g|png)$/i)
      .use('webp-convert-loader')
      .loader('webp-convert-loader')
      .options({
        limit: 8192,
        quality: 80,
        name: `static/img/[name].[hash:8].[ext]`
      })
      .end()
  }
}
```
## API
### limit
Type: `string|number`  
Default: `10240`  
Converts images under 10k to base64 by default.  
### quality  
Type: `string|number`  
Default: `80`  
The quality of the webp image generated from png or jpg.  
### name
Type: `string`  
Default: `[hash].[ext]`  
The filename and relative path of the generated webp image.   

## Tips
If cwebp-bin throws an error, check whether there is a vendor folder under cwebp-bin in node_modules. If not, you need to reinstall this dependency package.  

Other parameters can refer to [imagemin-webp](https://github.com/imagemin/imagemin-webp). 
