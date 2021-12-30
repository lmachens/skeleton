const { ipcRenderer } = require("electron");
const App = require("./components/App");
const openWebsite = require("./lib/openWebsite");

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#app").append(App());

  ipcRenderer.on("open", function (_, website) {
    openWebsite(website);
  });
});
