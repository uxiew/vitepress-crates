
import { type PluginWithOptions } from "markdown-it";
import type MarkdownIt from "markdown-it";

export interface ImageOptions {
  lazy?: boolean;
  caption?: boolean;
  center?: boolean;
}

/**
 * @examples ![](./images/stack.png "标题=300x400")
 */
export const imagePlugin = (md: MarkdownIt, { lazy = true, caption = true, center = true }: ImageOptions = {}) => {
  md.renderer.rules.image = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    const code = slf.renderToken(tokens, idx, options);
    if (token === null) return code;
    if (!token.attrs) return code;

    // "alt" attr MUST be set, even if empty. Because it's mandatory and
    // should be placed on proper position for tests.
    //
    // Replace content with actual value

    token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children!, options, env);

    if (lazy && token.attrIndex("loading") === -1) {
      // add loading="lazy" attribute
      token.attrs.push(["loading", "lazy"]);
    }

    // process optional ={width}x{height} title
    const titleIndex = token.attrIndex("title");
    if (titleIndex >= 0) {
      const [title, size] = token.attrs[titleIndex][1].split("=");
      const [width, height] = size ? size.split(/X|x/).map((v) => v.trim()) : [];

      let style = center ? "margin: auto;" : "";
      if (width) style += `width: ${width}px;`;
      if (height) style += `height: ${height}px;`;

      token.attrs.splice(
        titleIndex,
        1,
        ["title", typeof caption !== "boolean" && title ? title : token.attrs[token.attrIndex("alt")][1]],
        ["style", style],
      );

      if (caption && title)
        return `<figure>${slf.renderToken(tokens, idx, options)}
        <figcaption style="
        text-align:center;
        color:#696969;
        font-size:14px;">
          <em>${title}</em>
        </figcaption>
        </figure>`;
    }

    return slf.renderToken(tokens, idx, options);
  };
}
