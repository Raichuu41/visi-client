module.exports = {
    devServer: {
        proxy: 'http://localhost:3000',
    },
    css: {
        sourceMap: true,
    },
    configureWebpack: {
        module: {
            rules: [
                // {
                //     test: /\.wasm$/,
                //     type: 'webassembly/experimental',
                // },
                {
                    test: /\.wasm$/,
                    type: 'javascript/auto',
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'wasm/[name].[hash].[ext]',
                            },
                        },
                    ],
                },
            ],
        },
        optimization: {
            // To keep filename consistent between different modes (for example building only)
            occurrenceOrder: true,
        },
    },
};
