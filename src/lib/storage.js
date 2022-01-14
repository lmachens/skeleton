const { ipcRenderer } = require("electron");
const Store = require("electron-store");

const store = new Store({ watch: true });

const listenWebsites = (callback) => {
  const websites = getWebsites();
  callback(websites);
  store.onDidChange("websites", callback);
};

const getWebsites = () => {
  try {
    const websites = store.get("websites") || [];
    if (!Array.isArray(websites)) {
      return [];
    }
    return websites;
  } catch (error) {
    return [];
  }
};

const getWebsite = (id) => {
  const websites = getWebsites();
  return websites.find((item) => item.id === id);
};

const setWebsites = (websites) => {
  store.set("websites", websites);
};

const addWebsite = (website) => {
  const websites = getWebsites();
  websites.push(website);
  setWebsites(websites);
};

const updateWebsite = (id, partialWebsite) => {
  const websites = getWebsites();
  const existingWebsite = websites.find((item) => item.id === id);
  if (existingWebsite) {
    Object.assign(existingWebsite, partialWebsite);
    setWebsites(websites);
    ipcRenderer?.send("updated-website", existingWebsite);
  }
};

const deleteWebsite = (website) => {
  const websites = getWebsites();
  const index = websites.findIndex((item) => item.id === website.id);
  if (index !== -1) {
    websites.splice(index);
    setWebsites(websites);
  }
};

exports.listenWebsites = listenWebsites;
exports.getWebsites = getWebsites;
exports.getWebsite = getWebsite;
exports.setWebsites = setWebsites;
exports.addWebsite = addWebsite;
exports.updateWebsite = updateWebsite;
exports.deleteWebsite = deleteWebsite;
