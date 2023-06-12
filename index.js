import { dirname, resolve, relative } from 'path'
import fs from 'fs'
import process from 'node:process'
import FastGlob from 'fast-glob'
import lodash from 'lodash'
import { Liquid } from 'liquidjs'
import pc from 'picocolors'
import { fileURLToPath } from 'url'
import { getPackageInfo, pluginError } from 'vituum/utils/common.js'

const { name } = getPackageInfo(import.meta.url)
const defaultOptions = {
    reload: true,
    root: null,
    filters: {},
    tags: {},
    globals: {},
    data: '',
    filetypes: {
        html: /.(json.html|liquid.json.html|liquid.html)$/,
        json: /.(json.liquid.html)$/
    },
    liquid: {}
}

function processData(paths, data = {}) {
    let context = {}

    lodash.merge(context, data)

    const normalizePaths = Array.isArray(paths) ? paths.map(path => path.replace(/\\/g, '/')) : paths.replace(/\\/g, '/')

    FastGlob.sync(normalizePaths).forEach(entry => {
        const path = resolve(process.cwd(), entry)

        context = lodash.merge(context, JSON.parse(fs.readFileSync(path).toString()))
    })

    return context
}

const renderTemplate = async(filename, content, options) => {
    const output = {}
    const context = options.data ? processData(options.data, options.globals) : options.globals

    const isJson = filename.endsWith('.json.html') || filename.endsWith('.json')
    const isHtml = filename.endsWith('.html') && !options.filetypes.html.test(filename) && !options.filetypes.json.test(filename) && !isJson

    if (isJson || isHtml) {
        lodash.merge(context, isHtml ? content : JSON.parse(fs.readFileSync(filename).toString()))

        output.template = true

        if (typeof context.template === 'undefined') {
            console.error(chalk.red(name + ' template must be defined - ' + filename))
        }

        context.template = relative(process.cwd(), context.template).startsWith(relative(process.cwd(), options.root))
            ? resolve(process.cwd(), context.template) : resolve(options.root, context.template)

    } else if (fs.existsSync(filename + '.json')) {
        lodash.merge(context, JSON.parse(fs.readFileSync(filename + '.json').toString()))
    }

    const liquid = new Liquid(Object.assign({
        root: options.root
    }, options.liquid))

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
            output.content = liquid.renderFile(context.template, context).catch(onError).then(onSuccess)
        } else {
            output.content = liquid.parseAndRender(content, context).catch(onError).then(onSuccess)
        }
    })
}

const plugin = (options = {}) => {
    options = lodash.merge(defaultOptions, options)

    return {
        name,
        config: ({ root }) => {
            if (!options.root) {
                options.root = root
            }
        },
        transformIndexHtml: {
            enforce: 'pre',
            async transform(content, { path, filename, server }) {
                path = path.replace('?raw', '')
                filename = filename.replace('?raw', '')

                if (
                    !options.filetypes.html.test(path) &&
                    !options.filetypes.json.test(path)
                ) {
                    return content
                }

                const render = await renderTemplate(filename, content, options)

                if (pluginError(render, server)) {
                    return
                }

                return render.content
            }
        },
        handleHotUpdate({ file, server }) {
            if (
                (typeof options.reload === 'function' && options.reload(file)) ||
                (typeof options.reload === 'boolean' && options.reload && (options.filetypes.html.test(file) || options.filetypes.json.test(file)))
            ) {
                server.ws.send({ type: 'full-reload' })
            }
        }
    }
}

export default plugin
