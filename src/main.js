const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  ipcMain,
} = require("electron");
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
      sandbox: false,
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
          singleWindow.targetOpacity = 0;
          fadeOpacity(singleWindow);
        } else if (!inBounds && singleWindow.inBounds) {
          singleWindow.targetOpacity = singleWindow.maxOpacity;
          fadeOpacity(singleWindow);
        }
        singleWindow.inBounds = inBounds;
      } catch (error) {}
    });
  }, 10);

  ipcMain.on("updated-website", (_event, website) => {
    const activeWindow = activeWindows[website.id];
    if (activeWindow && !activeWindow.isDestroyed() && website.active) {
      activeWindow.webContents.send("update", website);
    }
  });

  const tray = new Tray(icon);
  tray.setToolTip("Skeleton");
  tray.on("click", () => {
    win.show();
  });

  const destroyWebsiteWindow = (websiteId) => {
    if (!activeWindows[websiteId]) {
      return;
    }

    if (activeWindows[websiteId].handleHotkey) {
      globalShortcut.unregister(
        activeWindows[websiteId].toggleHotkey,
        activeWindows[websiteId].handleHotkey
      );
    }
    activeWindows[websiteId].destroy();
    delete activeWindows[websiteId];
  };

  const updateWebsiteWindow = (website) => {
    try {
      if (
        activeWindows[website.id] &&
        (website.frame !== activeWindows[website.id].frame ||
          website.transparent !== activeWindows[website.id].transparent)
      ) {
        destroyWebsiteWindow(website.id);
      }

      const websiteWindow =
        activeWindows[website.id] ||
        new BrowserWindow({
          icon: icon,
          frame: website.frame,
          transparent: website.transparent,
          autoHideMenuBar: true,
          webPreferences: {
            webviewTag: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "child.js"),
            sandbox: false,
            webSecurity: false,
          },
        });

      websiteWindow.webContents.setWindowOpenHandler((details) => {
        return {
          action: "allow",
          overrideBrowserWindowOptions: {
            webPreferences: {
              sandbox: false,
              webSecurity: false,
            },
          },
        };
      });

      websiteWindow.frame = website.frame;
      websiteWindow.transparent = website.transparent;
      websiteWindow.maxOpacity = website.opacity ?? 1;
      websiteWindow.setOpacity(websiteWindow.maxOpacity);
      websiteWindow.setMovable(website.movable);
      websiteWindow.setResizable(website.resizable);
      websiteWindow.setAlwaysOnTop(website.alwaysOnTop);
      const oldBounds = websiteWindow.getBounds();
      if (
        oldBounds.x !== website.bounds.x ||
        oldBounds.y !== website.bounds.y ||
        oldBounds.width !== website.bounds.width ||
        oldBounds.height !== website.bounds.height
      ) {
        websiteWindow.setBounds(website.bounds);
      }
      websiteWindow.setMaximizable(website.frame);
      websiteWindow.setFullScreenable(website.frame);
      if (website.alwaysOnTop) {
        websiteWindow.setAlwaysOnTop(true, "pop-up-menu");
      }

      if (activeWindows[website.id]) {
        if (websiteWindow.handleFocus) {
          websiteWindow.off("focus", websiteWindow.handleFocus);
        }
        if (websiteWindow.handleBlur) {
          websiteWindow.off("blur", websiteWindow.handleBlur);
        }

        if (websiteWindow.handleClose) {
          websiteWindow.off("close", websiteWindow.handleClose);
        }
        if (websiteWindow.handleHotkey) {
          globalShortcut.unregister(
            websiteWindow.toggleHotkey,
            websiteWindow.handleHotkey
          );
        }
      } else {
        websiteWindow.webContents.session.webRequest.onHeadersReceived(
          (details, callback) => {
            delete details.responseHeaders["X-Frame-Options"];
            delete details.responseHeaders["x-frame-options"];
            delete details.responseHeaders["Content-Security-Policy"];
            details.responseHeaders["content-security-policy"] =
              "default-src 'self' 'unsafe-inline' * data: blob:";

            const setCookieHeaders =
              details.responseHeaders["Set-Cookie"] ||
              details.responseHeaders["set-cookie"];
            if (setCookieHeaders) {
              for (let index in setCookieHeaders) {
                if (!setCookieHeaders[index].includes("Secure")) {
                  setCookieHeaders[index] += "; Secure";
                }
                setCookieHeaders[index] += "; SameSite=none";
              }
            }
            callback({
              cancel: false,
              responseHeaders: details.responseHeaders,
              statusLine: details.statusLine,
            });
          }
        );
        websiteWindow.loadFile(path.join(__dirname, "child.html"));
        websiteWindow.on("resize", () => {
          const bounds = websiteWindow.getBounds();
          updateWebsite(website.id, { bounds });
        });

        websiteWindow.on("moved", () => {
          const bounds = websiteWindow.getBounds();
          updateWebsite(website.id, { bounds });
        });

        ipcMain.once("whoami", () => {
          websiteWindow.webContents.send("update", website);
        });

        activeWindows[website.id] = websiteWindow;
      }

      if (website.clickThrough) {
        websiteWindow.setIgnoreMouseEvents(true);

        websiteWindow.handleFocus = () => {
          websiteWindow.setIgnoreMouseEvents(false);
          fadeOpacity(websiteWindow);
        };
        websiteWindow.on("focus", websiteWindow.handleFocus);

        websiteWindow.handleBlur = () => {
          websiteWindow.setIgnoreMouseEvents(true);
          fadeOpacity(websiteWindow);
        };
        websiteWindow.on("blur", websiteWindow.handleBlur);
        clickThroughWindows.push(websiteWindow);
      } else {
        websiteWindow.setIgnoreMouseEvents(false);
        if (clickThroughWindows.indexOf(activeWindows[website.id] !== -1)) {
          clickThroughWindows.splice(
            clickThroughWindows.indexOf(activeWindows[website.id]),
            1
          );
        }
      }

      if (website.toggleHotkey) {
        websiteWindow.toggleHotkey = website.toggleHotkey;
        websiteWindow.handleHotkey = () => {
          if (websiteWindow.isVisible()) {
            websiteWindow.hide();
          } else {
            websiteWindow.show();
          }
        };
        globalShortcut.register(
          website.toggleHotkey,
          websiteWindow.handleHotkey
        );
      }

      websiteWindow.handleClose = () => {
        updateWebsite(website.id, { active: false });
        if (website.toggleHotkey) {
          globalShortcut.unregister(website.toggleHotkey);
        }
      };
      websiteWindow.on("close", websiteWindow.handleClose);
    } catch (error) {
      console.error(error);
    }
  };

  listenWebsites((websites) => {
    websites.forEach((website) => {
      try {
        if (website.active) {
          updateWebsiteWindow(website);
        } else if (!website.active && activeWindows[website.id]) {
          clickThroughWindows.splice(
            clickThroughWindows.indexOf(activeWindows[website.id]),
            1
          );
          destroyWebsiteWindow(website.id);
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
  return win;
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
        singleWindow.setOpacity(
          Math.min(singleWindow.maxOpacity, opacity + 0.1)
        );
      }
      fadeOpacity(singleWindow);
    } catch (error) {
      // Error is thrown if singleWindow doesn't exist anymore. No action required.
    }
  }, 10);
};

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  let myWindow;
  app.on("second-instance", () => {
    // Someone tried to run a second instance, we should focus our window.
    if (myWindow) {
      if (!myWindow.isVisible()) {
        myWindow.show();
      }
      myWindow.focus();
    }
  });

  // Create myWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    myWindow = createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        myWindow = createWindow();
      }
    });
  });
}

app.on("before-quit", () => {
  app.quitting = true;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
