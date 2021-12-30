const { createElement } = require("../lib/elements");

const LabeledInput = ({ text, className, ...inputProps }) => {
  return createElement(
    "label",
    {
      innerText: text,
      className: "form__label" + (className ? ` ${className}` : ""),
    },
    [createElement("input", { ...inputProps, className: "form__input" })]
  );
};

module.exports = LabeledInput;
