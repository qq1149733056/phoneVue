const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const zipJson = require('../zip.json');
class ZipDirectoryPlugin {
  constructor(options,outputPath) {
    this.outputPath = outputPath;
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.done.tapPromise('ZipDirectoryPlugin', stats => {
      // 创建一个 Promise 数组，每个元素对应一个压缩任务
      const tasks = this.options.map(option => {
        return new Promise((resolve, reject) => {
          // 将 filename 和 path 组合成完整的输出路径
          if(zipJson.zip.length !== 0){
            zipJson.zip.forEach((obj, index) => {
              Object.entries(obj).forEach(([key, value]) => {
                if(option.filename.split('.')[0] === key){
                  option.filename = value+'.zip';     //配置压缩文件名称
                }
              });
            });
          }
          const outputPath = path.join(option.path, '..', option.filename);
          console.log('outputPath',outputPath)
          // 删除已经存在的压缩文件
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }

          const output = fs.createWriteStream(outputPath);
          const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
          });

          output.on('close', function() {
            console.log(archive.pointer() + ' 字节数');
            console.log('压缩完毕.');
            resolve();
          });

          archive.on('error', function(err) {
            reject(err);
          });

          archive.pipe(output);
          archive.directory(option.path,'pages');
          archive.finalize();
        });
      });
      let common = new Promise((resolve, reject)=>{
        let pagesPath =  path.join(this.outputPath+'/2021131', '..', '2021131.zip');
        // 删除已经存在的压缩文件
        if (fs.existsSync(pagesPath)) {
          fs.unlinkSync(pagesPath);
        }
        const output = fs.createWriteStream(pagesPath);
          const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
          });

          output.on('close', function() {
            console.log(archive.pointer() + ' 字节数');
            console.log('压缩完毕.');
            resolve();
          });

          archive.on('error', function(err) {
            reject(err);
          });

          archive.pipe(output);
          archive.directory(this.outputPath+'/2021131', false);
          archive.finalize();
      })
      // 使用 Promise.all 等待所有压缩任务完成
      //tasks.push(common)
      return Promise.all(tasks);
    });
  }
}
module.exports = ZipDirectoryPlugin;
