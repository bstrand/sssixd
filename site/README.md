# Configurable “Is X Dead?” site

The page is static. A scheduled GitHub Action checks the configured Wikipedia article, resolves it to Wikidata, looks for Wikidata property `P570` (date of death), and regenerates `status.js`.

## Configure the subject

Edit `config.js`:

```js
const SITE_CONFIG = {
  subject: "Sarte",
  wikiSource: "https://en.wikipedia.org/wiki/Jean-Paul_Sartre",
  locale: "en-US",
  timeZone: "America/New_York"
};
```

`wikiSource` is intentionally a human-readable Wikipedia URL. The checker resolves that article to its corresponding Wikidata item automatically.

## Automated check

`.github/workflows/check-death-status.yml` runs once per day and can also be started manually from the GitHub Actions tab.

The checker writes `status.js`:

```js
window.SITE_STATUS = {
  answer: "Yes",
  checkedAt: "...",
  wikidataId: "Q9364",
  dateOfDeath: "1980-04-15T00:00:00Z"
};
```

The decision rule is deliberately simple:

- Wikidata has a `P570` date-of-death claim → `Yes`
- no `P570` claim → `No`

If the API/check fails, the workflow fails and leaves the previously published status intact.

## Run locally

Requires Node 22+:

```bash
node scripts/check-wikidata.js
```

Then open `index.html` in a browser.
