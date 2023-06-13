import { resolve, relative } from 'node:path'
import fs from 'node:fs'
import process from 'node:process'
import lodash from 'lodash'
import { Liquid } from 'liquidjs'
import { getPackageInfo, pluginError, pluginReload, processData, pluginBundle } from 'vituum/utils/common.js'
import { renameBuildEnd, renameBuildStart } from 'vituum/utils/build.js'

const { name } = getPackageInfo(import.meta.url)
const defaultOptions = {
    reload: true,
    root: null,
    filters: {},
    tags: {},
    globals: {},
    data: null,
    formats: ['liquid', 'json.liquid'],
    liquid: {
        options: {},
        renderOptions: {},
        renderFileOptions: {}
    }
}

const renderTemplate = async (filename, content, options) => {
    const initialFilename = filename.replace('.html', '')
    const output = {}
    const context = options.data ? processData(options.data, options.globals) : options.globals

    if (initialFilename.endsWith('.json')) {
        lodash.merge(context, JSON.parse(fs.readFileSync(filename).toString()))

        output.template = true

        if (typeof context.template === 'undefined') {
            const error = `${name}: template must be defined for file ${initialFilename}`

            return new Promise((resolve) => {
                output.error = error
                resolve(output)
            })
        }

        context.template = relative(process.cwd(), context.template).startsWith(relative(process.cwd(), options.root))
            ? resolve(process.cwd(), context.template)
            : resolve(options.root, context.template)
    } else if (fs.existsSync(`${initialFilename}.json`)) {
        lodash.merge(context, JSON.parse(fs.readFileSync(`${initialFilename}.json`).toString()))
    }

    const liquid = new Liquid(Object.assign({
        root: options.root
    }, options.liquid.options))

    Object.keys(options.filters).forEach(name => {
        if (typeof options.filters[name] !== 'function') {
            throw new TypeError(`${name} needs to be a function!`)
        }

        liquid.registerFilter(name, options.filters[name])
    })

    Object.keys(options.tags).forEach(name => {
        if (typeof options.tags[name] !== 'object') {
            throw new TypeError(`${name} needs to be an object!`)
        }

        liquid.registerTag(name, options.tags[name])
    })

    return new Promise((resolve) => {
        const onError = (error) => {
            output.error = error
            resolve(output)
        }

        const onSuccess = (content) => {
            output.content = content
            resolve(output)
        }

        if (output.template) {
            output.content = liquid.renderFile(context.template, context, options.liquid.renderFileOptions).catch(onError).then(onSuccess)
        } else {
            output.content = liquid.parseAndRender(content, context, options.liquid.renderOptions).catch(onError).then(onSuccess)
        }
    })
}

const plugin = (options = {}) => {
    let resolvedConfig
    let userEnv

    options = lodash.merge(defaultOptions, options)

    return [{
        name,
        config (config, env) {
            userEnv = env
        },
        configResolved (/** @type {import('vite/dist/node/index.d.ts').UserConfigExport} */ config) {
            resolvedConfig = config

            if (!options.root) {
                options.root = config.root
            }
        },
        buildStart: async () => {
            if (userEnv.command !== 'build') {
                return
            }

            await renameBuildStart(resolvedConfig.build.rollupOptions.input, options.formats)
        },
        buildEnd: async () => {
            if (userEnv.command !== 'build') {
                return
            }

            await renameBuildEnd(resolvedConfig.build.rollupOptions.input, options.formats)
        },
        transformIndexHtml: {
            enforce: 'pre',
            async transform (content, { path, filename, server }) {
                path = path.replace('?raw', '')
                filename = filename.replace('?raw', '')

                if (!options.formats.find(format => path.endsWith(`${format}.html`))) {
                    return content
                }

                const render = await renderTemplate(filename, content, options)
                const renderError = pluginError(render.error, server)

                if (renderError) {
                    return renderError
                }

                return render.content
            }
        },
        handleHotUpdate: ({ file, server }) => pluginReload({ file, server }, options)
    }, pluginBundle(options.formats)]
}

export default plugin
