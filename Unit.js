const path = require("path");
const fs = require("fs");
//命名目录
function getDirectories(dirPath, pathName) {
    let entries = fs.readdirSync(dirPath, { withFileTypes: true });

    let directoryNames = entries
      .filter(entry => entry.isDirectory())
      .reduce((names, dir) => {
        let subDirPath = path.join(dirPath, dir.name);  
        if (fs.readdirSync(subDirPath).some(entry => fs.lstatSync(path.join(subDirPath, entry)).isFile())) {
          names.push(`${pathName}/${dir.name}`);
        }
        names.push(...getDirectories(subDirPath, `${pathName}/${dir.name}`));  
        return names;
      }, []);

  return directoryNames;
}
//启动页面
function getDataPageIndex(data,outputPath) {
  let pages = {};
  data.forEach((val, index) => {
    let temp = val.split("/");
    let str = temp.join("_");
    let pagesPath = path.resolve(__dirname, outputPath);
    pages[val] = {
      outputPath:`${pagesPath}/${temp[0]}`,
      entry: `src/${val}/main.js`,
      template: "public/index.html",
      filename: `${temp[0]}/${str}.html`,
      title: `${temp[temp.length - 1]}`,
      pathName:temp[0],
      cssPath:`${str}`,
    };
  });
  return pages;
}

module.exports.getDirectories = getDirectories;
module.exports.getDataPageIndex = getDataPageIndex;
