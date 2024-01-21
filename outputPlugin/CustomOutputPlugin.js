const { call } = require("file-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
class CustomOutputPlugin {
  constructor(pages) {
    this.pages = pages;
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
                if (this.pages[key].pathName.includes(filename.split("/")[1])) {
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
  // apply(compiler) {
  //   compiler.hooks.compilation.tap("CustomCssOutputPlugin", (compilation) => {
  //     compilation.hooks.afterOptimizeChunkAssets.tap(
  //       "CustomCssOutputPlugin",
  //       (chunks) => {
  //         for (let chunk of chunks) {
  //           chunk.files.forEach((filename) => {
  //             if (filename.endsWith(".css")) {
  //               for (let key in this.pages) {
  //                 if (
  //                   this.pages[key].pathName.includes(filename.split("/")[1])
  //                 ) {
  //                   const parts = filename.split(".");
  //                   const contenthash = parts[1]; // 'd112252b'
  //                   let newFilename = `${this.pages[key].pathName}/css/${this.pages[key].cssPath}.${contenthash}.css`;
  //                   if (
  //                     typeof newFilename === "string" &&
  //                     typeof filename === "string" &&
  //                     compilation.assets[filename]
  //                   ) {
  //                     compilation.assets[newFilename] =
  //                     compilation.assets[filename];
  //                     delete compilation.assets[filename];
  //                   }
  //                 }
  //               }
  //             }
  //           });

  //         }
  //       }
  //     );

  //   });
  // }
}

module.exports = CustomOutputPlugin;
