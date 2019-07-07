module.exports = {
    devServer: {
        proxy: 'http://localhost:3000',
    },
    publicPath: process.env.NODE_ENV === 'production' ? '/visiexp/' : '/',
    configureWebpack: {
        /* module: {
            rules: [
                /!* {
                    test: /\.ts?$/,
                    loader: 'assemblyscript-typescript-loader',
                    include: /assemblyscript/, // to avoid a conflict with other ts file who use 'ts-load',so you can division them with prop 'include'
                    options: {
                        limit: 1000,
                        name: 'static/assembly/[name].[hash:8].wasm',
                    },
                }, *!/
                // {
                //     test: /\.wasm$/,
                //     type: 'javascript/auto',
                //     loaders: ['wasm-loader'],
                // },
            ],
        }, */
        // output: {
        //     webassemblyModuleFilename: '[modulehash].wasm',
        //     publicPath: 'js/',
        // },
        module: {
            rules: [
                {
                    test: /\.wasm$/,
                    type: 'webassembly/experimental',
                },
            ],
        },
        optimization: {
            occurrenceOrder: true, // To keep filename consistent between different modes (for example building only)
        },
    },
};
