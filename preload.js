const { ipcRenderer } = require("electron");
const { createFormModalElement } = require("./lib/formModalElement");
const { listenWebsites, addWebsite } = require("./lib/storage");
const { createWebsiteElement, openWebsite } = require("./lib/websiteElement");

window.addEventListener("DOMContentLoaded", () => {
  const websitesElement = document.querySelector(".websites");
  const addElement = document.querySelector(".add");

  listenWebsites((websites) => {
    websitesElement.innerHTML = "";
    const websiteElements = websites.map(createWebsiteElement);
    websitesElement.append(...websiteElements);
  });

  addElement.onclick = () => {
    const formElement = createFormModalElement({ bounds: {} }, (website) => {
      addWebsite(website);
      formElement.remove();
    });
    document.body.append(formElement);
  };

  ipcRenderer.on("open", function (_, website) {
    openWebsite(website);
  });
});
