const { app, BrowserWindow } = require("electron");
const path = require("path");

// const createWindow = () => {
//   const main = new BrowserWindow({
//     width: 800,
//     height: 600,
//     frame: false,
//     movable: true,
//     resizable: true,
//     transparent: true,
//     alwaysOnTop: true,
//     webPreferences: {
//       webgl: true,
//     },
//   });

//   main.loadURL("http://localhost:3000");

//   const win = new BrowserWindow({
//     width: 300,
//     height: 300,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       webgl: true,
//     },
//     frame: false,
//     movable: true,
//     resizable: true,
//     transparent: true,
//     alwaysOnTop: true,
//   });
//   win.loadURL("http://localhost:3000/minimap.html");
//   win.setIgnoreMouseEvents(true, { forward: true });

//   win.on("focus", () => {
//     win.setIgnoreMouseEvents(false);
//   });

//   win.on("blur", () => {
//     win.setIgnoreMouseEvents(true, { forward: true });
//   });
// };

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 640,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webgl: true,
    },
    frame: false,
    movable: true,
    resizable: true,
    transparent: true,
  });
  win.loadFile("index.html");

  win.webContents.setWindowOpenHandler((props) => {
    console.log(props);
    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        width: 300,
        height: 300,
        webPreferences: {
          webgl: true,
        },
        frame: false,
        movable: true,
        resizable: true,
        transparent: true,
        alwaysOnTop: true,
      },
    };
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
