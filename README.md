<a href="https://npmjs.com/package/@vituum/vite-plugin-liquid"><img src="https://img.shields.io/npm/v/@vituum/vite-plugin-liquid.svg" alt="npm package"></a>
<a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/@vituum/vite-plugin-liquid.svg" alt="node compatility"></a>

# ⚡️💧 ViteLiquid

```js
import liquid from '@vituum/vite-plugin-liquid'

export default {
    plugins: [
        liquid()
    ],
    build: {
        rollupOptions: {
            input: ['index.liquid.html']
        }
    }
}
```

* Read the [docs](https://vituum.dev/plugins/liquid.html) to learn more about the plugin options.
* Use with [Vituum](https://vituum.dev) to get multi-page support.

## Basic usage

```html
<!-- index.liquid with index.liquid.json -->
{{ title }}
```
or
```html
<!-- index.json  -->
{
  "template": "path/to/template.liquid",
  "title": "Hello world"
}
```

### Requirements

- [Node.js LTS (16.x)](https://nodejs.org/en/download/)
- [Vite](https://vitejs.dev/)
