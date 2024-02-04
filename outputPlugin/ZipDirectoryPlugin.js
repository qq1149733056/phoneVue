const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const zipJson = require("../zip.json");
class ZipDirectoryPlugin {
  constructor(options, outputPath) {
    this.outputPath = outputPath;
    this.options = options;
  }
  zipFile = (zip,resolve, reject, outputPath, path, pathName = false) => {
    // 删除已经存在的压缩文件
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    console.log("outputPath", outputPath);
    console.log("path", path);
    console.log("pathName", pathName);
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on("close", () => {
      // 删除原目录
      console.log(archive.pointer() + " 字节数");
      console.log("压缩完毕.");
      try {
        // 检查目录是否存在
        if (fs.existsSync(path)) {
          fs.rmSync(path, { recursive: true });
        }
        console.log("原目录已删除.",path);
      } catch (err) {
        console.error("删除原目录时出错:", err);
      }
      resolve();
    });

    archive.on("error", function (err) {
      reject(err);
    });
    archive.pipe(output);
    archive.directory(path, `${zip}/${pathName}`);
    archive.finalize();
  };
  apply(compiler) {
    compiler.hooks.done.tap("ZipDirectoryPlugin", (stats,callback) => {
      // 创建一个 Promise 数组，每个元素对应一个压缩任务
      const tasks = this.options.map((option) => {
        return new Promise((resolve, reject) => {
          // 将 filename 和 path 组合成完整的输出路径
          if (zipJson.zip.length !== 0) {
            zipJson.zip.forEach((obj, index) => {
              Object.entries(obj).forEach(([key, value]) => {
                if (option.filename.split(".")[0] === key) {
                  option.filename = value + ".zip"; //配置压缩文件名称
                }
              });
            });
          }
          const outputPath = path.join(option.path, "..", option.filename);
          this.zipFile(
            option.filename.split(".")[0],
            resolve,
            reject,
            outputPath,
            option.path,
            option.pathName
          );
        });
      }); 
      // let common = new Promise((resolve, reject) => {
      //   let pagesPath = path.join(
      //     this.outputPath + "/20241211/mcube-prod.mpaascloud.com/ALIPUB944A43E211215_default",
      //     "..",
      //     "20241211.zip"
      //   );
      //   this.zipFile('20241211',resolve, reject, pagesPath, this.outputPath + "/2021131");//这是一个公共的资源文件包 css和node-modlues
      // });

    });
  }
}
module.exports = ZipDirectoryPlugin;
