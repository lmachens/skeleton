const { createElement } = require("../lib/elements");
const { listenWebsites } = require("../lib/storage");
const WebsiteLink = require("./WebsiteLink");

const WebsiteNav = () => {
  const nav = createElement("nav");

  listenWebsites((websites) => {
    const websitesToAdd = [...websites];
    for (let child of nav.children) {
      const websiteIndex = websitesToAdd.findIndex(
        (website) => child.hash === `#${website.id}`
      );
      if (websiteIndex !== -1) {
        child.lastChild.checked = websitesToAdd[websiteIndex].active;
        websitesToAdd.splice(websiteIndex, 1);
      } else {
        nav.removeChild(child);
      }
    }
    const websiteElements = websitesToAdd.map(WebsiteLink);
    nav.append(...websiteElements);
  });

  return nav;
};

module.exports = WebsiteNav;
