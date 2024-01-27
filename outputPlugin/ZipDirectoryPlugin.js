const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

class ZipDirectoryPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.done.tapPromise('ZipDirectoryPlugin', stats => {
      // 创建一个 Promise 数组，每个元素对应一个压缩任务
      const tasks = this.options.map(option => {
        return new Promise((resolve, reject) => {
          // 将 filename 和 path 组合成完整的输出路径
          const outputPath = path.join(option.path, '..', option.filename);

          // 删除已经存在的压缩文件
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }

          const output = fs.createWriteStream(outputPath);
          const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
          });

          output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve();
          });

          archive.on('error', function(err) {
            reject(err);
          });

          archive.pipe(output);
          archive.directory(option.path, false);
          archive.finalize();
        });
      });

      // 使用 Promise.all 等待所有压缩任务完成
      return Promise.all(tasks);
    });
  }
}
module.exports = ZipDirectoryPlugin;
