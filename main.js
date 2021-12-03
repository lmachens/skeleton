const { app, BrowserWindow, screen } = require("electron");
const path = require("path");
const Store = require("electron-store");
const { winuser } = require("easywin");

const store = new Store();

const createWindow = () => {
  const bounds = store.get("skeleton-bounds") || {};
  const win = new BrowserWindow({
    width: 800,
    height: 640,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    x: bounds.x,
    y: bounds.y,
  });

  win.on("resize", () => {
    const bounds = win.getBounds();
    store.set("skeleton-bounds", bounds);
  });

  win.on("moved", () => {
    const bounds = win.getBounds();
    store.set("skeleton-bounds", bounds);
  });

  win.loadFile("index.html");

  win.webContents.setWindowOpenHandler((props) => {
    const json = props.features.substr("website=".length);
    const website = JSON.parse(decodeURIComponent(json));
    const bounds = store.get(`${website.id}-bounds`) || {};
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
    if (website.alwaysOnTop) {
      childWindow.setAlwaysOnTop(true, "pop-up-menu");
    }

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

  let prevCursorInfo = winuser.GetCursorInfo();
  setInterval(() => {
    const cursorInfo = winuser.GetCursorInfo();
    if (
      cursorInfo.ptScreenPos.x === prevCursorInfo.ptScreenPos.x &&
      cursorInfo.ptScreenPos.y === prevCursorInfo.ptScreenPos.y
    ) {
      return;
    }

    prevCursorInfo = cursorInfo;
    const allWindows = BrowserWindow.getAllWindows();
    const clickThroughWindows = allWindows.filter(
      (singleWindow) => windowOptions[singleWindow.id]?.clickThrough
    );
    clickThroughWindows.forEach((singleWindow) => {
      const bounds = singleWindow.getBounds();
      const xInBounds =
        cursorInfo.ptScreenPos.x <= bounds.x + bounds.width &&
        cursorInfo.ptScreenPos.x >= bounds.x;
      const yInBounds =
        cursorInfo.ptScreenPos.y <= bounds.y + bounds.height &&
        cursorInfo.ptScreenPos.y >= bounds.y;
      const inBounds = xInBounds && yInBounds && cursorInfo.hCursor !== 0;
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
