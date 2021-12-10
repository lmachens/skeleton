const { createElement } = require("./elements");

const createModalElement = (children) => {
  const containerElement = createElement(
    "div",
    {
      className: "modal",
    },
    [
      createElement(
        "div",
        {
          className: "inner",
        },
        children
      ),
    ]
  );
  return containerElement;
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

const createFormElement = (website, onSubmit, onClose) => {
  return createElement(
    "form",
    {
      className: "form",
      onclick: (event) => {
        event.stopPropagation();
      },
      onsubmit: (event) => {
        event.preventDefault();
        const {
          name,
          height,
          width,
          url,
          frame,
          transparent,
          alwaysOnTop,
          resizable,
          clickThrough,
          movable,
          x,
          y,
        } = event.target.elements;
        website.name = name.value;
        if (!website.id) {
          website.id = Date.now();
        }
        website.bounds = {
          height: +height.value,
          width: +width.value,
          x: +x.value,
          y: +y.value,
        };
        website.url = url.value;
        website.frame = frame.checked;
        website.transparent = transparent.checked;
        website.alwaysOnTop = alwaysOnTop.checked;
        website.resizable = resizable.checked;
        website.clickThrough = clickThrough.checked;
        website.movable = movable.checked;
        onSubmit(website);
      },
    },
    [
      createLabeledInputElement({
        text: "Name",
        className: "full-row",
        name: "name",
        placeholder: "Give it a name",
        value: website.name ?? "",
        required: true,
      }),
      createLabeledInputElement({
        text: "URL",
        className: "full-row",
        name: "url",
        placeholder: "https://...",
        value: website.url ?? "",
        required: true,
      }),
      createLabeledInputElement({
        type: "number",
        text: "X",
        name: "x",
        value: website.bounds.x ?? 100,
      }),
      createLabeledInputElement({
        type: "number",
        text: "Y",
        name: "y",
        value: website.bounds.y ?? 100,
      }),
      createLabeledInputElement({
        type: "number",
        text: "Width",
        name: "width",
        value: website.bounds.width ?? 800,
      }),
      createLabeledInputElement({
        type: "number",
        text: "Height",
        name: "height",
        value: website.bounds.height ?? 600,
      }),
      createLabeledInputElement({
        type: "checkbox",
        text: "Frame",
        name: "frame",
        checked: website.frame ?? true,
      }),
      createLabeledInputElement({
        type: "checkbox",
        text: "Transparent",
        name: "transparent",
        checked: website.transparent ?? true,
      }),
      createLabeledInputElement({
        type: "checkbox",
        text: "Movable",
        name: "movable",
        checked: website.movable ?? true,
      }),
      createLabeledInputElement({
        type: "checkbox",
        text: "Always on top",
        name: "alwaysOnTop",
        checked: website.alwaysOnTop ?? true,
      }),
      createLabeledInputElement({
        type: "checkbox",
        text: "Resizable",
        name: "resizable",
        checked: website.resizable ?? true,
      }),
      createLabeledInputElement({
        type: "checkbox",
        text: "Click through",
        name: "clickThrough",
        checked: website.clickThrough ?? false,
      }),
      createElement("input", {
        type: "submit",
        value: "Save",
      }),
      createElement("button", {
        type: "button",
        onclick: onClose,
        innerText: "Close",
      }),
    ]
  );
};

const createFormModalElement = (website = { bounds: {} }, onSubmit) => {
  const modalElement = createModalElement([
    createFormElement(website, onSubmit, () => {
      modalElement.remove();
    }),
  ]);
  return modalElement;
};

exports.createFormModalElement = createFormModalElement;
