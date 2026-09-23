// Edit this file to reuse the site for another subject.
const SITE_CONFIG = {
  subject: 
    "Chomsky",
  wikiSource:
    "https://en.wikipedia.org/wiki/Noam_Chomsky",

  // Optional display settings:
  locale: "en-US",
  timeZone: "America/Detroit"
};

if (typeof window !== "undefined") window.SITE_CONFIG = SITE_CONFIG;
if (typeof module !== "undefined") module.exports = SITE_CONFIG;
