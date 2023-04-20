const { app, BrowserWindow, BrowserView } = require("electron");

const createAdsWindow = (win) => {
  const adURL = "https://skeleton.th.gl/app.html";
  const cmpURL = "https://skeleton.th.gl/app-cmp.html";
  const referrer = "https://skeleton.th.gl/";

  const view = new BrowserView({
    webPreferences: {
      partition: "persist:adpartition",
    },
  });
  win.setBrowserView(view);
  // view.webContents.openDevTools({ mode: "detach" });

  let bounds = win.getBounds();
  view.setBounds({
    x: bounds.width - 310,
    y: bounds.height - 600,
    width: 1280,
    height: 600,
  });
  win.on("resize", function () {
    bounds = win.getBounds();
    view.setBounds({
      x: bounds.width - 310,
      y: bounds.height - 600,
      width: 1280,
      height: 600,
    });
  });

  const re = new RegExp(`(${app.getName()}|Electron)/[\\d\\.]+ `, "g");
  view.webContents.setUserAgent(
    view.webContents.getUserAgent().replace(re, "")
  );

  view.webContents.session.cookies.get({ name: "ncmp" }).then((cookies) => {
    if (cookies.length === 0) {
      const modal = new BrowserWindow({
        width: 1000,
        height: 500,
        parent: win,
        modal: true,
        titleBarStyle: "hidden",
        closable: false,
        webPreferences: {
          partition: "persist:adpartition",
        },
      });
      modal.on("closed", () => {
        view.webContents.loadURL(adURL, {
          httpReferrer: referrer,
        });
      });
      modal.loadURL(cmpURL);
    } else {
      view.webContents.loadURL(adURL, {
        httpReferrer: referrer,
      });
    }
  });
};

exports.createAdsWindow = createAdsWindow;
