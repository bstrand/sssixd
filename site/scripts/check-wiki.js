const fs = require("fs");
const vm = require("vm");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "..", "config.js");
const STATUS_PATH = path.join(__dirname, "..", "status.js");

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found: ${CONFIG_PATH}`);
  }

  const source = fs.readFileSync(CONFIG_PATH, "utf8");

  const sandbox = {
    window: {}
  };

  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);

  const config = sandbox.window.SITE_CONFIG;

  if (!config) {
    throw new Error(
      "site/config.js did not define window.SITE_CONFIG"
    );
  }

  if (!config.wikiSource) {
    throw new Error(
      "SITE_CONFIG.wikiSource is required"
    );
  }

  return config;
}

function parseWikipediaUrl(source) {
  let url;

  try {
    url = new URL(source);
  } catch {
    throw new Error(
      `Invalid wikiSource URL: ${source}`
    );
  }

  const hostnameMatch =
    url.hostname.match(/^([a-z0-9-]+)\.wikipedia\.org$/i);

  if (!hostnameMatch) {
    throw new Error(
      `wikiSource must be a Wikipedia URL, got: ${source}`
    );
  }

  if (!url.pathname.startsWith("/wiki/")) {
    throw new Error(
      `wikiSource must point to a Wikipedia article, got: ${source}`
    );
  }

  const language = hostnameMatch[1];

  const rawTitle =
    url.pathname.substring("/wiki/".length);

  if (!rawTitle) {
    throw new Error(
      `Could not determine Wikipedia article title from: ${source}`
    );
  }

  let title;

  try {
    title = decodeURIComponent(rawTitle)
      .replace(/_/g, " ");
  } catch {
    throw new Error(
      `Could not decode Wikipedia article title: ${rawTitle}`
    );
  }

  return {
    language,
    site: `${language}wiki`,
    title
  };
}

function buildWikidataUrl(site, title) {
  const url =
    new URL("https://www.wikidata.org/w/api.php");

  url.search = new URLSearchParams({
    action: "wbgetentities",
    sites: site,
    titles: title,
    props: "claims|labels|sitelinks",
    languages: "en",
    format: "json",
    formatversion: "2"
  }).toString();

  return url;
}

async function fetchWikidataEntity(site, title) {
  const url = buildWikidataUrl(site, title);

  console.log("Wikidata request:");
  console.log(url.toString());

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "sssixd/1.0 (https://github.com/bstrand/sssixd)",
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Wikidata request failed: HTTP ${response.status}\n${body}`
    );
  }

  const data = await response.json();

  if (!data.entities) {
    throw new Error(
      `Unexpected Wikidata response: ${JSON.stringify(data)}`
    );
  }

  /*
   * formatversion=2 normally returns entities as an object
   * keyed by Q-id, so don't assume data.entities[0].
   */
  const entities = Object.values(data.entities);

  if (entities.length === 0) {
    throw new Error(
      `No Wikidata entity found for ${site}:${title}`
    );
  }

  const entity = entities[0];

  if (entity.missing !== undefined) {
    throw new Error(
      `Wikidata entity is missing for ${site}:${title}`
    );
  }

  return entity;
}

function getDateOfDeath(entity) {
  /*
   * P570 = date of death
   */
  const claims = entity.claims?.P570 ?? [];

  if (claims.length === 0) {
    return null;
  }

  /*
   * Ignore deprecated claims.
   */
  const usableClaims =
    claims.filter(
      claim => claim.rank !== "deprecated"
    );

  if (usableClaims.length === 0) {
    return null;
  }

  /*
   * Prefer a preferred-rank statement if present.
   */
  const claim =
    usableClaims.find(
      claim => claim.rank === "preferred"
    ) ?? usableClaims[0];

  const value =
    claim?.mainsnak?.datavalue?.value;

  if (!value || typeof value.time !== "string") {
    return null;
  }

  return value.time;
}

function normalizeWikidataDate(rawDate) {
  if (!rawDate) {
    return null;
  }

  /*
   * Wikidata dates often look like:
   *
   * +1980-04-15T00:00:00Z
   *
   * Strip the leading + for cleaner output.
   */
  return rawDate.startsWith("+")
    ? rawDate.substring(1)
    : rawDate;
}

function writeStatus(status) {
  const output =
    `window.SITE_STATUS = ${JSON.stringify(
      status,
      null,
      2
    )};\n`;

  fs.writeFileSync(
    STATUS_PATH,
    output,
    "utf8"
  );

  console.log("");
  console.log(`Wrote ${STATUS_PATH}`);
}

async function main() {
  console.log("Loading site configuration...");

  const config = loadConfig();

  console.log(`Subject: ${config.subject}`);
  console.log(`Source: ${config.wikiSource}`);

  const parsed =
    parseWikipediaUrl(config.wikiSource);

  console.log(`Wikipedia site: ${parsed.site}`);
  console.log(`Wikipedia title: ${parsed.title}`);

  const entity =
    await fetchWikidataEntity(
      parsed.site,
      parsed.title
    );

  console.log("");
  console.log(`Wikidata entity: ${entity.id}`);

  const rawDateOfDeath =
    getDateOfDeath(entity);

  const dateOfDeath =
    normalizeWikidataDate(rawDateOfDeath);

  const status = {
    answer: dateOfDeath ? "Yes" : "No",
    checkedAt: new Date().toISOString(),
    wikidataId: entity.id,
    dateOfDeath
  };

  console.log("");
  console.log("Result:");
  console.log(JSON.stringify(status, null, 2));

  writeStatus(status);
}

main().catch(error => {
  console.error("");
  console.error("Check failed:");
  console.error(error);
  process.exit(1);
});
