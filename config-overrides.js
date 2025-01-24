const { override, addWebpackPlugin, overrideDevServer } = require('customize-cra');
const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const processorDir = path.resolve(__dirname, 'src/processor');
const workerFiles = fs.readdirSync(processorDir).filter((file) => file.endsWith('processor.ts'));

const addDevServerCOOPReponseHeader = (config) => {
  config.headers = {
    ...config.headers,
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin'
  };
  config.devMiddleware = {
    ...config.devMiddleware,
    writeToDisk: true,
  };
  return config;
};

module.exports = {
  webpack: override(
    addWebpackPlugin(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'node_modules', '@zoom', 'videosdk', 'dist', 'lib'),
            to: path.resolve(__dirname, 'public', 'lib')
          }
        ]
      })
    ),
    (config) => {
      const entries = {
        main: path.resolve(__dirname, 'src/index.tsx')
      };

      workerFiles.forEach((file) => {
        const workerName = path.basename(file, path.extname(file));
        entries[workerName] = path.resolve(processorDir, file);
      });

      config.entry = entries;
      config.output = {
        ...config.output,
        filename: (pathData) => {
          if (pathData.chunk.name !== 'main') {
            return 'static/processors/[name].js';
          }
          return 'static/js/[name].[contenthash:8].js';
        },
        chunkFilename: 'static/js/[name].[contenthash:8].chunk.js', 
        path: path.resolve(__dirname, 'build'), 
        publicPath: '/',
      };
      const htmlWebpackPlugin = config.plugins.find(
        (plugin) => plugin instanceof HtmlWebpackPlugin
      );
      // only contains main chunk
      if (htmlWebpackPlugin) {
        htmlWebpackPlugin.options.chunks = ['main'];
      }
      return config;
    }
  ),
  devServer: overrideDevServer(addDevServerCOOPReponseHeader)
};
