const { createFormModalElement } = require("./lib/formModalElement");
const { listenWebsites, addWebsite } = require("./lib/storage");
const { createWebsiteElement } = require("./lib/websiteElement");

window.addEventListener("DOMContentLoaded", () => {
  const websitesElement = document.querySelector(".websites");
  const addElement = document.querySelector(".add");

  listenWebsites((websites) => {
    websitesElement.innerHTML = "";
    console.log(websites);
    const websiteElements = websites.map(createWebsiteElement);
    websitesElement.append(...websiteElements);
  });

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
