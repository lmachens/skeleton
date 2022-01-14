const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  //   alert("CHILD");
  //   const webview = document.querySelector("webview");
  //   console.log(webview);
  //   webview.src = "https://github.com/";

  ipcRenderer.on("update", (_event, website) => {
    const crop = website.crop || {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
    const widthOffset = crop.left + crop.right;
    const heightOffset = crop.top + crop.bottom;

    let webview = document.querySelector("webview");
    if (!webview) {
      document.title = website.name;
      document.body.innerHTML = `<webview src="${website.url}"></webview>`;
      webview = document.querySelector("webview");
      webview.addEventListener("did-stop-loading", () => {
        webview.style = `top: ${-crop.top}px; left: ${-crop.left}px; right: ${-crop.right}px; width: calc(100% + ${widthOffset}px); bottom: ${-website
          .crop
          .bottom}px; top: ${-crop.top}px; height: calc(100% + ${heightOffset}px);`;
      });
    } else {
      webview.style = `top: ${-crop.top}px; left: ${-crop.left}px; right: ${-crop.right}px; width: calc(100% + ${widthOffset}px); bottom: ${-crop.bottom}px; top: ${-crop.top}px; height: calc(100% + ${heightOffset}px);`;
    }
  });

  ipcRenderer.send("whoami");
});
