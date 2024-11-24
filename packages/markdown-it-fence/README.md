
# @ver5/markdown-it-fence

markdown-it code fence plugin to get the original code fence info, even

## 安装

```sh
pnpm add @ver5/markdown-it-fence
```

# usage

```ts
import { fencePlugin } from "@ver5/markdown-it-fence";

  md.use(fencePlugin)
```

inject a new property `_info` to the token, which contains the original code fence info.
you can use it for other plugin
