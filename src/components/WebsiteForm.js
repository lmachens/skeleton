const { createElement } = require("../lib/elements");
const {
  getWebsite,
  deleteWebsite,
  updateWebsite,
  addWebsite,
} = require("../lib/storage");
const HotkeyInput = require("./HotkeyInput");
const LabeledInput = require("./LabeledInput");

const WebsiteForm = () => {
  const websiteId = +location.hash.replace("#", "");
  let website = getWebsite(websiteId);
  let isNew = false;
  if (!website) {
    isNew = true;
    website = { bounds: {} };
  }

  const form = createElement(
    "form",
    {
      className: "form",
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
          toggleHotkey,
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
        website.toggleHotkey = toggleHotkey.value;

        if (isNew) {
          addWebsite(website);
        } else {
          updateWebsite(websiteId, website);
        }
      },
    },
    [
      LabeledInput({
        text: "Name",
        className: "full",
        name: "name",
        placeholder: "Give it a name",
        value: website.name ?? "",
        required: true,
      }),
      LabeledInput({
        text: "URL",
        className: "full",
        name: "url",
        placeholder: "https://...",
        value: website.url ?? "",
        required: true,
      }),
      LabeledInput({
        type: "number",
        text: "X",
        name: "x",
        value: website.bounds.x ?? 100,
      }),
      LabeledInput({
        type: "number",
        text: "Y",
        name: "y",
        value: website.bounds.y ?? 100,
      }),
      LabeledInput({
        type: "number",
        text: "Width",
        name: "width",
        value: website.bounds.width ?? 800,
      }),
      LabeledInput({
        type: "number",
        text: "Height",
        name: "height",
        value: website.bounds.height ?? 600,
      }),
      LabeledInput({
        type: "checkbox",
        text: "Frame",
        name: "frame",
        checked: website.frame ?? true,
      }),
      LabeledInput({
        type: "checkbox",
        text: "Transparent",
        name: "transparent",
        checked: website.transparent ?? true,
      }),
      LabeledInput({
        type: "checkbox",
        text: "Movable",
        name: "movable",
        checked: website.movable ?? true,
      }),
      LabeledInput({
        type: "checkbox",
        text: "Always on top",
        name: "alwaysOnTop",
        checked: website.alwaysOnTop ?? true,
      }),
      LabeledInput({
        type: "checkbox",
        text: "Resizable",
        name: "resizable",
        checked: website.resizable ?? true,
      }),
      LabeledInput({
        type: "checkbox",
        text: "Click through",
        name: "clickThrough",
        checked: website.clickThrough ?? false,
      }),
      HotkeyInput({ value: website.toggleHotkey }),
      createElement("input", {
        className: "full",
        type: "submit",
        value: "Save",
      }),
      createElement("button", {
        innerText: "Delete",
        className: "full danger",
        disabled: isNew,
        title: "Delete website",
        onclick: () => {
          location.href = "#";
          deleteWebsite(website);
        },
      }),
    ]
  );

  return form;
};

module.exports = WebsiteForm;
