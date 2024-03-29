// 打包时只能整个模块打包 注意 特殊需求请更具自己的项目来修改 unit(文件修改) outputPlugin(插件)
const { defineConfig } = require("@vue/cli-service");
const { VantResolver } = require("@vant/auto-import-resolver");
const { getDirectories, getDataPageIndex } = require("./unit");
const webpack = require("webpack");
const CustomOutputPlugin = require("./outputPlugin/CustomOutputPlugin"); //修改文件路径插件
const ZipDirectoryPlugin = require("./outputPlugin/ZipDirectoryPlugin"); //压缩目录 更具pages和zip来命名
const VConsolePlugin = require("vconsole-webpack-plugin");
const ComponentsPlugin = require("unplugin-vue-components/webpack");
//更具阿里云mpaas的配置来写入
const mpaascloudCofig = require("./mpassConfig.json").mpaascloudCofig;
const data = require("./pages.json");
const path = require("path");
const date = new Date();
const timestamp = date.getTime();
const isEnvProduction = process.env.NODE_ENV === "production";
const outputPath = isEnvProduction
  ? `dist/dist_${timestamp}`
  : `sit/sit_${timestamp}`;
let pages = {};
//pages 如果这个数组中有填写目录 会优先处理它
if (data.pages.length > 0) {
  let arr = [];
  data.pages.forEach((val, index) => {
    let pagesPath = path.resolve(__dirname, `src/${val}`);
    let tempArr = getDirectories(pagesPath, val);
    arr.push(...tempArr);
    pages = getDataPageIndex(arr, outputPath);
  });
} else {
  pages = getDataPageIndex(data.pagesindex, outputPath);
}
const paths = Object.values(pages).map((page) => ({
  filename: `${page.pathName}.zip`,
  path: `${page.outputPath}`,
  pathName: page.pathName,
}));
const uniquePaths = Array.from(new Set(paths.map(JSON.stringify))).map(
  JSON.parse
);
console.log(uniquePaths); //输出路径
let cssIF = process.argv[2].includes("build");
cssExtract = cssIF
  ? {
      filename: `${mpaascloudCofig.appid}/${mpaascloudCofig.ip}/${mpaascloudCofig.workid}/[name].[contenthash].css`,
    }
  : false;
console.log(pages); //输出路径
let plugins = []; //区分打包还是运行 只要在打包是才需要启动这两个个插件
if (!process.argv[2].includes("serve")) {
  plugins.push(new CustomOutputPlugin(pages));
  plugins.push(new ZipDirectoryPlugin(uniquePaths, outputPath));
}
module.exports = defineConfig({
  css: {
    extract: cssExtract,
  },
  publicPath: process.argv[2].includes("serve") ? "/" : "../../", // 区分是在打包还是在调试,读取正在输入命令[ '/usr/local/bin/node','/path/to/your/project/package.json','run','serve' ]
  pages: pages,
  outputDir: outputPath,
  devServer: {
    client: {
      overlay: {
        warnings: false, // 在浏览器控制台显示警告
        errors: true, // 在浏览器控制台显示错误
      },
    },
    hot: true,
    open: false,
    host: "0.0.0.0",
    port: 8080, // 可选，如果你想改变端口
    //disableHostCheck: true, // 可选，如果你想禁用主机检查
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {},
    },
  },
  transpileDependencies: true,
  //lintOnSave: true,
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
            // common: {
            //   test: /[\\/]src[\\/]/,
            //   name: "common",
            //   chunks: "all",
            //   minSize: 0,
            //   priority: -20,
            //   reuseExistingChunk: true,
            // },
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
            return `${mpaascloudCofig.appid}/${mpaascloudCofig.ip}/${mpaascloudCofig.workid}/[contenthash].js`;
          } else {
            let arr = pathData.chunk.name.split("/");
            let str = arr.join("_");
            return `${arr[0]}/js/${str}.bundle.js`; // 文件名
          }
        },
      },
      module: {
        rules: [
          // {
          //   test: /\.less$/i,
          //   use: [
          //     // "vue-style-loader",
          //     // "css-loader",
          //     // "postcss-loader",
          //     // "less-loader",
          //   ],
          // },
          {
            test: /\.(png|ico?n|jpe?g|gif|svg)(\?.*)?$/,
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
        new VConsolePlugin({
          enable: process.env.NODE_ENV !== "production",
        }),
        ...plugins,
        // 当 unplugin-vue-components 版本小于 0.26.0 时，使用以下写法
        //ComponentsPlugin({ resolvers: [VantResolver()] }),
        //当 unplugin-vue-components 版本大于等于 0.26.0 时，使用以下写法
        ComponentsPlugin.default({ resolvers: [VantResolver()] }),
      ],
    };
  },
});
