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

/* global describe it */

const ReactTwistWebpackPlugin = require('../src/ReactTwistWebpackPlugin');
const assert = require('assert');
const webpack = require('webpack');
const path = require('path');


describe('ReactWebpackPlugin', () => {

    it('instantiates TwistConfiguration with the proper options.', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null });
        assert.equal(plugin.getOption('includeBabelRuntime'), true);
        assert.equal(plugin.getOption('transformImports'), false);
        assert(plugin.getOption('targets').browsers);
        assert.equal(plugin.getOption('useBabelModuleResolver'), false);
    });

    it('does not allow addWebpackPlugin outside of a library', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null });
        assert.throws(() => {
            plugin.addWebpackPlugin({});
        });
    });

    it('does not allow addWebpackRule outside of a library', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null });
        assert.throws(() => {
            plugin.addWebpackRule({});
        });
    });

    it('adds other webpack plugins if desired', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: path.join(__dirname, './fake-libraries/addedWebpackPlugin') });
        const compiler = webpack({ entry: 'main.js' });

        assert(!compiler.addedWebpackPlugin);
        plugin.apply(compiler);
        assert(compiler.addedWebpackPlugin);
    });

    it('allows users to override Twist aliases', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null });
        const compiler = webpack({
            entry: 'main.js',
            resolve: {
                alias: {
                    Twist: 'foo'
                }
            }
        });
        plugin.apply(compiler);
        assert.equal(compiler.options.resolve.alias.Twist, 'foo');
    });

    it('applies a .jsx rule with babel-loader and TwistConfiguration’s plugins', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null });
        const compiler = webpack({ entry: 'main.js' });
        plugin.apply(compiler);
        assert.equal(compiler.options.module.rules.length, 1);
        let rule = compiler.options.module.rules[0];
        assert(rule.test.test('.jsx'));
        assert.equal(rule.use[0].loader, 'thread-loader');
        assert.equal(rule.use[1].loader, 'babel-loader');
        assert.deepEqual(rule.use[1].options.plugins, plugin.babelOptions.plugins);
        assert.deepEqual(rule.use[1].options.presets, plugin.babelOptions.presets);
    });

    it('allows you to override the babel-loader test regexp', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null })
            .setOption('babelLoaderTest', /\.foobar$/);
        const compiler = webpack({ entry: 'main.js' });
        plugin.apply(compiler);
        assert.equal(compiler.options.module.rules.length, 1);
        let rule = compiler.options.module.rules[0];
        assert(rule.test.test('.foobar'));
        assert(!rule.test.test('.jsx'));
        assert.equal(rule.use[0].loader, 'thread-loader');
        assert.equal(rule.use[1].loader, 'babel-loader');
        assert.deepEqual(rule.use[1].options.plugins, plugin.babelOptions.plugins);
        assert.deepEqual(rule.use[1].options.presets, plugin.babelOptions.presets);
    });

    it('throws if you pass a string to setBabelLoaderTest()', () => {
        assert.throws(() => {
            new ReactTwistWebpackPlugin({ root: null }).setBabelLoaderTest('.foo');
        });
    });

    it('allows libraries to add custom rules to the config, scoped to their path', () => {
        const compiler = webpack({ entry: 'main.js' });
        const plugin = new ReactTwistWebpackPlugin({ root: path.join(__dirname, './fake-libraries/cssLoader') });
        plugin.apply(compiler);
        assert.equal(compiler.options.module.rules.length, 2);
        assert.deepEqual(compiler.options.module.rules[1], {
            include: path.normalize(path.join(__dirname, './fake-libraries/cssLoader')),
            rules: [
                { test: /\.css$/, loader: 'css-loader' }
            ]
        });
    });

    it('libraries override end-user loaders on their own files', () => {
        const compiler = webpack({
            entry: 'main.js',
            module: {
                rules: [
                    { test: /\.css$/, loader: 'less-loader' }
                ]
            }
        });
        const plugin = new ReactTwistWebpackPlugin({ root: path.join(__dirname, './fake-libraries/cssLoader') });
        plugin.apply(compiler);
        assert.equal(compiler.options.module.rules.length, 3);

        const myRule = compiler.options.module.rules[0];
        assert.deepEqual(myRule.exclude, [ { and: [ path.join(__dirname, './fake-libraries/cssLoader'), { test: /\.css$/ } ] } ]);
        assert.deepEqual(myRule.loader, 'less-loader');
    });

    it('libraries override end-user loaders on external files (addGlobalWebpackRule)', () => {
        const compiler = webpack({
            entry: 'main.js',
            module: {
                rules: [
                    { test: /\.css$/, loader: 'less-loader' }
                ]
            }
        });
        const plugin = new ReactTwistWebpackPlugin({ root: null });
        plugin.addLibrary(path.join(__dirname, './fake-libraries/globalCssLoader'), { include: '/' });
        plugin.apply(compiler);
        assert.equal(compiler.options.module.rules.length, 3);

        const myRule = compiler.options.module.rules[0];
        assert.deepEqual(myRule.exclude, [ { include: '/', test: /\.css$/ } ]);
        assert.deepEqual(myRule.loader, 'less-loader');
    });

    it('addGlobalWebpackRule() requires an include property', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null });
        assert.throws(() => {
            plugin.addLibrary(path.join(__dirname, './fake-libraries/globalCssLoader'));
        }, /`include` property/);
    });

    it('allows libraries to add a babel-loader exclude pattern', () => {
        const compiler = webpack({ entry: 'main.js' });
        const plugin = new ReactTwistWebpackPlugin({ root: path.join(__dirname, './fake-libraries/exclude') });
        plugin.apply(compiler);
        assert.deepEqual(compiler.options.module.rules[0].exclude[0], /\.js/);
    });

    it('does not add babel-loader if you don’t want it', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null });
        plugin.setOption('babelLoaderTest', null);

        const compiler = webpack({
            entry: 'main.js',
            module: { rules: [ { test: /.jsx$/, loader: 'babel-loader' } ] }
        });

        plugin.apply(compiler);
        assert.equal(compiler.options.module.rules.length, 1);
    });

    it('does not add the thread-loader if you don’t want it', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null });
        plugin.setOption('useThreadLoader', false);

        const compiler = webpack({ entry: 'main.js' });
        plugin.apply(compiler);
        assert.equal(compiler.options.module.rules.length, 1);

        let rule = compiler.options.module.rules[0];
        assert(rule.use.length, 1);
        assert.equal(rule.use[0].loader, 'babel-loader');
        assert.deepEqual(rule.use[0].options.plugins, plugin.babelOptions.plugins);
        assert.deepEqual(rule.use[0].options.presets, plugin.babelOptions.presets);
    });

    it('enables source maps by default', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null });

        const compiler = webpack({ entry: 'main.js' });
        plugin.apply(compiler);
        assert.equal(compiler.options.module.rules.length, 1);

        let rule = compiler.options.module.rules[0];
        assert.deepEqual(rule.use[1].options.sourceMaps, true);
    });

    it('does not enable source maps if you don’t want it', () => {
        const plugin = new ReactTwistWebpackPlugin({ root: null });
        plugin.setOption('useSourceMaps', false);

        const compiler = webpack({ entry: 'main.js' });
        plugin.apply(compiler);
        assert.equal(compiler.options.module.rules.length, 1);

        let rule = compiler.options.module.rules[0];
        assert.deepEqual(rule.use[1].options.sourceMaps, false);
    });
});
