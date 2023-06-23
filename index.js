import { resolve } from 'node:path'
import fs from 'node:fs'
import lodash from 'lodash'
import { Liquid } from 'liquidjs'
import {
    getPackageInfo,
    pluginTransform,
    pluginReload,
    processData,
    pluginBundle,
    merge,
    pluginMiddleware
} from 'vituum/utils/common.js'
import { renameBuildEnd, renameBuildStart } from 'vituum/utils/build.js'

const { name } = getPackageInfo(import.meta.url)

/**
 * @type {import('@vituum/vite-plugin-liquid/types').PluginUserConfig}
 */
const defaultOptions = {
    reload: true,
    root: null,
    filters: {},
    tags: {},
    globals: {
        format: 'liquid'
    },
    data: ['src/data/**/*.json'],
    formats: ['liquid', 'json.liquid', 'json'],
    ignoredPaths: [],
    options: {
        liquidOptions: {},
        renderOptions: {},
        renderFileOptions: {}
    }
}

const renderTemplate = async ({ filename, server, root }, content, options) => {
    const initialFilename = filename.replace('.html', '')
    const output = {}
    const context = options.data
        ? processData({
            paths: options.data,
            root
        }, options.globals)
        : options.globals

    if (initialFilename.endsWith('.json')) {
        lodash.merge(context, JSON.parse(content))

        if (!options.formats.includes(context.format)) {
            return new Promise((resolve) => {
                output.content = content
                resolve(output)
            })
        }

        output.template = true

        if (typeof context.template === 'undefined') {
            const error = `${name}: template must be defined for file ${initialFilename}`

            return new Promise((resolve) => {
                output.error = error
                resolve(output)
            })
        }

        context.template = resolve(options.root, context.template)
    } else if (fs.existsSync(`${initialFilename}.json`)) {
        lodash.merge(context, JSON.parse(fs.readFileSync(`${initialFilename}.json`).toString()))
    }

    const liquid = new Liquid(Object.assign({
        root: options.root
    }, options.options.liquidOptions))

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
            output.content = liquid.renderFile(context.template, context, options.options.renderFileOptions).catch(onError).then(onSuccess)
        } else {
            output.content = liquid.parseAndRender(content, context, options.options.renderOptions).catch(onError).then(onSuccess)
        }
    })
}

/**
 * @param {import('@vituum/vite-plugin-liquid/types').PluginUserConfig} options
 * @returns [import('vite').Plugin]
 */
const plugin = (options = {}) => {
    let resolvedConfig
    let userEnv

    options = merge(defaultOptions, options)

    return [{
        name,
        config (userConfig, env) {
            userEnv = env
        },
        configResolved (config) {
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
            order: 'pre',
            async transform (content, { path, filename, server }) {
                return pluginTransform(content, { path, filename, server }, { name, options, resolvedConfig, renderTemplate })
            }
        },
        handleHotUpdate: ({ file, server }) => pluginReload({ file, server }, options)
    }, pluginBundle(options.formats), pluginMiddleware(name, options.formats)]
}

export default plugin
