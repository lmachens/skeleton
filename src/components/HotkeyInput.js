const LabeledInput = require("./LabeledInput");

const HotkeyInput = ({ value }) => {
  return LabeledInput({
    type: "text",
    text: "Show/Hide Hotkey",
    name: "toggleHotkey",
    placeholder: "Unassigned",
    value: value || "",
    onkeyup(event) {
      event.preventDefault();
      event.stopPropagation();

      const keyCode = event.keyCode;
      const key = event.key.replace("Arrow", "").toUpperCase();
      if ((keyCode >= 16 && keyCode <= 18) || keyCode === 91) return;

      const value = [];
      if (event.ctrlKey) {
        value.push("Ctrl");
      }
      if (event.shiftKey) {
        value.push("Shift");
      }
      if (event.altKey) {
        value.push("Alt");
      }
      value.push(key);

      event.target.value = value.join("+");
    },
  });
};

module.exports = HotkeyInput;
