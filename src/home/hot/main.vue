<template>
  <div class="hot-rank-container">
    <div class="page-header">
      <h2>🔥 市场雷达 (全A股)</h2>
      <p class="subtitle">量化筛选高波动与高人气标的</p>
    </div>

    <!-- 顶部标签切换 -->
    <van-tabs v-model:active="activeTab" sticky animated swipeable @change="onTabChange" color="#722ed1" title-active-color="#722ed1">
      <van-tab title="🌊 振幅榜" name="f7">
        <div class="rank-tip">策略: 适合<b>布林带</b>与<b>网格</b>交易，波动大价差大</div>
      </van-tab>
      <van-tab title="� 量比榜" name="f10">
        <div class="rank-tip">策略: <b>启动点侦测</b>，量比>2.5意味着主力大资金进场</div>
      </van-tab>
      <van-tab title="�🔥 换手榜" name="f8">
        <div class="rank-tip">策略: <b>短线博弈</b>，资金分歧大，流动性最好</div>
      </van-tab>
      <van-tab title="🚀 涨幅榜" name="f3">
        <div class="rank-tip">策略: <b>趋势跟随</b>，日内最强多头</div>
      </van-tab> 
      <van-tab title="📉 跌幅榜" name="f3_asc">
        <div class="rank-tip">策略: <b>超跌反弹</b>，寻找情绪杀跌错杀股</div>
      </van-tab>
    </van-tabs>

    <!-- 列表头部 -->
    <div class="list-header">
      <span class="col-name">股票名称</span>
      <span class="col-price">价格</span>
      <span class="col-kpi">{{ getKpiLabel() }}</span>
    </div>

    <!-- 股票列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div v-if="loading && list.length===0" class="loading-box">
        <van-loading type="spinner" color="#722ed1" /> 加载中...
      </div>
      
      <div class="stock-list" v-else>
        <div 
          v-for="(item, index) in list" 
          :key="item.code" 
          class="stock-item"
          @click="showDetail(item)"
        >
          <div class="rank-badge" :class="'rank-'+(index+1)">{{ index + 1 }}</div>
          
          <div class="stock-info">
            <div class="name">
              {{ item.name }}
              <span v-if="item.isST" class="tag-st">ST</span>
            </div>
            <div class="code">{{ item.code }}</div>
          </div>
          
          <div class="stock-price" :class="getPriceColor(item.pct)">
            <div class="main-price">{{ item.price }}</div>
            <div class="sub-percent">{{ item.pct > 0 ? '+' : ''}}{{ item.pct }}%</div>
          </div>
          
          <div class="stock-kpi">
             <!-- 动态显示核心指标 -->
             <div class="kpi-value">{{ item.kpiValue }}%</div>
             <!-- 特殊标签 -->
             <div class="trend-bar">
                <div class="bar-inner" :style="{width: Math.min(Math.abs(item.kpiValue)*4, 100) + '%', background: getKpiColor()}"></div>
             </div>
          </div>
        </div>
      </div>
    </van-pull-refresh>

    <!-- 底部操作提示 -->
    <div class="copy-tip" v-if="selectedItem">
      已选中：{{ selectedItem.name }} ({{ selectedItem.code }}) 
      <span class="action-btn" @click="copyCode">复制每股代码</span>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

// 状态管理
const activeTab = ref('f7'); // 默认振幅榜
const list = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const selectedItem = ref(null);

// 配置映射
const TAB_CONFIG = {
  'f7': { label: '振幅', sortField: 'f7', sortOrder: 1 }, // 振幅降序
  'f10': { label: '量比', sortField: 'f10', sortOrder: 1 }, // 新增：量比降序
  'f8': { label: '换手', sortField: 'f8', sortOrder: 1 }, // 换手降序
  'f3': { label: '涨幅', sortField: 'f3', sortOrder: 1 }, // 涨幅降序
  'f3_asc': { label: '跌幅', sortField: 'f3', sortOrder: 0 }, // 涨幅升序(跌幅)
};

// 工具函数：获取当前指标名称
const getKpiLabel = () => {
  return TAB_CONFIG[activeTab.value]?.label || '数值';
};

const getKpiColor = () => {
  if (activeTab.value === 'f3') return '#f5222d';
  if (activeTab.value === 'f3_asc') return '#52c41a';
  if (activeTab.value === 'f8') return '#faad14';
  if (activeTab.value === 'f10') return '#13c2c2'; // 量比青色
  return '#722ed1'; // 默认振幅紫
};

const getPriceColor = (pct) => {
  if (pct > 0) return 'red-text';
  if (pct < 0) return 'green-text';
  return 'gray-text';
};

// 交互：选中股票
const showDetail = (item) => {
  selectedItem.value = item;
  // 这里可以做更多交互，比如自动跳转到分析页（如果有路由的话）
};

