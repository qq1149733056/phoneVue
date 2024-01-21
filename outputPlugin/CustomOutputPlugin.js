const MiniCssExtractPlugin = require('mini-css-extract-plugin');
class CustomOutputPlugin {
    constructor(pages) {
        this.pages = pages;
    }
    apply(compiler) {
      compiler.hooks.compilation.tap('CustomCssOutputPlugin', (compilation) => {
        compilation.hooks.afterOptimizeChunkAssets.tap('CustomCssOutputPlugin', (chunks) => {
          for (let chunk of chunks) {
              chunk.files.forEach((filename) => {
                if (filename.endsWith('.css')) {
                  for (let key in this.pages) {
                    if(this.pages[key].pathName.includes(filename.split('/')[1])){
                      const parts = filename.split('.');
                      const contenthash = parts[1]; // 'd112252b'
                      let newFilename = `${this.pages[key].pathName}/css/${this.pages[key].cssPath}.${contenthash}.css`;
                      if (typeof newFilename === 'string' && typeof filename === 'string' && compilation.assets[filename]) {
                        compilation.assets[newFilename] = compilation.assets[filename];
                        delete compilation.assets[filename];
                      }
                    }
                  }
                
                } 
              }); 
          }
        });
      });
    }
  }
  
  module.exports = CustomOutputPlugin;