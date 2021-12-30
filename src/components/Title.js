const { createElement } = require("../lib/elements");

const Title = () => {
  return createElement(
    "h1",
    {
      className: "title",
    },
    [
      createElement("img", {
        src: "assets/skeleton.ico",
        className: "title__icon",
      }),
      createElement("h1", { innerText: "Skeleton" }),
    ]
  );
};

module.exports = Title;
