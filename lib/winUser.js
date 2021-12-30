// Credits to https://github.com/wwog/easyWin
const api = require("./winUser.node");

const getCursorInfo = () => {
  return api.GetCursorInfo();
};

exports.getCursorInfo = getCursorInfo;
