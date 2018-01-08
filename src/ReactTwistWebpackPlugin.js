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

const TwistConfiguration = require('@twist/configuration');
const convertRuleToCondition = require('./convertRuleToCondition');
const webpack = require('webpack');

const OPTIONS = {
    includeBabelRuntime: true,
    targets: { browsers: [ 'last 2 versions', 'ie >= 10' ] },
    transformImports: false,
    useBabelModuleResolver: false,
    twistPlugin: '@twist/babel-plugin-transform-react',
};

/**
 * ReactWebpackPlugin configures Webpack to work with Twist. Its main function is as follows:
 *
 * - Add and configure a Babel plugin to parse ".jsx" files, including any decorators defined
 *   by the libraries you have chosen to add.
 * - Add any additional Webpack plugins that libraries have requested.
 *
 * ReactWebpackPlugin extends TwistConfiguration. You may use that class directly if you'd prefer
 * to configure your build system yourself.
 */
module.exports = class ReactWebpackPlugin extends TwistConfiguration {

    constructor() {
        super('webpack', OPTIONS);
    }

    _init(contextName, options) {

        /**
         * The local webpack instance.
         * @member {Webpack}
         */
        this.webpack = webpack;

        this._addBabelLoader = true;
        this._addThreadLoader = true;
        this._useSourceMaps = true;
        this._webpackPlugins = [];
        this._nonLibraryRuleExcludes = [];
        this._webpackRules = [];
        this._babelLoaderTest = /\.jsx$/;
        this._babelLoaderExcludes = [];

        super._init(contextName, options);

        // React Babel Plugins (some people use babel-preset-react instead):
        this.addBabelPlugin('syntax-jsx');
        this.addBabelPlugin('transform-react-jsx');
        this.addBabelPlugin('transform-react-display-name');
    }

    /**
     * If you have included your own ".jsx" rule in your Webpack configuration,
     * call `withoutBabelLoader()` and ReactWebpackPlugin will not attempt to add its own rule.
     * @return {ReactWebpackPlugin}
     */
    withoutBabelLoader() {
        this._addBabelLoader = false;
        return this;
    }

    /**
     * By default, twist-webpack will include the thread-loader to do multi-threaded compilation, which improves
     * build time. Call `withoutThreadLoader()` if you want to disable this.
     * @return {ReactWebpackPlugin}
     */
    withoutThreadLoader() {
        this._addThreadLoader = false;
        return this;
    }

    /**
     * By default, twist-webpack will include source maps. Call `withoutSourceMaps()` if you want to disable this.
     * @return {ReactWebpackPlugin}
     */
    withoutSourceMaps() {
        this._useSourceMaps = false;
        return this;
    }

    /**
     * Set the RegExp used to determine which files will be parsed with babel-loader.
     * @param {RegExp} regexp
     * @return {ReactWebpackPlugin}
     */
    setBabelLoaderTest(regexp) {
        if (!(regexp instanceof RegExp)) {
            throw new Error('setBabelLoaderTest() expects a RegExp instance; got ' + regexp);
        }
        this._babelLoaderTest = regexp;
        return this;
    }

    /**
     * Add an exclude pattern to Twist's babel loader. Use this only if you need to exclude certain files
     * that would otherwise match Twist files.
     * @param {RegExp|string} exclude
     * @return {ReactWebpackPlugin}
     */
    addBabelLoaderExclude(exclude) {
        this._babelLoaderExcludes.push(exclude);
        return this;
    }

    /**
     * Add an additional Webpack plugin. This is meant to be used by libraries; if you are not
     * writing a library, just add other plugins to your Webpack config normally.
     * @param {WebpackPlugin} plugin
     * @return {ReactWebpackPlugin}
     */
    addWebpackPlugin(plugin) {
        if (!this.currentLibrary.parentLibrary) {
            throw new Error('addWebpackPlugin() must be called from within a Twist library. '
                + 'To add a webpack plugin to your project, add it to your webpack config directly. '
                + 'If you are calling this from a library, make sure you have called `addPath()` first.');
        }
        this._webpackPlugins.push(plugin);
        return this;
    }

    /**
     * Add a Rule to the Webpack configuration. See <https://webpack.js.org/configuration/module/#rule>.
     * A Rule typically inclues a "test" property and a "loader" property, and can be used to specify loaders
     * for specific files (such as CSS processors).
     *
     * NOTE: Rules are automatically scoped to apply only to files contained within your library's package.
     * This ensures that different libraries don't conflict with each others' loaders. If you intend to provide
     * a loader that applies to files outside the current library, use `addGlobalWebpackRule`, with caution.
     *
     * @param {Rule} rule A webpack rule (e.g. { test: /\.css$/, loader: 'style-loader' })
     * @return {ReactWebpackPlugin}
     */
    addWebpackRule(rule) {
        if (!this.currentLibrary.parentLibrary) {
            throw new Error('addWebpackRule() must be called from within a Twist library. '
                + 'To add a webpack rule to your project, add it to your webpack config directly. '
                + 'If you are calling this from a library, make sure you have called `addPath()` first.');
        }
        // This rule applies to files within the current library which match `rule`.
        // Exclude files that match this rule from the end-users' configuration:
        this._nonLibraryRuleExcludes.push({
            and: [ this.currentLibrary.path, convertRuleToCondition(rule) ]
        });
        // And add the actual rule:
        this._webpackRules.push({
            include: this.currentLibrary.path,
            rules: [
                rule
            ]
        });
        return this;
    }

    /**
     * Add a rule to the Webpack configuration that applies to a path _outside_ the current library.
     * Only use this if you must provide a loader for files that don't live within your library's path.
     *
     * The rule you provide MUST have an `include` property, pointing to the absolute path of a directory
     * to which your loader will apply. This ensures that your loader points to a constrained set of files.
     * You can use `require.resolve("some-path-of-a-known-file")` to get the absolute path of a dependency.
     *
     * NOTE: By providing this loader, you're effectively saying that this loader takes ownership of any
     * matching files. If a user provides a similar rule in their config, yours takes precedence.
     *
     * @param {Rule} rule
     * @return {ReactWebpackPlugin}
     */
    addGlobalWebpackRule(rule) {
        if (!this.currentLibrary.parentLibrary) {
            throw new Error('addGlobalWebpackRule() must be called from within a Twist library. '
                + 'To add a webpack rule to your project, add it to your webpack config directly. '
                + 'If you are calling this from a library, make sure you have called `addPath()` first.');
        }
        if (!rule.include) {
            throw new Error('You must provide an `include` property on `ReactWebpackPlugin.addGlobalWebpackRule()`. '
                + 'See its documentation for details.');
        }
        this._nonLibraryRuleExcludes.push(convertRuleToCondition(rule));
        this._webpackRules.push(rule);
        return this;
    }

    /**
     * Add a custom Babel plugin. Note that in order to use multi-threaded compilation, the plugin parameter must be a string
     * (Babel will automatically require it when it's needed).
     *
     * @param {BabelPlugin|string} plugin
     * @param {object} [options]
     */
    addBabelPlugin(plugin, options) {
        if (typeof plugin !== 'string' && this._addThreadLoader) {
            console.warn('In order to use the thread-loader, all Babel plugins must be passed in as strings. Change `addLoader(require(xxx))` to `addBabelPlugin(xxx)` if you want to enable multi-threaded compilation');
            this._addThreadLoader = false;
        }
        return super.addBabelPlugin(plugin, options);
    }

    /**
     * Apply the plugin to a Webpack compiler. (This function is called by Webpack.)
     * @param {Compiler} compiler
     */
    apply(compiler) {
        const options = compiler.options;
        // Configure the Twist path aliases, merging them with `resolve.alias` in such a way
        // that users' aliases override ours.
        options.resolve = options.resolve || {};
        options.resolve.alias = Object.assign({}, this.twistOptions.aliases, options.resolve.alias || {});

        options.module = options.module || {};
        options.module.rules = options.module.rules || [];

        if (this._addBabelLoader) {
            let babelOptions = Object.assign(this.babelOptions, {
                sourceMaps: this._useSourceMaps
            });
            let use = [ {
                loader: 'babel-loader',
                options: babelOptions
            } ];

            if (this._addThreadLoader) {
                use.unshift({
                    loader: 'thread-loader'
                });
            }

            options.module.rules.push({
                test: this._babelLoaderTest,
                use,
                exclude: this._babelLoaderExcludes
            });
        }

        // Exclude any "files handled by libraries' loaders" from end-users' rules.
        options.module.rules.forEach((rule) => {
            if (!rule.exclude) {
                rule.exclude = [];
            }
            else if (!Array.isArray(rule.exclude)) {
                rule.exclude = [ rule.exclude ];
            }
            rule.exclude = rule.exclude.concat(this._nonLibraryRuleExcludes);
        });

        this._webpackRules.forEach((rule) => {
            options.module.rules.push(rule);
        });

        // Add any plugins that external libraries have defined.
        this._webpackPlugins.forEach((plugin) => {
            plugin.apply(compiler);
        });
    }
};
