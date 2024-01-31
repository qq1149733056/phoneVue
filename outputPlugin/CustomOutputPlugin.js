class CustomOutputPlugin {
  constructor(pages) {
    this.pages = pages;
  }
  modifyJsPath(jsPath) {
    // 在这里修改 jsPath
    return '/prefix/' + jsPath;
  }
  apply(compiler) {
    compiler.hooks.compilation.tap("CustomOutputPlugin", (compilation) => {
      compilation.hooks.additionalAssets.tapAsync(
        "CustomOutputPlugin",
        (callback) => {
          // 在这里，你可以添加你的自定义逻辑

          for (const filename in compilation.assets) {
            if (filename.endsWith(".css")) {
             
              for (let key in this.pages) {
                if (filename.includes(this.pages[key].pathName)) {
                  const parts = filename.split(".");
                  const contenthash = parts[1]; // 'd112252b'
                  let newFilename = `${this.pages[key].pathName}/css/${this.pages[key].cssPath}.${contenthash}.css`;
                  if (
                    typeof newFilename === "string" &&
                    typeof filename === "string" &&
                    compilation.assets[filename]
                  ) {
                    compilation.assets[newFilename] =
                      compilation.assets[filename];
                    const HtmlWebpackPlugin = require("html-webpack-plugin");
                    const hooks = HtmlWebpackPlugin.getHooks(compilation);
                    // hooks.beforeAssetTagGeneration.tapAsync(
                    //   'CustomOutputPlugin', // <-- 插件名称
                    //   (data, cb) => {
                    //     // 修改 data.assets.js 中的路径
                    //     data.assets.js = data.assets.js.map(jsPath => {
                    //       // 替换 '../pages/js/' 为 '../js/'
                    //       return jsPath.replace('../pages/js/', '../js/');
                    //     });
                    //     console.log('data.assets.js',data.assets.js)
                    //     // 继续处理
                    //     cb(null, data);
                    //   }
                    // );
                    hooks.alterAssetTags.tapAsync(
                      "CustomOutputPlugin",
                      (data, callback) => {
                        for (let tag of data.assetTags.styles) {
                        // 检查 href 是否与我们的旧文件名匹配
                        let dataHref = tag.attributes.href.split("/");
                        let cssStr = dataHref[dataHref.length-1].split(".")[1];
                        let filenameHref = newFilename.split("/");
                        let fileStr = filenameHref[filenameHref.length-1].split(".")[1];
                          if (cssStr === fileStr) {
                            // 如果匹配，我们就修改 href 为新的文件名
                            tag.attributes.href = '../'+newFilename;
                          }
                        }
                        callback(null, data);
                      }
                    );
                    delete compilation.assets[filename];
                  }
                }
              }
            }
          }
          callback();
        }
      );
    });
  }

}

module.exports = CustomOutputPlugin;
