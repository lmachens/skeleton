const { createElement } = require("../lib/elements");

const CloseButton = () => {
  const button = createElement("button", {
    className: "close",
    onclick: () => {
      window.close();
    },
  });
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="close__icon" viewBox="0 0 30 30"><line x1="19.5" y1="10.5" x2="10.5" y2="19.5" fill="none" stroke="currentcolor" stroke-linecap="round"></line><line x1="10.5" y1="10.5" x2="19.5" y2="19.5" fill="none" stroke="currentcolor" stroke-linecap="round"></line></svg>`;
  return button;
};

module.exports = CloseButton;
