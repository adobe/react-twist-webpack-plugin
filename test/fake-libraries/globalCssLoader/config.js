module.exports = (config, options = {}) => {
    config.addGlobalWebpackRule({
        include: options.include,
        test: /\.css$/,
        loader: 'css-loader'
    });
};
