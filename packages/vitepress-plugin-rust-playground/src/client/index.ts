import type { Plugin } from 'vue'
import RustPlayground from './Editor.vue'
import { InjectPlayKey, type Options } from "./config";

export {
  RustPlayground
}

const components = {
  RustPlayground,
}

export const RustPlaygroundPlugin: Plugin<Options> = {
  install(app, options) {
    if (typeof options !== 'undefined' && typeof options === 'object')
      app.provide(InjectPlayKey, options)

    for (const key of Object.keys(components))
      app.component(key, components[key as keyof typeof components])
  },
}
