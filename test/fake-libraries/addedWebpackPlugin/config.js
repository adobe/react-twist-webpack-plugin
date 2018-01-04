module.exports = (config) => {
    config.addWebpackPlugin({
        apply(compiler) {
            compiler.addedWebpackPlugin = true;
        }
    });
};
