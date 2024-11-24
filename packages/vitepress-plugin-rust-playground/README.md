# rust playground for vitepress

This is a Rust playground for vitepress. It uses the Rust Playground API to provide code execution and syntax highlighting.

## Install

```sh
pnpm add @ver5/vitepress-plugin-rust-playground
```

## Usage

```ts
import { type rustPlaygroundOptions, editorPlugin } from '@ver5/vitepress-plugin-editor/vitepress'


md.use<rustPlaygroundOptions>(editorPlugin,{
  version: 'stable',  // 指定 rust 版本
  edition: '2021' // 指定 rust edition
})

```

Use `:{}` in the md file with the configuration, in the form of object literals, note the double quotes, as follows:

````md
```rust:{version:"stable",edition:"2021",maxHeight:"400px"}
  fn main() {
      println!("Hello, world!");
  }
```
````

or use `no_run` to disable code execution:

````md
```rust no_run
  fn main() {
      println!("Hello, world!");
  }
```
````

## TODO

- [ ] user input

# Credits

https://github.com/zqianem/vitepress-python-editor/
https://play.rust-lang.org/?version=nightly&mode=debug&edition=2021
https://lab.cs.tsinghua.edu.cn/rust/play/?version=stable&mode=debug&edition=2021
