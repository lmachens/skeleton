const { default: Plausible } = require("plausible-tracker");

let plausible = null;
const initPlausible = (domain, apiHost) => {
  plausible = Plausible({
    domain,
    apiHost,
    trackLocalhost: true,
  });
};

const trackEvent = (eventName, options, eventData) => {
  if (plausible) {
    plausible.trackEvent(eventName, options, eventData);
  }
};

const trackPageView = (eventData, options) => {
  if (plausible) {
    plausible.trackPageview(eventData, options);
  }
};

const trackOutboundLinkClick = (url) => {
  trackEvent("Outbound Link: Click", { props: { url: url } });
};

exports.initPlausible = initPlausible;
exports.trackEvent = trackEvent;
exports.trackPageView = trackPageView;
exports.trackOutboundLinkClick = trackOutboundLinkClick;