// 复制功能
const copyCode = () => {
  if (!selectedItem.value) return;
  const input = document.createElement('input');
  input.value = selectedItem.value.code;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  alert(`复制成功：${selectedItem.value.code}，请前往[量化波动检测]页面粘贴分析`);
};

// 核心：请求数据
const fetchRankData = async () => {
  loading.value = true;
  try {
    const config = TAB_CONFIG[activeTab.value];
    
    // 东方财富全市场排行接口
    const url = 'https://4.push2.eastmoney.com/api/qt/clist/get';
    const params = {
      pn: 1,      //页码
      pz: 60,     //每页数量 (已增加到60)
      po: config.sortOrder, //排序方向 1desc 0asc
      np: 1,
      ut: 'bd1d9ddb04089700cf9c27f6f7426281',
      fltt: 2,
      invt: 2,
      fid: config.sortField, // 排序字段：f3涨幅 f7振幅 f8换手
      fs: 'm:0 t:6,m:1 t:2', // 仅保留沪深主板 (排除创业板300、科创板688)
      fields: 'f12,f14,f2,f3,f7,f8,f10,f5,f6' // 增加 f10 (量比)
    };

    const res = await axios.get(url, { params });
    const rawData = res.data?.data?.diff || [];

    // 数据清洗
    list.value = rawData.map(item => {
      // 动态决定显示的 KPI
      let kpi = 0;
      if (activeTab.value === 'f7') kpi = item.f7; // 振幅
      else if (activeTab.value === 'f8') kpi = item.f8; // 换手
      else if (activeTab.value === 'f10') kpi = item.f10; // 量比
      else kpi = item.f3; // 涨跌

      return {
        code: item.f12,
        name: item.f14,
        price: item.f2 === '-' ? 0 : item.f2,
        pct: item.f3 === '-' ? 0 : item.f3,
        turnover: item.f8,
        amplitude: item.f7,
        volRatio: item.f10, // 存储量比
        kpiValue: kpi === '-' ? 0 : kpi,
        isST: item.f14 && item.f14.includes('ST')
      };
    });

  } catch (err) {
    console.error('Fetch rank failed', err);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

const onTabChange = () => {
  list.value = [];
  fetchRankData();
};

const onRefresh = () => {
  fetchRankData();
};

onMounted(() => {
  fetchRankData();
});
</script>

<style lang="less" scoped>
.hot-rank-container {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 50px;
}

.page-header {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  
  h2 { margin: 0; font-size: 20px; color: #333; }
  .subtitle { margin: 4px 0 0; font-size: 13px; color: #999; }
}

.rank-tip {
  padding: 8px 16px;
  font-size: 12px;
  color: #666;
  background: #f9f0ff;
}

.list-header {
  display: flex;
  padding: 8px 16px;
  background: #eee;
  font-size: 12px;
  color: #888;
  
  .col-name { flex: 4; }
  .col-price { flex: 3; text-align: right; }
  .col-kpi { flex: 3; text-align: right; margin-right: 4px;}
}

.stock-list {
  background: white;
}

.loading-box {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.stock-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
  
  &:active { background: #fafafa; }

  .rank-badge {
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    margin-right: 12px;
    background: #eee;
    color: #666;
    
    &.rank-1 { background: #f5222d; color: white; }
    &.rank-2 { background: #fa8c16; color: white; }
    &.rank-3 { background: #faad14; color: white; }
  }

  .stock-info {
    flex: 4;
    .name { 
      font-size: 16px; 
      font-weight: 500; 
      color: #333; 
      display: flex;
      align-items: center;
    }
    .code { font-size: 12px; color: #999; margin-top: 2px;}
    
    .tag-st {
      font-size: 10px;
      padding: 0 4px;
      border: 1px solid #ccc;
      color: #999;
      border-radius: 2px;
      margin-left: 4px;
      font-weight: normal;
    }
  }

  .stock-price {
    flex: 3;
    text-align: right;
    
    .main-price { font-size: 16px; font-weight: 600; font-family: monospace;}
    .sub-percent { font-size: 12px; margin-top: 2px;}
    
    &.red-text { color: #f5222d; }
    &.green-text { color: #52c41a; }
    &.gray-text { color: #333; }
  }

  .stock-kpi {
    flex: 3;
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    
    .kpi-value { font-size: 16px; font-weight: bold; color: #333; font-family: monospace}
    
    .trend-bar {
      width: 50px;
      height: 4px;
      background: #eee;
      border-radius: 2px;
      margin-top: 4px;
      overflow: hidden;
      
      .bar-inner { height: 100%; border-radius: 2px;}
    }
  }
}

.copy-tip {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #333;
  color: white;
  padding: 12px 16px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 99;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  
  .action-btn {
    background: #1890ff;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
  }
}
</style>
