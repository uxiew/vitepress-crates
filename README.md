# 个人的 vitepress 工具合集

提供的一些功能、组件，完善页面的展示效果

```shell
pnpm i @ver5/<name> -D
```


要找到集成的名称，下面是一个我们当前支持的集成列表：

- [双向链接（`markdown-it` 插件）](./packages/markdown-it-bi-directional-links/README.md)
- [元素转换（`markdown-it` 插件）](./packages/markdown-it-element-transform/README.md)
- [阅读增强（VitePress 插件）](./packages/vitepress-plugin-enhanced-readabilities/README.md)
- [行内链接预览（VitePress 插件）](./packages/vitepress-plugin-inline-link-preview/README.md)
- [闪烁高亮当前的目标标题（VitePress 插件）](./packages/vitepress-plugin-highlight-targeted-heading/README.md)
- [页面属性（VitePress 插件）](./packages/vitepress-plugin-page-properties/README.md)
- [预览图片（社交媒体卡片）生成（VitePress 插件）](./packages/vitepress-plugin-og-image/README.md)
- [`<mark>` 元素增强（VitePress 插件）](./packages/vitepress-plugin-enhanced-mark/README.md)

## 如何开发

- 对于一般情况下的纯 TypeScript / JavaScript 库而言：我们使用 [`unbuild`](https://github.com/unjs/unbuild) 和 [Vite](https://github.com/vitejs/vite) 来进行开发和构建。这意味着，在借助于 [`unbuild`](https://github.com/unjs/unbuild) 底层所使用的 [`jiti`](https://github.com/unjs/jiti) 的强大功能的加持下，无需配置 [Rollup](https://rollupjs.org/)，也无需使用 [Vite](https://github.com/vitejs/vite)，就能够监听本地文件的变化，并打包修改和开发的模块。
- 对于需要加载非 [Rollup](https://rollupjs.org/) 和 [Vite](https://github.com/vitejs/vite) 兼容的插件的库而言（比如 Vue UI 库）：我们依然会使用 [Vite](https://github.com/vitejs/vite) 来进行开发和构建，所以依然会涉及到本地文件的监听和打包。

我们可以直接运行下面的命令来监听和构建在 `packages` 目录下的所有项目打包后的文件：

```sh
pnpm run packages:stub
```

## 如何构建

```sh
pnpm run packages:build
```

### Credits
- [Nólëbase/integrations](https://github.com/nolebase/integrations.git)
