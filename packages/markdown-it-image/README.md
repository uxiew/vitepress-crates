
# @ver5/markdown-it-image

markdown-it 图片插件

## 安装

```sh
pnpm add @ver5/markdown-it-image
```


# usage

```ts
import { type ImageOptions, internalLinkPlugin } from "@ver5/markdown-it-image";

md.use<ImageOptions>(imagePlugin, {
  lazy?: boolean;
  caption?: boolean;
  center?: boolean;
});
```

使用示例

```md
![](./images/stack.png "标题=300x300")
```
