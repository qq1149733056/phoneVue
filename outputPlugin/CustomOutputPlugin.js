const mpaascloudCofig = require("../mpassConfig.json").mpaascloudCofig;
class CustomOutputPlugin {
  constructor(pages) {
    this.pages = pages;
  }
  modifyJsPath(jsPath) {
    // 在这里修改 jsPath
    return "/prefix/" + jsPath;
  }
  apply(compiler) {
    compiler.hooks.compilation.tap("CustomOutputPlugin", (compilation) => {
      compilation.hooks.additionalAssets.tapAsync(
        "CustomOutputPlugin",
        (callback) => {
          // 在这里，你可以添加你的自定义逻辑
          const HtmlWebpackPlugin = require("html-webpack-plugin");
          const hooks = HtmlWebpackPlugin.getHooks(compilation);
          for (const filename in compilation.assets) {
            if (filename.endsWith(".css")) {
              console.log("filename", filename);

              for (let key in this.pages) {
                if (filename.includes(this.pages[key].pathName)) {
                  const parts = filename.split("/");
                  const contenthash = parts[parts.length - 1]; // 'd112252b'
                  let newFilename = `${this.pages[key].pathName}/css/${contenthash}`;

                  if (
                    typeof newFilename === "string" &&
                    typeof filename === "string" &&
                    compilation.assets[filename]
                  ) {
                    compilation.assets[newFilename] =
                      compilation.assets[filename];
                    delete compilation.assets[filename];
                  }
                }
              }
            }
          }
          hooks.beforeAssetTagGeneration.tapAsync(
            "CustomOutputPlugin", // <-- 插件名称
            (data, cb) => {
              // 修改 data.assets.js 中的路径
              data.assets.js = data.assets.js.map((jsPath) => {
                // 替换 '../pages/js/' 为 '../js/'
                if (
                  jsPath !== undefined &&
                  jsPath.includes(mpaascloudCofig.appid)
                ) {
                  console.log("jsPath", jsPath);
                  return jsPath.replace(
                    `../../${mpaascloudCofig.appid}/`,
                    "https://"
                  );
                } else {
                  return jsPath.replace("../../", "../");
                }
              });
              cb(null, data);
            }
          );
          hooks.alterAssetTags.tapAsync(
            "CustomOutputPlugin",
            (data, callback) => {
              for (let tag of data.assetTags.styles) {
                //console.log("this.pages", tag);
                Object.entries(this.pages).forEach(([key, value]) => {
                  if (tag.attributes.href.includes(this.pages[key].pathName)) {
                    let dataHref = tag.attributes.href.split("/");
                    let cssStr = dataHref[dataHref.length - 1];
                    //console.log("cssStr", cssStr);
                    let newFilename = `${this.pages[key].pathName}/css/${cssStr}`;
                    tag.attributes.href = "../" + newFilename;
                  }
                  if (tag.attributes.href.includes("chunk-vendors")) {
                    tag.attributes.href = tag.attributes.href.replace(
                      `../../${mpaascloudCofig.appid}/`,
                      "https://"
                    );
                  }
                });
              }
              callback(null, data);
            }
          );
          callback();
        }
      );
    });
  }
}

module.exports = CustomOutputPlugin;
