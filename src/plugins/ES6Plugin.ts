import { Builder } from '../Builder';
import { ConfigPlugin } from '../ConfigPlugin';
import requireModule from '../requireModule';
import Spin from '../Spin';
import JSRuleFinder from './shared/JSRuleFinder';

export default class ES6Plugin implements ConfigPlugin {
  public configure(builder: Builder, spin: Spin) {
    if (builder.stack.hasAll(['es6', 'webpack'])) {
      if (builder.stack.hasAny('es6') && !builder.stack.hasAny('dll')) {
        builder.config = spin.merge(
          {
            entry: {
              index: ['babel-polyfill']
            }
          },
          builder.config
        );
      }

      const jsRuleFinder = new JSRuleFinder(builder);
      const jsRule = jsRuleFinder.findAndCreateJSRule();
      jsRule.exclude = /node_modules/;
      jsRule.use = {
        loader: requireModule.resolve('babel-loader'),
        options: {
          babelrc: false,
          cacheDirectory: spin.dev,
          compact: !spin.dev,
          presets: [
            requireModule.resolve('babel-preset-react'),
            [requireModule.resolve('babel-preset-env'), { modules: false }],
            requireModule.resolve('babel-preset-stage-0')
          ].concat(spin.dev ? [] : [[requireModule.resolve('babel-preset-minify'), { mangle: false }]]),
          plugins: [
            requireModule.resolve('babel-plugin-transform-runtime'),
            requireModule.resolve('babel-plugin-transform-decorators-legacy'),
            requireModule.resolve('babel-plugin-transform-class-properties')
          ],
          only: jsRuleFinder.extensions.map(ext => '*.' + ext)
        }
      };
    }
  }
}
