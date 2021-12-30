const { createElement } = require("../lib/elements");
const { updateWebsite } = require("../lib/storage");

const WebsiteLink = (website) => {
  const hash = `#${website.id}`;
  const isActive = location.hash === hash;
  const websiteElement = createElement(
    "a",
    {
      className: "nav__link" + (isActive ? " nav__link-active" : ""),
      href: hash,
    },
    [
      createElement("span", {
        className: "url",
        innerText: website.name,
      }),
      createElement("input", {
        type: "checkbox",
        innerText: "🚀",
        title: "Open website",
        checked: website.active,
        onclick: (event) => {
          event.stopPropagation();
          updateWebsite(website.id, { active: event.target.checked });
        },
      }),
    ]
  );

  return websiteElement;
};

module.exports = WebsiteLink;
