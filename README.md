<a href="https://npmjs.com/package/@vituum/vite-plugin-liquid"><img src="https://img.shields.io/npm/v/@vituum/vite-plugin-liquid.svg" alt="npm package"></a>
<a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/@vituum/vite-plugin-liquid.svg" alt="node compatility"></a>

# ⚡️💧 ViteLiquid

```js
import liquid from '@vituum/vite-plugin-liquid'

export default {
  plugins: [
    liquid({
      reload: true,
      root: null,
      filters: {},
      tags: {},
      globals: {
          template: 'path/to/template.liquid'
      },
      data: '*.json',
      filetypes: {
          html: /.(json.html|liquid.json.html|liquid.html)$/,
          json: /.(json.liquid.html)$/
      },
      liquid: {}
    })
  ]
}
```

Read the [docs](https://vituum.dev/config/integrations-options.html#vituum-liquid) to learn more about plugin options

## Basic usage

```html
<!-- index.html -->
<script type="application/json" data-format="liquid">
  {
    "template": "path/to/template.liquid",
    "title": "Hello world"
  }
</script>
```
or
```html
<!-- index.liquid.html with index.liquid.json -->
{{ title }}
```
or
```html
<!-- index.json.html or index.liquid.json.html  -->
{
  "template": "path/to/template.liquid",
  "title": "Hello world"
}
```

### Requirements

- [Node.js LTS (16.x)](https://nodejs.org/en/download/)
- [Vite](https://vitejs.dev/) or [Vituum](https://vituum.dev/)
