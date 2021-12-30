const openWebsite = (website) => {
  window.open(
    website.url,
    "_blank",
    `website=${encodeURIComponent(JSON.stringify(website))}`
  );
};

module.exports = openWebsite;
