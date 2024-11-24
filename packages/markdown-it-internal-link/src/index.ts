import type MarkdownIt from "markdown-it/index.mjs";
import { normalizeLink } from "./utils";

type Link = { url: string, openInNewTab: boolean }
type LinkType = string | Link
type Rules = Record<string, LinkType>;

interface SidebarItem {
  text: string;
  link: string;
}

export interface InternalLinkOptions {
  /**
   * vitepress's base path
   */
  base?: string
  /**
   * items to internal link
   */
  sidebar?: SidebarItem[]
  /**
   * custom rules
   */
  rules?: Rules
  /**
   * Whether to open links in a new tab
   */
  openInNewTab?: boolean
}

const innerRules = (text: string) => [/(第\s\d+\s章)/.exec(text), /(第.部分)/.exec(text)];
const makeLink = (link: LinkType, openInNewTab: boolean = true): Link => typeof link === "string" ? { url: link, openInNewTab } : link;

/** 自定义规则匹配 */
const customRules = (code: string, link_rules: Rules, inNewTab: boolean) => {
  Object.keys(link_rules).forEach((ruleKey) => {
    if (code.includes(ruleKey)) {
      code = toLinkUrl(code, ruleKey, makeLink(link_rules[ruleKey], inNewTab));

      // if (code.includes("12684")) {
      //   console.log(code);
      // }
    }
  });
  return code;
};

function toLinkUrl(raw: string, rule: string, link: Link) {
  return raw.replace(
    new RegExp("([^/])" + rule, "g"),
    (matchText, i) => i + `<a href="${normalizeLink(link.url)}" ${link.openInNewTab ? 'target="_blank"' : ''}>${matchText.replace(i, "")}</a>`,
  );
}

/**
 * @description 将对应的部分、章节进行链接，方便快速跳转。
 */
export function internalLinkPlugin(md: MarkdownIt, options: InternalLinkOptions = {}) {
  const { base: BASE = '', sidebar = [], rules = {}, openInNewTab = true } = options;
  const text = md.renderer.rules.text!;
  const codeInline = md.renderer.rules.code_inline!;

  md.renderer.rules.code_inline = (...args) => {
    let rawCodeInline = codeInline(...args);
    return customRules(rawCodeInline, rules, openInNewTab);
  };

  md.renderer.rules.text = (...args) => {
    let rawText = text(...args);

    // if (args[3].path?.includes('/notes/')) return rawText

    // internal Link
    for (let { text, link } of sidebar) {
      if (rawText.includes(text)) continue;
      const excludes = text.match(/(.*)（(.*)）/);
      if (excludes && [excludes[1], excludes[2]].some((ex) => rawText.includes(ex))) continue;

      // 内链匹配规则
      innerRules(text).forEach((rule) => {
        if (rule) {
          // 去除 类似的标题被匹配，例如 “第 1 章 与XXX见”
          if (rawText.includes(rule[0] + " ")) return;
          rawText = toLinkUrl(rawText, rule[0], {
            url: BASE + link, openInNewTab
          },);
        }
      });
    }

    return customRules(rawText, rules, openInNewTab);
  };
}
