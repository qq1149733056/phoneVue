const { defineConfig } = require("@vue/cli-service");
const isEnvProduction = process.env.NODE_ENV === "production";
const path = require("path");
const date = new Date();
const timestamp = date.getTime();
const pages = {
  // index: {
  //   entry: "src/main.js",
  //   template: "public/index.html",
  //   filename: "index/index.html",
  //   title: "app",
  // },
  // login: {
  //   entry: "src/page/index/index.js",
  //   template: "public/index.html",
  //   filename: "login/login.html",
  //   title: "login",
  // },
  // dup: {
  //   entry: "src/page/dup/index.js",
  //   template: "public/index.html",
  //   filename: "dup/dup.html",
  //   title: "dup",
  // },
};
console.log(process.argv);
module.exports = defineConfig({
  publicPath: process.argv[2].includes("serve") ? "/" : "../", // 区分是在打包还是在调试,读取正在输入命令[ '/usr/local/bin/node','/path/to/your/project/package.json','run','serve' ]
  //pages: pages,
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
      performance: {
        hints: "warning",
        maxAssetSize: 5242880,
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "src"),
        },
        extensions: [".js", ".vue", ".json"],
      },
      devtool: config.mode === "production" ? false : "source-map",
      output: {
        filename: (pathData) => {
          if (pathData.chunk.name.includes("vendors")) {
            return "vendors/[name].bundle.js"; // 文件名
          } else {
            return "[name]/[name].bundle.js"; // 文件名
          }
        },
      },
      module: {
        rules: [
          {
            test: /\.node$/,
            use: "node-loader",
          },
          {
            test: /\.less$/i,
            use: [
              "style-loader",
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
