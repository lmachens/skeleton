const { createFormModalElement } = require("./lib/formModalElement");
const { getWebsites, addWebsite } = require("./lib/storage");
const { createWebsiteElement } = require("./lib/websiteElement");
const { remote } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const websitesElement = document.querySelector(".websites");
  const addElement = document.querySelector(".add");

  const websites = getWebsites();
  const websiteElements = websites.map(createWebsiteElement);
  websitesElement.append(...websiteElements);

  addElement.onclick = () => {
    const formElement = createFormModalElement({}, (website) => {
      addWebsite(website);
      const websiteElement = createWebsiteElement(website);
      websitesElement.append(websiteElement);
      formElement.remove();
    });
    document.body.append(formElement);
  };
});
