import MarkdownIt from "markdown-it";
import { Options } from "./types.js";
import buildDocs from "./docs-builder.js";
import FlexSearch from "flexsearch";

const md = new MarkdownIt();
let MAX_PREVIEW_CHARS = 62; // Number of characters to show for a given search result

const buildIndexSearch = (docs: any[], options: Options) => {
  const searchIndex = new FlexSearch.Index(options);
  docs.forEach((doc: any) => {
    searchIndex.add(doc.id, doc.a + " " + doc.b);
  });
  return searchIndex;
};

function buildPreviews(docs: any[]) {
  const result: any = {};
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    let preview = md.render(doc["b"]).replace(/(<([^>]+)>)/gi, "");
    if (preview == "") preview = doc["b"];

    if (preview.length > MAX_PREVIEW_CHARS)
      preview = preview.slice(0, MAX_PREVIEW_CHARS) + " ...";

    result[doc["id"]] = {
      t: doc["t"] || doc["a"],
      p: preview,
      l: doc["link"],
      a: doc["a"],
    };
  }
  return result;
}

export async function IndexSearch(
  HTML_FOLDER: string,
  options: Options
): Promise<string> {
  console.log(`  🏡 ${HTML_FOLDER}`);
  console.log("  🔎 Indexing...");
  if (options.previewLength) MAX_PREVIEW_CHARS = options.previewLength;
  const docs = await buildDocs(HTML_FOLDER, options);
  const previews = buildPreviews(docs);
  const flexIdx = buildIndexSearch(docs, options);

  console.log("flexIdx", flexIdx)
  const Export = {
    // @ts-ignore
    reg: JSON.stringify(flexIdx.registry),
    // @ts-ignore
    cfg: JSON.stringify(flexIdx.cfg),
    // @ts-ignore
    map: JSON.stringify(flexIdx.map),
    // @ts-ignore
    ctx: JSON.stringify(flexIdx.ctx),
  };

  const js = `const INDEX_DATA = ${JSON.stringify(Export)};
  const PREVIEW_LOOKUP = ${JSON.stringify(previews)};
  const options = ${JSON.stringify(options)};
  const data = { INDEX_DATA, PREVIEW_LOOKUP, options };
  export default data;`;

  console.log("  🔎 Done.");

  return js;
}
