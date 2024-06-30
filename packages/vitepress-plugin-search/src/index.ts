import { Plugin, ResolvedConfig } from "vite";
import { IndexSearch } from "./md-index-builder";
import type { Options } from "./types";

export const DEFAULT_OPTIONS: Options = {
  previewLength: 62,
  buttonLabel: "Search",
  placeholder: "Search docs",
  allow: [],
  ignore: [],
  separator: "",
  showLogo: true,
};

export function SearchPlugin(searchOptions?: Partial<Options>): Plugin {
  // eslint-disable-next-line no-unused-vars
  const options = {
    ...DEFAULT_OPTIONS,
    ...searchOptions,
  };

  let config: ResolvedConfig;
  const virtualModuleId = "virtual:search-data";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "vite-plugin-search",
    enforce: "pre",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    config: () => ({
      resolve: {
        alias: { "./VPNavBarSearch.vue": "@ver5/vitepress-plugin-search/Search.vue" },
      },
    }),

    async resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(this, id) {
      if (id !== resolvedVirtualModuleId) return;
      const data = await IndexSearch(config.root, options);
      return data;
    },
  };
}
