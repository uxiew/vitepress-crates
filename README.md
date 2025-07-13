# 个人的 vitepress 工具合集

该项目中大部分都来自他人的开源项目，修改了大部分代码为满足自己的使用需求，里面提供了一些功能和组件，
也许有你想要的。

```shell
pnpm i @ver5/<name> -D
```


要找到集成的名称，下面是一个我们当前支持的集成列表：

- [控制文本块对齐（`markdown-it` 插件）](./packages/markdown-it-align/README.md)
- [内部链接（`markdown-it` 插件）](./packages/markdown-it-link-links/README.md)
- [元素转换（`markdown-it` 插件）](./packages/markdown-it-token/README.md)
- [图片转换（`markdown-it` 插件）](./packages/markdown-it-image/README.md)
- [`<mark>` 元素增强（VitePress 插件）](./packages/vitepress-plugin-mark/README.md)
- [行内链接预览（VitePress 插件）](./packages/vitepress-plugin-link-preview/README.md)
- [rust playground（VitePress 插件）](./packages/vitepress-plugin-rust-playground/README.md)
- [自动生成 sidebar（VitePress 插件）](./packages/vitepress-plugin-sidebar/README.md)
- [全文搜索（VitePress 插件）](./packages/vitepress-plugin-search/README.md)

## 如何开发

- 对于一般情况下的纯 TypeScript / JavaScript 库而言：我们使用 [`unbuild`](https://github.com/unjs/unbuild) 和 [Vite](https://github.com/vitejs/vite) 来进行开发和构建。这意味着，在借助于 [`unbuild`](https://github.com/unjs/unbuild) 底层所使用的 [`jiti`](https://github.com/unjs/jiti) 的强大功能的加持下，无需配置 [Rollup](https://rollupjs.org/)，也无需使用 [Vite](https://github.com/vitejs/vite)，就能够监听本地文件的变化，并打包修改和开发的模块。
- 对于需要加载非 [Rollup](https://rollupjs.org/) 和 [Vite](https://github.com/vitejs/vite) 兼容的插件的库而言（比如 Vue UI 库）：我们依然会使用 [Vite](https://github.com/vitejs/vite) 来进行开发和构建，所以依然会涉及到本地文件的监听和打包。

我们可以直接运行下面的命令来监听和构建在 `packages` 目录下的所有项目打包后的文件：

```sh
pnpm run packages:stub
```

## 构建

```sh
pnpm run packages:build
```

### Credits
- [Nólëbase/integrations](https://github.com/nolebase/integrations.git)
