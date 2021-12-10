const { createElement } = require("./elements");
const { createFormModalElement } = require("./formModalElement");
const { deleteWebsite, updateWebsite } = require("./storage");

const openWebsite = (website) => {
  window.open(
    website.url,
    "_blank",
    `website=${encodeURIComponent(JSON.stringify(website))}`
  );
};

const createWebsiteElement = (website) => {
  const websiteElement = createElement(
    "article",
    {
      className: "website",
    },
    [
      createElement("span", {
        className: "url",
        innerText: website.name,
      }),
      createElement("button", {
        innerText: "🚀",
        title: "Open website",
        onclick: () => {
          openWebsite(website);
        },
      }),
      createElement("button", {
        innerText: "📝",
        title: "Edit website",
        onclick: () => {
          const formElement = createFormModalElement(website, (website) => {
            updateWebsite(website.id, website);
            formElement.remove();
          });
          document.body.append(formElement);
        },
      }),
      createElement("button", {
        innerText: "🚮",
        title: "Delete website",
        onclick: () => {
          deleteWebsite(website);
          websiteElement.remove();
        },
      }),
    ]
  );

  return websiteElement;
};

exports.openWebsite = openWebsite;
exports.createWebsiteElement = createWebsiteElement;
