const { app, BrowserWindow, screen } = require("electron");
const path = require("path");
const Store = require("electron-store");

const store = new Store();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 640,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
  });

  win.loadFile("index.html");

  win.webContents.setWindowOpenHandler((props) => {
    const json = props.features.substr("website=".length);
    const website = JSON.parse(decodeURIComponent(json));
    const bounds = store.get(`${website.id}-bounds`) || {};
    console.log(bounds);
    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        width: bounds.width || website.width,
        height: bounds.height || website.height,
        frame: website.frame,
        movable: website.movable,
        resizable: website.resizable,
        transparent: website.transparent,
        alwaysOnTop: website.alwaysOnTop,
        autoHideMenuBar: true,
        maximizable: website.frame,
        fullscreenable: website.frame,
        webPreferences: {
          preload: path.join(__dirname, "childPreload.js"),
        },
        x: bounds.x,
        y: bounds.y,
      },
    };
  });

  const windowOptions = {};
  win.webContents.on("did-create-window", (childWindow, props) => {
    const website = JSON.parse(decodeURIComponent(props.options.website));
    if (website.clickThrough) {
      childWindow.setIgnoreMouseEvents(true);

      childWindow.on("focus", () => {
        childWindow.setIgnoreMouseEvents(false);
      });

      childWindow.on("blur", () => {
        childWindow.setIgnoreMouseEvents(true);
      });
    }

    childWindow.on("resize", () => {
      const bounds = childWindow.getBounds();
      store.set(`${website.id}-bounds`, bounds);
    });

    childWindow.on("moved", () => {
      const bounds = childWindow.getBounds();
      store.set(`${website.id}-bounds`, bounds);
    });

    windowOptions[childWindow.id] = website;
  });

  let prevMousePos = screen.getCursorScreenPoint();
  setInterval(() => {
    const mousePos = screen.getCursorScreenPoint();
    if (mousePos.x === prevMousePos.x && mousePos.y === prevMousePos.y) {
      return;
    }
    prevMousePos = mousePos;
    const allWindows = BrowserWindow.getAllWindows();
    const clickThroughWindows = allWindows.filter(
      (singleWindow) => windowOptions[singleWindow.id]?.clickThrough
    );
    clickThroughWindows.forEach((singleWindow) => {
      const bounds = singleWindow.getBounds();
      const xInBounds =
        mousePos.x <= bounds.x + bounds.width && mousePos.x >= bounds.x;
      const yInBounds =
        mousePos.y <= bounds.y + bounds.height && mousePos.y >= bounds.y;
      const inBounds = xInBounds && yInBounds;
      if (inBounds && !singleWindow.inBounds) {
        singleWindow.webContents.send("mouseenter");
      } else if (!inBounds && singleWindow.inBounds) {
        singleWindow.webContents.send("mouseleave");
      }
      singleWindow.inBounds = inBounds;
    });
  }, 10);
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
