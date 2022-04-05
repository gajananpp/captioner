const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const {merge} = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

dotenv.config();

const extensionPath = path.join(__dirname, 'src');

const commonConfig = {
  entry: {
    extension: {
      import: path.join(extensionPath, 'background.ts'),
      filename: 'background.js',
    },
    configure: {
      import: path.join(extensionPath, 'action/index.tsx'),
      filename: 'action.js',
    },
    superappWidget: {
      import: path.join(extensionPath, 'content-script/index.tsx'),
      filename: 'contentScript.js',
    },
  },
  output: {
    clean: true,
    filename: '[name].js',
    path: path.resolve('.', 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'lazyStyleTag',
              insert: function insertIntoTarget(element, options) {
                // eslint-disable-next-line
                const parent = options.target || document.head;
                parent.appendChild(element);
              },
            },
          },
          // 'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|gif|jpg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [new webpack.EnvironmentPlugin([])],
};

const devConfig = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
};

const prodConfig = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: true,
        },
      }),
    ],
  },
};

let config = {};

if (process.env.NODE_ENV === 'production') {
  config = merge(commonConfig, prodConfig);
} else {
  config = merge(commonConfig, devConfig);
}

module.exports = config;
