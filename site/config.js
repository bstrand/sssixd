// Edit this file to reuse the site for another subject.
const SITE_CONFIG = {
  subject: 
    "Sartre",
  wikiSource:
    "https://en.wikipedia.org/wiki/Jean-Paul_Sartre",
  deadImage: 
    "images/dead.jpg",
  locale: 
    "en-US",
  timeZone: 
    "America/Detroit"
};

if (typeof window !== "undefined") window.SITE_CONFIG = SITE_CONFIG;
if (typeof module !== "undefined") module.exports = SITE_CONFIG;
