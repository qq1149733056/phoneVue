import request from '@/utils/request'

// 示例：获取首页数据
export function getHomeData() {
  return request({
    url: '/home/index',
    method: 'get'
  })
}

// 示例：获取商品详情
export function getGoodsDetail(id) {
  return request({
    url: '/goods/detail',
    method: 'get',
    params: { id }
  })
}
