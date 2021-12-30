const { createElement } = require("../lib/elements");
const { listenWebsites } = require("../lib/storage");
const WebsiteLink = require("./WebsiteLink");

const WebsiteNav = () => {
  const nav = createElement("nav");

  listenWebsites((websites) => {
    nav.innerHTML = "";
    const websiteElements = websites.map(WebsiteLink);
    nav.append(...websiteElements);
  });

  return nav;
};

module.exports = WebsiteNav;
