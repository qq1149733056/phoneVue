const { defineConfig } = require("@vue/cli-service");
const webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin"); //更具项目需求来选择压缩插件
const CustomOutputPlugin = require("./outputPlugin/CustomOutputPlugin"); //预留自定义组件
const { getDirectories, getDataPageIndex } = require("./Unit");
const data = require("./pages.json");
const path = require("path");
const date = new Date();
const timestamp = date.getTime();
const isEnvProduction = process.env.NODE_ENV === "production";
let pages = {};
if (data.pages.length > 0) {
  let arr = [];
  data.pages.forEach((val, index) => {
    let pagesPath = path.resolve(__dirname, `src/${val}`);
    let tempArr = getDirectories(pagesPath, val);
    arr.push(...tempArr);
    pages = getDataPageIndex(arr);
  });
} else {
  pages = getDataPageIndex(data.pagesindex);
}
let cssIF = process.argv[2].includes("build");
cssExtract = cssIF
  ? {
      filename: "css/css.[contenthash].css",
      chunkFilename: "css/css.[contenthash].css",
    }
  : false;
console.log(pages); //输出路径
module.exports = defineConfig({
  css: {
    extract: cssExtract,
  },
  publicPath: process.argv[2].includes("serve") ? "/" : "../", // 区分是在打包还是在调试,读取正在输入命令[ '/usr/local/bin/node','/path/to/your/project/package.json','run','serve' ]
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
          //console.log(pathData)
          if (pathData.chunk.name.includes("vendors")) {
            return "vendors/[name].bundle.js"; // 文件名
          } else {
            let arr = pathData.chunk.name.split("/");
            let str = arr.join("_");
            return `${arr[0]}/${str}.bundle.js`; // 文件名
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
          global: "lib-flexible/flexible",
        }),
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
