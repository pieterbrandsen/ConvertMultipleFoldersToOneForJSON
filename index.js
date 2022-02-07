// Importing libraries
const fs = require("fs");
const _ = require("lodash");
const path = require("path");

// path names
global.readFilePath = "Z:\\BACKUPS\\Privé\\Data\\Google";
global.writeFilePath = "Z:\\BACKUPS\\Privé\\Data\\Google2";

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
 function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
  
  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
  function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
  
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  
    return mergeDeep(target, ...sources);
  }
  
const GetJSONFilesOutOfFolder = (dir) => {
  return fs
    .readdirSync(dir)
    .filter(
      (file) =>
        fs.lstatSync(path.join(dir, file)).isFile() &&
        path.extname(path.join(dir, file)) === ".json"
    );
};

const GetFoldersOutOfFolder = (dir) => {
  return fs
    .readdirSync(dir)
    .filter((file) => !fs.lstatSync(path.join(dir, file)).isFile());
};
function CheckFolder(readFilePath,writeFilePath,setup) {
    if (setup === true && !fs.existsSync(global.writeFilePath)) fs.mkdirSync(global.writeFilePath);

    _.forEach(GetFoldersOutOfFolder(readFilePath), (headFolder) => {
        if (headFolder ==="chrome") {
       console.log(headFolder)     
        }
        const relativeReadHeadPath = path.join(readFilePath, headFolder);
        const relativeWriteHeadPath = !setup ? path.join(writeFilePath, headFolder) : writeFilePath;
        if (!fs.existsSync(relativeWriteHeadPath)){
            fs.mkdirSync(relativeWriteHeadPath);
        }
        const folders = GetFoldersOutOfFolder(relativeReadHeadPath);
    const files = GetJSONFilesOutOfFolder(relativeReadHeadPath);

    if (files.length > 0) {
        _.forEach(files, (file) => {
            const filePath = path.join(relativeWriteHeadPath, file);
            if (!fs.existsSync(filePath)) {
                fs.copyFileSync(
                    path.join(relativeReadHeadPath, file),
                    path.join(relativeWriteHeadPath, file)
                );
            }
            else {
                const readFile = fs.readFileSync(path.join(relativeReadHeadPath, file), { encoding: "utf8", flag: "r" });
                const writeFile = fs.readFileSync(path.join(relativeWriteHeadPath, file), { encoding: "utf8", flag: "r" });
                // const readFileJSON = JSON.parse(readFile);
                // const writeFileJSON = JSON.parse(writeFile);
                // const mergedFile = mergeDeep(writeFileJSON, readFileJSON);
                // fs.writeFileSync(path.join(relativeWriteHeadPath, file), JSON.stringify(mergedFile));
            }

        });
    }

    if (folders.length > 0) {
        _.forEach(folders, (folder) => {
            if (folder === "BrowserHistory") {
                console.log("hi")
            }
            CheckFolder(path.join(relativeReadHeadPath, folder),path.join(relativeWriteHeadPath, folder),true);
        });
    }
    if (fs.existsSync(relativeWriteHeadPath) && fs.readdirSync(relativeWriteHeadPath).length === 0) fs.rmdirSync(relativeWriteHeadPath);
  });
}
      CheckFolder(global.readFilePath,global.writeFilePath,true);
