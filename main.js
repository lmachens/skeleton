const { app, BrowserWindow } = require("electron");
const path = require("path");
const Store = require("electron-store");
const { winuser } = require("easywin");
const { updateWebsite } = require("./lib/storage");

const store = new Store();

const createWindow = () => {
  const bounds = store.get("skeleton-bounds") || {};
  const win = new BrowserWindow({
    width: 800,
    height: 640,
    icon: path.join(__dirname, "skeleton.ico"),
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
    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        frame: website.frame,
        movable: website.movable,
        resizable: website.resizable,
        transparent: website.transparent,
        alwaysOnTop: website.alwaysOnTop,
        autoHideMenuBar: true,
        maximizable: website.frame,
        fullscreenable: website.frame,
        ...website.bounds,
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
        fadeOpacity(childWindow);
      });

      childWindow.on("blur", () => {
        childWindow.setIgnoreMouseEvents(true);
        fadeOpacity(childWindow);
      });
    }

    childWindow.on("resize", () => {
      const bounds = childWindow.getBounds();
      updateWebsite(website.id, { bounds });
    });

    childWindow.on("moved", () => {
      const bounds = childWindow.getBounds();
      updateWebsite(website.id, { bounds });
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
        singleWindow.targetOpacity = 0.05;
        fadeOpacity(singleWindow);
      } else if (!inBounds && singleWindow.inBounds) {
        singleWindow.targetOpacity = 1;
        fadeOpacity(singleWindow);
      }
      singleWindow.inBounds = inBounds;
    });
  }, 10);
};

const fadeOpacity = (singleWindow) => {
  clearTimeout(singleWindow.fadeOpacityTimeout);
  singleWindow.fadeOpacityTimeout = setTimeout(() => {
    const opacity = singleWindow.getOpacity();
    const targetOpacity = singleWindow.isFocused()
      ? 1
      : singleWindow.targetOpacity;
    if (opacity === targetOpacity) {
      return;
    }
    if (opacity > targetOpacity) {
      singleWindow.setOpacity(Math.max(0.05, opacity - 0.1));
    } else {
      singleWindow.setOpacity(Math.min(1, opacity + 0.1));
    }
    fadeOpacity(singleWindow);
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
