interface LiquidOptions {
    liquidOptions: import('liquidjs').LiquidOptions,
    renderOptions: import('liquidjs/dist/src/liquid-options').RenderOptions
    renderFileOptions: import('liquidjs/dist/src/liquid-options').RenderFileOptions
}

export interface PluginUserConfig {
    reload?: boolean | Function
    root?: string
    filters?: Object
    tags?: Object
    globals?: Object
    data?: string | string[]
    formats?: string[]
    ignoredPaths?: string[]
    options?: LiquidOptions
}

declare interface PluginTransformCtx {
    filename?: string
    server?: import('vite').ViteDevServer
    root?: string
}

export declare function renderTemplate(ctx: PluginTransformCtx, html: string, options: PluginUserConfig) : Promise<{
    error: string
    content: string
}>

export default function plugin(options?: PluginUserConfig) : import('vite').Plugin
