# Configurable “Is X Dead?” site

This version keeps the visual design fixed and moves the editable content into `config.js`.

## Change the site

Edit:

```js
window.SITE_CONFIG = {
  subject: "Sarte",
  answer: "No",
  lastChecked: "2025-05-11T11:42:00-04:00",
  locale: "en-US",
  timeZone: "America/New_York"
};
```

Examples:

```js
subject: "Disco",
answer: "No"
```

or:

```js
subject: "Google Reader",
answer: "Yes"
```

`lastChecked` should be an ISO-8601 date/time string.

No build step is required. Open `index.html` directly or deploy the folder to any static host.
