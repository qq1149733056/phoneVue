# Copilot 使用说明（仓库定制）

以下说明帮助 AI 编码代理快速在本仓库中高效工作。只记录可从代码中发现的约定与关键操作步骤。

## 项目概览与核心文件
- 构建入口：`package.json` 中的脚本：`npm run serve`、`npm run build`、`npm run serve:sit`、`npm run build:sit`。
- 多页面/模块打包由 `vue.config.js` 控制（读取 `pages.json` 和 `unit.js` 的目录逻辑）。
- 打包产物路径以时间戳命名：开发/调试输出为 `sit/sit_<timestamp>`，生产为 `dist/dist_<timestamp>`（变量 `outputPath`）。
- 阿里 mpaas 相关映射配置在 `mpassConfig.json`（字段 `appid` / `ip` / `workid`），用于生成最终资源路径和 CDN 替换。

## 关键打包/集成插件（必须理解）
- `outputPlugin/CustomOutputPlugin.js`：
  - 在构建时调整 css/js 的输出路径，并将 vendors（公共包）路径替换为 HTTPS 地址（基于 `mpaascloudCofig.appid`）。
  - 修改 HtmlWebpackPlugin 生成的 asset 标签以匹配阿里 mpaas 的部署目录结构。
- `outputPlugin/ZipDirectoryPlugin.js`：
  - 构建完成后把各页面目录压缩为 zip，压缩名可由 `zip.json` 中的映射覆盖。
  - 插件在 `compiler.hooks.done` 上执行，只有通过 build（非 serve）会触发这些插件逻辑。

## 常见工作流 / 快速命令
- 本地 sit 调试（带模块选择）：
  - `npm run serve:sit`  — 使用 `pages.json` 中的 `pages` 配置来选择要调试的模块。
- sit 打包（生成 sit 目录与 zip）：
  - `npm run build:sit`  — 触发 `CustomOutputPlugin` 和 `ZipDirectoryPlugin`，输出到 `sit/sit_<timestamp>` 并生成 zip。
- 生产打包：`npm run build`。

## pages 与模块约定（修改前请校验）
- 要打包的模块在 `pages.json` 的 `pages` 数组中指定；如果为空，使用 `pagesindex`（`unit.js` 中的 `getDataPageIndex` 会解析目录并生成 `pages`）。
- 源代码模块目录位于 `src/<module>/...`，`vue.config.js` 通过 `getDirectories` 遍历模块并构建多页 entry。

## 调试与修改打包逻辑的注意事项
- `vue.config.js` 判断运行模式依赖 `process.argv[2].includes('serve')` 与 `process.argv[2].includes('build')`；在修改时务必保留原有分支逻辑以区分 serve vs build。
- CSS 抽取（`cssExtract`）在构建时会使用 `mpaascloudCofig` 的目录结构生成文件名；修改时注意不破坏最终路径格式。
- 修改 `CustomOutputPlugin` 或 `ZipDirectoryPlugin` 后，需要执行 `npm run build:sit`（或 `npm run build`）来验证产物；`serve` 不会触发打包插件。

## 日志与排查位置
- `vue.config.js` 会打印 `uniquePaths` 与 `pages`（console.log）——用来确认将要压缩/输出的路径。
- 压缩完成/删除原目录的日志在 `ZipDirectoryPlugin.js` 的 `output.on('close')` 回调中。

## 示例任务与提示模板（快速上手）
- 添加新模块 `foo`：
  1. 在 `src/foo/` 下创建页面目录并确保入口符合现有模块结构（参考 `src/home`）。
  2. 在 `pages.json` 的 `pages` 中加入 `foo`（或确保 `pagesindex` 能被 `unit.js` 选中）。
  3. 运行 `npm run build:sit` 并检查 `sit/sit_<timestamp>` 输出以及生成的 zip 名称。
- 修改 CDN 映射为 http(s)：在 `outputPlugin/CustomOutputPlugin.js` 搜索 `mpaascloudCofig.appid` 并调整替换逻辑，然后完整跑一次 `build`。

## 额外约定 / 小细节
- `unplugin-vue-components` 在此仓库使用 `ComponentsPlugin.default({ resolvers: [VantResolver()] })` 形式（注意版本差异）。
- 静态资源小文件会被内联（`asset` 类型，limit 10240）。大文件输出到 `assets/[hash][ext]`。
- 端口与 devServer 配置在 `vue.config.js` 中（默认 `8080`，host `0.0.0.0`）。

## 如果你是 AI 代理，请优先完成的检查项
- 确认 `pages.json` 与 `src` 模块目录是否匹配。示例：`pages.json` 中的 `20240201` 对应 `src/20240201/*`。
- 在修改任何输出路径或插件前，本地运行 `npm run build:sit` 并检查控制台打印的 `uniquePaths` 和最终 zip 文件名。

---
如果以上有遗漏或你希望我把某个插件/目录的细节展开为更精确的规则（例如具体的资源路径格式示例或更多快速提示模板），请告诉我需要补充的部分。 
