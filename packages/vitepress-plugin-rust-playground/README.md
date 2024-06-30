
#  rust playground for vitepress

This is a Rust playground for vitepress. It uses the Rust Playground API to provide code execution and syntax highlighting.

# usage


## 安装
```
pnpm install -g @ver5/vitepress-plugin-rust-playground
```

## vitepress plugin

```
import { editorPlugin } from '@ver5/vitepress-plugin-editor/markdown-it'


md.use(editorPlugin,{
  lang: 'rust',  // 默认 rust
  version: 'stable',  // 指定 rust 版本
  edition: '2021' // 指定 rust edition
})

```

在 md 文件中使用 需要在代码块中的第一行使用 `//\`` 之后加上配置的方式，如下：
````md
```rust
//` {version:"stable",edition:"2021",maxHeight:"400px"}
  fn main() {
      println!("Hello, world!");
  }
```
````

or use `no_run` to disable code execution:
````md
```rust
//` no_run
  fn main() {
      println!("Hello, world!");
  }
```
````




# Credits
https://github.com/zqianem/vitepress-python-editor/
https://play.rust-lang.org/?version=nightly&mode=debug&edition=2021
https://lab.cs.tsinghua.edu.cn/rust/play/?version=stable&mode=debug&edition=2021
