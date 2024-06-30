// markdown-it plugin for generating line numbers.
// It depends on preWrapper plugin.

import type MarkdownIt from "markdown-it";
import { type PluginWithOptions } from "markdown-it";
import { checkCodeIntegrity, getCodeConfig } from "../client/utils";
import { type Options, defaultConfig } from "../client/config";
import stringify from "simple-stringify";


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
export const rustPlaygroundPlugin: PluginWithOptions<Options> = (md: MarkdownIt, options) => {
  const lang = 'rust'

  // const simple = options?.simple
  const fence = md.renderer.rules.fence!;

  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const { info, content: rawCode } = tokens[idx];

    // if lang is txt,disable linenumbers
    if (info === "txt") {
      tokens[idx].info = "txt:no-line-numbers";
    }

    if (info === "") {
      tokens[idx].info = "log:no-line-numbers";
    }

    let htmlCode = ''
    const configReg = /^\s*\/\/`(.*)\s*/g;

    // if (tokens[idx].type === 'fence') console.log(infoLang, rawCode);
    // if (rawCode.includes('l<C: IsCool>')) console.log(infoLang, rawCode);

    if (/rust/.test(info)) {
      tokens[idx].info = lang;
      const matchRes = configReg.exec(rawCode)
      tokens[idx].content = rawCode.replaceAll(configReg, '')
      htmlCode = fence(...args);

      let execOptions = {};
      if (matchRes) {
        const [, configRaw] = matchRes

        const noRun = configRaw.includes('no_run')

        if (noRun) {
          tokens[idx].info = lang;
          htmlCode = htmlCode.replace(/"(language-rust)/, '"$1 no_run');
          return htmlCode
        }

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
