const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const args = process.argv;
let https = false;
let disableCORP = true;
if (args.includes('https')) https = true;
if (args.includes('corp')) disableCORP = false;

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    index: ['./src/js/index.js']
  },
  stats: {
    errorDetails: true
  },
  output: {
    path: path.resolve(__dirname, '/static'),
    publicPath: '/',
    hashDigestLength: 5,
    filename: '[name].min.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 500000
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  // resolve: {
  //   fallback: {
  //     crypto: require.resolve('crypto-browserify')
  //   },
  //   alias: {
  //     process: 'process/browser',
  //     browser: 'crypto-browserify'
  //   }
  // },
  externals: {},
  context: __dirname,
  target: 'web',
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    hot: true,
    https: https
      ? {
          cert: './localhost.crt',
          key: './localhost.key'
        }
      : undefined,
    client: {
      overlay: true
    },
    historyApiFallback: false,
    watchFiles: ['src/**/*.js'],
    allowedHosts: ['all'],
    headers: {
      'Access-Control-Allow-Origin': https ? 'https://0.0.0.0:3000' : 'http://0.0.0.0:3000',
      'Cross-Origin-Embedder-Policy': disableCORP ? '' : 'credentialless',
      'Cross-Origin-Opener-Policy': disableCORP ? '' : 'same-origin'
    },
    open: [https ? 'https://localhost:3000/' : 'http://localhost:3000/'],
    static: {
      directory: path.resolve(__dirname, 'node_modules/@zoom/videosdk/dist')
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.BABEL_ENV': JSON.stringify('development')
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html'
    })
  ]
};
