# `@ver5/markdown-it-element-transform`

A [`markdown-it`](https://github.com/markdown-it/markdown-it) plugin that transforms elements.

## Install

```shell
pnpm add -D @ver5/markdown-it-internal-link
```

## Usage

```ts
import { type InternalLinkOptions, internalLinkPlugin } from "@ver5/markdown-it-internal-link";

md.use<InternalLinkOptions>(internalLinkPlugin, {
  sidebar: [{
    text: string;
    link: string;
  }],
  base: "xxx",
  openInNewTab: true,
  rules: {
    "XXX 文档|XXX 项目": "https://xx.com/",
    "XXX 12684": {
      url:"https://xx.com/xxx",
      openInNewTab: true
    },
  }
})
```
