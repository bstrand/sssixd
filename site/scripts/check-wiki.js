import fs from "node:fs/promises";
import vm from "node:vm";

const CONFIG_PATH = "site/config.js";
const STATUS_PATH = "site/status.js";

async function readConfig() {
  const source = await fs.readFile(CONFIG_PATH, "utf8");

  const sandbox = {
    window: {}
  };

  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);

  return sandbox.window.SITE_CONFIG;
}

function parseWikipediaUrl(source) {
  const url = new URL(source);

  const match = url.hostname.match(/^([a-z-]+)\.wikipedia\.org$/);

  if (!match) {
    throw new Error(
      `wikiSource must be a Wikipedia URL; received ${source}`
    );
  }

  const language = match[1];


  const title = decodeURIComponent(
    url.pathname.slice("/wiki/".length)
  ).replaceAll("_", " ");

  return {
    language,
    site: `${language} wiki`,
    title
  };
}

async function fetchEntity(site, title) {
  const params = new URLSearchParams({
    action: "wbgetentities",
    sites: site,
    titles: title,
    props: "claims|labels|sitelinks",
    languages: "en",
    format: "json",
    formatversion: "2",
    origin: "*"
  });

  const response = await fetch(
    `https://www.wikidata.org/w/api.php?${params}`,
    {
      headers: {
        "User-Agent":
          "sssixd/1.0 (https://github.com/bstrand/sssixd)"
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `Wiki returned HTTP ${response.status}`
    );
  }

  const data = await response.json();
  const entity = data.entities?.[0];

  if (!entity || entity.missing) {
    throw new Error(
      `No Wiki entity found for ${site}:${title}`
    );
  }

  return entity;
}

function getDateOfDeath(entity) {
  const statements = entity.claims?.P570 ?? [];

  // Ignore deprecated claims.
  const usable = statements.filter(
    statement => statement.rank !== "deprecated"
  );

  const preferred =
    usable.find(statement => statement.rank === "preferred") ??
    usable[0];

  const value =
    preferred?.mainsnak?.datavalue?.value;

  return value?.time ?? null;
}

async function main() {
  const config = await readConfig();

  if (!config?.wikiSource) {
    throw new Error(
      "SITE_CONFIG.wikiSource is required"
    );
  }

  const { site, title } =
    parseWikipediaUrl(config.wikiSource);

  console.log(`Checking ${site}:${title}`);

  const entity =
    await fetchEntity(site, title);

  const dateOfDeath =
    getDateOfDeath(entity);

  const status = {
    answer: dateOfDeath ? "Yes." : "No.",
    checkedAt: new Date().toISOString(),
    wikiId: entity.id,
    dateOfDeath
  };

  const output =
    `window.SITE_STATUS = ${JSON.stringify(
      status,
      null,
      2
    )};\n`;

  await fs.writeFile(
    STATUS_PATH,
    output,
    "utf8"
  );

  console.log(status);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});