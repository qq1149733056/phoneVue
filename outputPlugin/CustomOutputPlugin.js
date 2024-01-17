class CustomOutputPlugin {
    constructor(pages) {
        this.pages = pages;
    }
    apply(compiler) {
        compiler.hooks.emit.tapAsync('CustomOutputPlugin', (compilation, callback) => {
          callback();
        });
      }
  }
  
  module.exports = CustomOutputPlugin;