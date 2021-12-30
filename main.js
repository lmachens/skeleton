const { app, BrowserWindow, Tray, Menu, globalShortcut } = require("electron");
const path = require("path");
const Store = require("electron-store");
const { updateWebsite, listenWebsites } = require("./lib/storage");
const { getCursorInfo } = require("./lib/winuser");
const store = new Store();
const icon = path.join(__dirname, "skeleton.ico");

const createWindow = () => {
  const bounds = store.get("skeleton-bounds") || {};
  const win = new BrowserWindow({
    width: 800,
    height: 640,
    icon: icon,
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

  win.on("close", (event) => {
    event.preventDefault();
    win.hide();
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

    if (website.toggleHotkey) {
      globalShortcut.register(website.toggleHotkey, () => {
        if (childWindow.isVisible()) {
          childWindow.hide();
        } else {
          childWindow.show();
        }
      });

      childWindow.on("close", () => {
        globalShortcut.unregister(website.toggleHotkey);
      });
    }
  });

  let prevCursorInfo = getCursorInfo();
  setInterval(() => {
    const cursorInfo = getCursorInfo();
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

  const tray = new Tray(icon);
  tray.setToolTip("Skeleton");
  tray.on("click", () => {
    win.show();
  });
  listenWebsites((websites) => {
    const template = websites.map((website) => ({
      label: website.name,
      type: "normal",
      click: () => {
        win.webContents.send("open", website);
      },
    }));
    const alwaysVisible = [
      {
        type: "separator",
      },
      {
        label: "Exit",
        type: "normal",
        click: () => {
          app.exit();
        },
      },
    ];
    const contextMenu = Menu.buildFromTemplate([...template, ...alwaysVisible]);
    tray.setContextMenu(contextMenu);
  });
};

const fadeOpacity = (singleWindow) => {
  clearTimeout(singleWindow.fadeOpacityTimeout);
  singleWindow.fadeOpacityTimeout = setTimeout(() => {
    try {
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
    } catch (error) {
      // Error is thrown if singleWindow doesn't exist anymore. No action required.
    }
  }, 10);
};
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.exit();
});
