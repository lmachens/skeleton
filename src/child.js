const { ipcRenderer } = require("electron");
const { initPlausible, trackPageView } = require("./lib/plausible");
const { webFrame } = require("electron");

initPlausible("skeleton.th.gl", "https://metrics.th.gl");
window.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.on("update", (_event, website) => {
    const crop = website.crop || {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
    const widthOffset = crop.left + crop.right;
    const heightOffset = crop.top + crop.bottom;
    const borderRadius = website.borderRadius ?? 0;
    const zoom = website.zoom ?? 1;
    webFrame.setZoomFactor(zoom);

    const iframe = document.querySelector("#child");
    if (!iframe.src) {
      iframe.src = website.url;
      document.title = website.name;
    }
    iframe.style = `top: ${-crop.top}px; left: ${-crop.left}px; right: ${-crop.right}px; width: calc(100% + ${widthOffset}px); bottom: ${-crop.bottom}px; top: ${-crop.top}px; height: calc(100% + ${heightOffset}px); border-radius: ${borderRadius}%;`;

    trackPageView({
      url: `https://skeleton.th.gl/${encodeURIComponent(
        website.url.replace("https://", "").replace("http://", "")
      )}`,
    });
  });

  ipcRenderer.send("whoami");
});
