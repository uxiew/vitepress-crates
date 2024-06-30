import type { Plugin } from 'vite'

export function GraphViewData(): Plugin {
  return {
    name: '@ver5/vitepress-plugin-graph-view',
    enforce: 'pre',
    config() {
      return {
        optimizeDeps: {
          exclude: [
            '@ver5/vitepress-plugin-graph-view/client',
          ],
        },
        ssr: {
          noExternal: [
            '@ver5/vitepress-plugin-graph-view',
          ],
        },
      }
    },
  }
}
