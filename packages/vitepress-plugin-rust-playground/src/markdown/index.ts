// markdown-it plugin for generating line numbers.
// It depends on preWrapper plugin.

import type MarkdownIt from "markdown-it/index.mjs";
import { fencePlugin } from "@ver5/markdown-it-fence";
import stringify from "simple-stringify";
import { checkCodeIntegrity, getCodeConfig } from "../client/utils";
import { type Options } from "../client/config";

export { type Options as rustPlaygroundOptions }

/*
  TODO:
  * `editable` — Enables the[editor].
  * `noplayground` — Removes the play button, but will still be tested.
  * `mdbook-runnable` — Forces the play button to be displayed.
    This is intended to be combined with the`ignore` attribute for examples that should not be tested, but you want to allow the reader to run.
  * `ignore` — Will not be tested and no play button is shown, but it is still highlighted as Rust syntax.
  * `should_panic` — When executed, it should produce a panic.
  * `no_run` — The code is compiled when tested, but it is not run.
    The play button is also not shown.
  * `compile_fail` — The code should fail to compile.
  * `edition2015`, `edition2018`, `edition2021` — Forces the use of a specific Rust edition.
  See[`rust.edition`] to set this globally.
*/
export const rustPlaygroundPlugin = (md: MarkdownIt, options: Options = {}) => {
  const lang = 'rust'
  // const simple = options?.simple
  const fence = md.renderer.rules.fence!;

  md.use(fencePlugin)
    .renderer.rules.fence = (...args) => {
      const [tokens, idx] = args;
      const { info, content: rawCode } = tokens[idx];

      // if lang is txt,disable linenumbers
      if (info === "txt") {
        tokens[idx].info = "txt:no-line-numbers";
      }

      let htmlCode = ''
      // if (tokens[idx].type === 'fence') console.log(args[2], infoLang, rawCode);
      // if (rawCode.includes('l<C: IsCool>')) console.log(infoLang, rawCode);

      if (/rust/.test(info)) {
        tokens[idx].info = lang;
        htmlCode = fence(...args);

        // @ts-expect-error inject _info
        const _info: string = tokens[idx]._info

        const noRun = /(,|\s)no_run/.test(_info)

        if (noRun) {
          tokens[idx].info = lang;
          htmlCode = htmlCode.replace(/"(language-rust)/, '"$1 no_run');
          return htmlCode
        }
        let execOptions = {};

        // @ts-ignore
        const match = tokens[idx]._info.match(/:({.*?})/);
        const configRaw = match && match[1] && match[1].trim() || "";
        if (configRaw) {
          execOptions = { ...options, ...getCodeConfig(configRaw) }
        }

        // if (checkCodeIntegrity(info, htmlCode) || simple) {
        if (checkCodeIntegrity(lang, rawCode)) {
          htmlCode = htmlCode + `<RustPlayground ${stringify.json(execOptions, 2)} id="${Math.random().toString(16).slice(2)}"/>`;
        } else {
          // htmlCode = htmlCode.replace(/<button/, `<button title="Run this code" class="run"></button><button`);
        }

      } else {
        htmlCode = fence(...args);
      }

      return htmlCode;
    };
};
