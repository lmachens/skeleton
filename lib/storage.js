const getWebsites = () => {
  try {
    const websitesJSON = localStorage.getItem("websites") || "[]";
    const websites = JSON.parse(websitesJSON);
    if (!Array.isArray(websites)) {
      return [];
    }
    return websites;
  } catch (error) {
    return [];
  }
};

const setWebsites = (websites) => {
  const websitesJSON = JSON.stringify(websites);
  localStorage.setItem("websites", websitesJSON);
};

const addWebsite = (website) => {
  const websites = getWebsites();
  websites.push(website);
  setWebsites(websites);
};

const updateWebsite = (website) => {
  const websites = getWebsites();
  const existingWebsite = websites.find((item) => item.id === website.id);
  if (existingWebsite) {
    Object.assign(existingWebsite, website);
    setWebsites(websites);
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

exports.getWebsites = getWebsites;
exports.setWebsites = setWebsites;
exports.addWebsite = addWebsite;
exports.updateWebsite = updateWebsite;
exports.deleteWebsite = deleteWebsite;
