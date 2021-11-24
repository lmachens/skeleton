const createWebsiteCardElement = (url) => {
  const articleElement = document.createElement("article");
  articleElement.className = "card";
  articleElement.innerText = url;
  return articleElement;
};

const openWebsite = (url) => {
  window.open(url, "_blank", "width=300,height=300");
};

window.addEventListener("DOMContentLoaded", () => {
  const formElement = document.querySelector(".insert");
  const websitesElement = document.querySelector(".websites");

  formElement.onsubmit = (event) => {
    event.preventDefault();
    openWebsite(event.target.elements.url.value);
    createWebsiteCardElement();
  };
});
