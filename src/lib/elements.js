const createElement = (tagName, props, children) => {
  const element = document.createElement(tagName);
  Object.assign(element, props);
  if (children) {
    element.append(...children);
  }
  return element;
};

exports.createElement = createElement;
