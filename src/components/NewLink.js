const { createElement } = require("../lib/elements");

const NewLink = () => {
  return createElement(
    "a",
    {
      className:
        "nav__link" + (location.hash === "" ? " nav__link-active" : ""),
      href: "#",
    },
    [
      createElement("span", {
        className: "url",
        innerText: "New Website",
      }),
    ]
  );
};

module.exports = NewLink;
