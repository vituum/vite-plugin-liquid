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
