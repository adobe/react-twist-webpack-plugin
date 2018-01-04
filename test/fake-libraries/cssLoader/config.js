module.exports = (config) => {
    config.addWebpackRule({
        test: /\.css$/,
        loader: 'css-loader'
    });
};
