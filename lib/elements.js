const createElement = (tagName, props, children) => {
  const element = document.createElement(tagName);
  Object.assign(element, props);
  if (children) {
    element.append(...children);
  }
  return element;
};

const createLabeledInputElement = ({ text, className, ...inputProps }) => {
  return createElement(
    "label",
    {
      innerText: text,
      className: className || "",
    },
    [createElement("input", inputProps)]
  );
};

exports.createElement = createElement;
exports.createLabeledInputElement = createLabeledInputElement;
