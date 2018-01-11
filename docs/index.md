# Twist Webpack+React Build System (@twist/react-webpack-plugin)

The `@twist/react-webpack-plugin` module provides a Webpack plugin that allows you to easily package React-Twist applications using Webpack.

You can use Twist without Webpack -- Twist is compatible with any build system that supports Babel -- but if you're just getting started, we'd recommend starting with this.

When you use built-in components and decorators in Twist, it looks like they're globals, because you don't have to import anything to use them. In reality though, the build system is configuring the Twist compiler so that it's aware of them -- whenever it encounters a decorator or component in your code that's been registered with the compiler, it automatically injects the right import into the generated code! This means that you only pull in the code from Twist that you're actually using.
