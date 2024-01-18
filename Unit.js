const path = require("path");
const fs = require("fs");

function getDirectories(dirPath,path) {
  let entries = fs.readdirSync(dirPath, { withFileTypes: true });

  let directoryNames = entries
    .map((entry) => {
      if (entry.isDirectory()) {
        return path+'/'+entry.name;  // 只返回目录名，不包括路径
      }
    })
    .filter(Boolean);  // 过滤掉文件  
  return directoryNames;
}

function getDataPageIndex(data){
    let pages = {}
    data.forEach((val, index) => {
        let temp = val.split("/");
        pages[val] = {
          entry: `src/${val}/main.js`,
          template: "public/index.html",
          filename: `${val}/${temp[temp.length - 1]}.html`,
          title: `${temp[temp.length - 1]}`,
        };
      });
    return pages
}

module.exports.getDirectories = getDirectories;
module.exports.getDataPageIndex = getDataPageIndex;