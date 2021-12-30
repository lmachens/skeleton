const openWebsite = require("../lib/openWebsite");
const { createElement } = require("../lib/elements");

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
        onclick: (event) => {
          event.stopPropagation();
          if (event.target.checked) {
            openWebsite(website);
          }
        },
      }),
    ]
  );

  return websiteElement;
};

module.exports = WebsiteLink;
