const { app, BrowserWindow } = require("electron");
const path = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 640,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webgl: true,
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
  });

  win.loadFile("index.html");

  win.webContents.setWindowOpenHandler((props) => {
    const json = props.features.substr("website=".length);
    const website = JSON.parse(decodeURIComponent(json));

    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        width: website.width,
        height: website.height,
        frame: website.frame,
        movable: website.movable,
        resizable: website.resizable,
        transparent: website.transparent,
        alwaysOnTop: website.alwaysOnTop,
        autoHideMenuBar: true,
        maximizable: website.frame,
        fullscreenable: website.frame,
      },
    };
  });

  win.webContents.on("did-create-window", (childWindow, props) => {
    const website = JSON.parse(decodeURIComponent(props.options.website));
    if (website.clickThrough) {
      childWindow.setIgnoreMouseEvents(true, { forward: true });

      childWindow.on("focus", () => {
        childWindow.setIgnoreMouseEvents(false);
      });

      childWindow.on("blur", () => {
        childWindow.setIgnoreMouseEvents(true, { forward: true });
      });
    }
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
