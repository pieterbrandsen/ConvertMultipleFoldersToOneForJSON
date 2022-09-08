// Importing libraries
const fs = require("fs");
const _ = require("lodash");
const path = require("path");

// path names
global.readFilePath = "Z:\\BACKUPS\\Privé\\Data\\Google";
global.writeFilePath = global.readFilePath+"_merged";

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}
function isArray(item) {
  return item && Array.isArray(item);
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
      } else if (isArray(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: [] });
        target[key] = target[key].concat(source[key]);
        target[key] = _.uniqBy(target[key], (item) => JSON.stringify(item));
      } else {
        if (!target[key]) Object.assign(target, { [key]: source[key] });
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
function CheckFolder(readFilePath, writeFilePath) {
  if (!fs.existsSync(writeFilePath)) fs.mkdirSync(writeFilePath);

  const relativeReadHeadPath = readFilePath;
  const relativeWriteHeadPath = writeFilePath;
  const folders = GetFoldersOutOfFolder(relativeReadHeadPath);
  const files = GetJSONFilesOutOfFolder(relativeReadHeadPath);

  if (files.length > 0) {
    _.forEach(files, (file) => {
      const writeFilePath = path.join(relativeWriteHeadPath, file);
      if (!fs.existsSync(writeFilePath)) {
        fs.copyFileSync(
          path.join(relativeReadHeadPath, file),
          path.join(relativeWriteHeadPath, file)
        );
      } else {
        try {
          const readFile = fs.readFileSync(
            path.join(relativeReadHeadPath, file),
            { encoding: "utf8", flag: "r" }
          );
          const writeFile = fs.readFileSync(writeFilePath, {
            encoding: "utf8",
            flag: "r",
          });
          const readFileJSON = JSON.parse(readFile);
          const writeFileJSON = JSON.parse(writeFile);
          const mergedJSON = mergeDeep(writeFileJSON, readFileJSON);
          fs.writeFileSync(writeFilePath, JSON.stringify(mergedJSON));
        } catch (error) {}
      }
    });
  }

  if (folders.length > 0) {
    _.forEach(folders, (folder) => {
      CheckFolder(
        path.join(relativeReadHeadPath, folder),
        path.join(relativeWriteHeadPath, folder),
        true
      );
    });
  }
  if (
    fs.existsSync(relativeWriteHeadPath) &&
    fs.readdirSync(relativeWriteHeadPath).length === 0
  )
    fs.rmdirSync(relativeWriteHeadPath);
}

if (fs.existsSync(global.writeFilePath))
  fs.rmdirSync(global.writeFilePath, { recursive: true });
fs.mkdirSync(global.writeFilePath);

_.forEach(GetFoldersOutOfFolder(global.readFilePath), (folder) => {
  CheckFolder(path.join(global.readFilePath, folder), global.writeFilePath);
});
