/*
 *  Copyright 2017 Adobe Systems Incorporated. All rights reserved.
 *  This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License. You may obtain a copy
 *  of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under
 *  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *  OF ANY KIND, either express or implied. See the License for the specific language
 *  governing permissions and limitations under the License.
 *
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactTwistWebpackPlugin = require('../src/ReactTwistWebpackPlugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: './Main.jsx',
    devServer: {
        contentBase: path.join(__dirname, 'build'),
        compress: true,
        port: 9000
    },
    resolve: {
        symlinks: false,
        extensions: [ '.js', '.jsx' ]
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    plugins: [
        new HtmlWebpackPlugin({ title: 'sample-project' }),
        new webpack.ProvidePlugin({ React: 'react' }),
        new ReactTwistWebpackPlugin(),
    ]
};
