const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  document.body.style.transition = "opacity 0.2s ease-in";
  ipcRenderer.on("mouseenter", () => {
    document.body.style.opacity = 0.1;
  });
  ipcRenderer.on("mouseleave", () => {
    document.body.style.opacity = 1;
  });
});
