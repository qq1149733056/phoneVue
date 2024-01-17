const { defineConfig } = require("@vue/cli-service");
const webpack = require('webpack');
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CustomOutputPlugin = require("./outputPlugin/CustomOutputPlugin");
const isEnvProduction = process.env.NODE_ENV === "production";
const path = require("path");
const date = new Date();
const timestamp = date.getTime();
const data = require("./pages.json");
let pages = {};
if (data.pages.length > 0) {
} else {
  data.pagesindex.forEach((val, index) => {
    let temp = val.split("/");
    pages[val] = {
      entry: `src/${val}/main.js`,
      template: "public/index.html",
      filename: `${val}/${temp[temp.length - 1]}.html`,
      title: `${temp[temp.length - 1]}`,
    };
  });
}
let cssIF = process.argv[2].includes("build");
cssExtract = cssIF
  ? {
      filename: "[name]/css.[contenthash].css",
      chunkFilename: "[name]/css.[contenthash].css",
    }
  : false;
console.log(pages); //输出路径
module.exports = defineConfig({
  // css: {
  //   extract: process.argv[2].includes("build"), //判断是serve还是build 直接配置true可能导致无法热更新
  // },
  css: {
    extract: cssExtract,
  },
  publicPath: process.argv[2].includes("serve") ? "/" : "../../", // 区分是在打包还是在调试,读取正在输入命令[ '/usr/local/bin/node','/path/to/your/project/package.json','run','serve' ]
  pages: pages,
  outputDir: isEnvProduction
    ? `dist/dist_${timestamp}`
    : `sit/sit_${timestamp}`,
  devServer: {
    hot: true,
    open: false,
    port: 8080,
    host: "localhost",
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {},
    },
  },
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: (config) => {
    return {
      optimization: {
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              minSize: 20000,
              maxSize: 0,
              minChunks: 2,
              maxAsyncRequests: 30,
              maxInitialRequests: 30,
              automaticNameDelimiter: "~",
            },
            common: {
              test: /[\\/]src[\\/]/,
              name: "common",
              chunks: "all",
              minSize: 0,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      },
      // performance: {
      //   hints: "warning",
      //   maxAssetSize: 5242880,
      // },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "src"),
        },
        extensions: [".js", ".vue", ".json"],
      },
      devtool: config.mode === "production" ? false : "source-map",
      output: {
        filename: (pathData) => {
          // console.log(pathData)
          if (pathData.chunk.name.includes("vendors")) {
            return "vendors/[name].bundle.js"; // 文件名
          } else {
            let arr = pathData.chunk.name.split("/");
            return (
              pathData.chunk.name + "/" + arr[arr.length - 1] + ".bundle.js"
            ); // 文件名
          }
        },
      },
      module: {
        rules: [
          {
            test: /\.less$/i,
            use: [
              "vue-style-loader",
              "css-loader",
              "postcss-loader",
              "less-loader",
            ],
          },
          {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            type: "asset",
            parser: {
              dataUrlCondition: {
                maxSize: 10240, // 10kb
              },
            },
            generator: {
              filename: "assets/[hash][ext][query]",
            },
          },
        ],
      },
      plugins: [
        new webpack.ProvidePlugin({
          // 配置全局模块
          global: 'lib-flexible/flexible'
        }),
        //  new CustomOutputPlugin(pages),
        //   new MiniCssExtractPlugin({
        //     filename: "[name]/css.[contenthash].css",
        //      chunkFilename: "[name]/css.[contenthash].css",
        //   }),
        // new CompressionPlugin({
        //   algorithm: "gzip",
        //   test: /\.js$|\.css$|\.html$/,
        //   threshold: 10240,
        //   minRatio: 0.8,
        // }),
      ],
    };
  },
});
