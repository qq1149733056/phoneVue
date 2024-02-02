# phoneVue

## Project setup
```
npm install
```
### Compiles and hot-reloads for sit
```
npm run serve:sit
```
### Compiles and minifies for sit
```
npm run build:sit
```
### 打包时请在pages数组中填写模块名
pages.json 文件中pages是打包时填写的模块 对应阿里mpass中的H5离线包(在zip.json中自行填写包名)
pages.json 文件中pages也可以作为运行调试的模块,注意pages优先级高于pagesindex
pages.json 文件中的pagesindex是运行多个模块多页面时调试