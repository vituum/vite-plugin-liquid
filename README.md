<a href="https://npmjs.com/package/@vituum/vite-plugin-liquid"><img src="https://img.shields.io/npm/v/@vituum/vite-plugin-liquid.svg" alt="npm package"></a>
<a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/@vituum/vite-plugin-liquid.svg" alt="node compatility"></a>

# ⚡️💧 ViteLiquid

```js
export default {
  plugins: [
    liquid({
      filters: {},
      tags: {},
      data: '*.json',
      globals: {
          template: 'path/to/template.liquid'
      },
      filetypes: {
          html: /.(json.html|liquid.json.html|liquid.html)$/,
          json: /.(json.liquid.html)$/
      },
      options: {} // liquidjs options
    })
  ]
}
```

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
  "template": "path/to/template.twig",
  "title": "Hello world"
}
```

### Requirements

- [Node.js LTS (16.x)](https://nodejs.org/en/download/)
