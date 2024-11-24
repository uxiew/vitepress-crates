
#  vitepress-pluign-sidebar

Automatically generate directory navigation based on the current file and directory structure

## Install

```sh
pnpm add -D @ver5/vitepress-plugin-sidebar
```

## Usage

```ts
import { getSideBar } from '@ver5/vitepress-plugin-sidebar'
```

`options`：
```ts
  ignoreDirs: [],
  indexLink: "index",
  ignoreFiles: ["index"],
  collapsed: true,
  sortBy(path): boolean,
  handle(item): void
```

# Credits
https://github.com/luciozhang/vitepress-plugin-autobar
