/**
 * 导航适配层
 * 统一处理 mPaaS 环境与本地开发环境的页面跳转
 */

/**
 * 跳转到指定页面
 * @param {string} url - 目标页面 URL (相对路径或绝对路径)
 * @param {object} params - 传递给页面的参数
 * @param {object} options - 其他配置项 (如 readTitle, showOptionMenu)
 */
export function navigateTo(url, params = {}, options = {}) {
  const defaultOptions = {
    readTitle: true,
    showOptionMenu: false,
    ...options
  };

  if (window.AlipayJSBridge) {
    // mPaaS 环境
    AlipayJSBridge.call("pushWindow", {
      url: url,
      param: {
        ...defaultOptions,
        ...params,
      },
    });
  } else {
    // 本地开发/普通浏览器环境
    console.log(`[Dev Navigation] Jumping to: ${url}`, params);
    
    // 构建 URL 参数字符串
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(params[key]))}`)
      .join('&');
      
    const targetUrl = queryString ? `${url}?${queryString}` : url;
    
    // 简单模拟 pushWindow
    window.location.href = targetUrl;
  }
}

/**
 * 关闭当前页面
 */
export function popWindow() {
  if (window.AlipayJSBridge) {
    AlipayJSBridge.call("popWindow");
  } else {
    console.log('[Dev Navigation] popWindow called');
    window.history.back();
  }
}

/**
 * 设置页面标题
 * @param {string} title 
 */
export function setTitle(title) {
  if (window.AlipayJSBridge) {
    AlipayJSBridge.call('setTitle', { title });
  } else {
    document.title = title;
  }
}
