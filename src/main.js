const { app, BrowserWindow, Tray, Menu, globalShortcut } = require("electron");
const path = require("path");
const Store = require("electron-store");
const { updateWebsite, listenWebsites } = require("./lib/storage");
const { getCursorInfo } = require("./lib/winuser");
const store = new Store();
const icon = path.join(__dirname, "assets/skeleton.ico");

const createWindow = () => {
  const bounds = store.get("skeleton-bounds") || {};
  const win = new BrowserWindow({
    title: "Skeleton",
    width: 800,
    height: 700,
    icon: icon,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    frame: false,
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
    if (!app.quitting) {
      event.preventDefault();
      win.hide();
    }
  });

  win.loadFile(path.join(__dirname, "index.html"));

  const activeWindows = {};
  const clickThroughWindows = [];
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
    clickThroughWindows.forEach((singleWindow) => {
      try {
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
      } catch (error) {}
    });
  }, 10);

  const tray = new Tray(icon);
  tray.setToolTip("Skeleton");
  tray.on("click", () => {
    win.show();
  });

  const updateWebsiteWindow = (website) => {
    const websiteWindow = new BrowserWindow({
      icon: icon,
      parent: win,
      frame: website.frame,
      movable: website.movable,
      resizable: website.resizable,
      transparent: website.transparent,
      alwaysOnTop: website.alwaysOnTop,
      autoHideMenuBar: true,
      maximizable: website.frame,
      fullscreenable: website.frame,
      webPreferences: {
        nodeIntegration: false,
        show: false,
      },
      ...website.bounds,
    });
    websiteWindow.loadURL(website.url).catch(() => {
      console.log("FAILED");
      websiteWindow.close();
      updateWebsite(website.id, { active: false });
    });

    websiteWindow.once("ready-to-show", () => {
      websiteWindow.show();
    });

    activeWindows[website.id] = websiteWindow;
    if (website.alwaysOnTop) {
      websiteWindow.setAlwaysOnTop(true, "pop-up-menu");
    }

    if (website.clickThrough) {
      websiteWindow.setIgnoreMouseEvents(true);

      websiteWindow.on("focus", () => {
        websiteWindow.setIgnoreMouseEvents(false);
        fadeOpacity(websiteWindow);
      });

      websiteWindow.on("blur", () => {
        websiteWindow.setIgnoreMouseEvents(true);
        fadeOpacity(websiteWindow);
      });
      clickThroughWindows.push(websiteWindow);
    }

    websiteWindow.on("resize", () => {
      const bounds = websiteWindow.getBounds();
      updateWebsite(website.id, { bounds });
    });

    websiteWindow.on("moved", () => {
      const bounds = websiteWindow.getBounds();
      updateWebsite(website.id, { bounds });
    });

    if (website.toggleHotkey) {
      globalShortcut.register(website.toggleHotkey, () => {
        if (websiteWindow.isVisible()) {
          websiteWindow.hide();
        } else {
          websiteWindow.show();
        }
      });

      websiteWindow.on("close", () => {
        globalShortcut.unregister(website.toggleHotkey);
      });
    }

    websiteWindow.on("close", () => {
      updateWebsite(website.id, { active: false });
    });
  };

  listenWebsites((websites) => {
    websites.forEach((website) => {
      try {
        if (website.active && !activeWindows[website.id]) {
          updateWebsiteWindow(website);
        } else if (!website.active && activeWindows[website.id]) {
          clickThroughWindows.splice(
            clickThroughWindows.indexOf(activeWindows[website.id]),
            1
          );
          activeWindows[website.id].close();
          delete activeWindows[website.id];
        }
      } catch (error) {}
    });

    const template = websites.map((website) => ({
      label: website.name,
      type: "normal",
      click: () => {
        updateWebsite(website.id, { active: true });
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
          app.quit();
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

app.on("before-quit", () => {
  app.quitting = true;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
