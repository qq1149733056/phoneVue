module.exports = {
    plugins: {
      autoprefixer: {},
      'postcss-pxtorem': {
        rootValue: 37.5, // 根元素字体大小，根据设计稿来，一般设计稿会以 iPhone6/7/8 为原型设计
        propList: ['*'], // 需要被转换的属性
        selectorBlackList: [], // 不进行px转rem转换的选择器
        minPixelValue: 2 // 小于2px不进行转换
      }
    }
  } 