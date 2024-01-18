const path = require("path");
const fs = require("fs");

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

function getDataPageIndex(data) {
  let pages = {};
  data.forEach((val, index) => {
    let temp = val.split("/");
    let str = temp.join("_");
    pages[val] = {
      entry: `src/${val}/main.js`,
      template: "public/index.html",
      filename: `${temp[0]}/${str}.html`,
      title: `${temp[temp.length - 1]}`,
    };
  });
  return pages;
}

module.exports.getDirectories = getDirectories;
module.exports.getDataPageIndex = getDataPageIndex;