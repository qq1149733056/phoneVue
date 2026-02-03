<template>
  <div class="quant-container">
    <div class="demo-header">
      <h2>量化波动检测</h2>
    </div>
    
    <div class="action-area">
      <div class="input-group">
        <van-field
          v-model="inputStockCode"
          label="股票代码"
          placeholder="请输入6位代码 (如002436)"
          maxlength="6"
          center
          clearable
        />
        <van-field
          v-model="inputStockName"
          label="股票名称"
          placeholder="请输入名称 (选填)"
          center
          clearable
        />
      </div>
      <van-button type="primary" block @click="startAnalysis" :loading="loading" :disabled="inputStockCode.length !== 6">
        开始波动分析
      </van-button>
    </div>

    <!-- 策略报告卡片 -->
    <div v-if="report" class="strategy-card">
      <div class="card-header">
        <span class="stock-name">{{ report.stockName }}</span>
        <span class="score-tag" :class="getScoreClass(report.score)">
          建议: {{ report.recommendation }}
        </span>
      </div>
      
      <div class="card-section">
        <div class="section-title">📊 波动特征 (近14日)</div>
        <div class="data-grid">
           <!-- 新增: 估值展示 -->
          <div class="data-item" style="min-width: 90px;">
            <span class="label">股票估值</span>
            <span class="value" style="color: #faad14; letter-spacing: 2px;">{{ report.safetyStars }}</span>
            <span class="status-text">{{ report.valuationText }}</span>
          </div>

          <div class="data-item" style="min-width: 90px;">
            <span class="label">公司市值</span>
             <!-- Split "总值: 145亿 | 流通: 145亿" -->
            <span class="value" style="font-size: 13px; margin-top: 4px; white-space: nowrap;">{{ report.companyText ? report.companyText.split('|')[0] : '-' }}</span>
            <span class="status-text" style="white-space: nowrap;">{{ report.companyText ? report.companyText.split('|')[1] : '-' }}</span>
          </div>

          <div class="data-item" style="min-width: 90px;">
            <span class="label">每股估值</span>
            <span class="value" style="font-size: 13px; margin-top: 4px; white-space: nowrap;">{{ report.perShareText ? report.perShareText.split('|')[0] : '-' }}</span>
            <span class="status-text" style="white-space: nowrap;">{{ report.perShareText ? report.perShareText.split('|')[1] : '-' }}</span>
          </div>

          <div class="data-item" style="min-width: 120px;">
            <span class="label">价值偏离诊断</span>
            <span class="value" style="font-size: 14px; color: #f5222d;">{{ report.valueDeviation }}</span>
            <span class="status-text">参考基准:BPS</span>
          </div>
        </div>
      </div>

      <div class="card-section highlight-section">
        <div class="section-title">🎯 操作点位参考</div>
        <div class="trade-row buy">
          <span class="trade-label">建议建仓(低吸)</span>
          <div class="price-box" style="text-align:right;">
            <div class="trade-price">{{ report.buyPoint }}</div>
            <div class="trade-desc">布林下轨支撑</div>
          </div>
        </div>
        <div class="trade-row mid">
          <span class="trade-label">建议减仓(中轨)</span>
          <div class="price-box" style="text-align:right;">
            <div class="trade-price" style="color:#faad14;">{{ report.midPoint }}</div>
            <div class="trade-desc">中轨反压区域</div>
          </div>
        </div>
        <div class="trade-row sell">
          <span class="trade-label">建议离场(高抛)</span>
          <div class="price-box" style="text-align:right;">
            <div class="trade-price">{{ report.sellRange }}</div>
            <div class="trade-desc">上轨压力区 ({{ report.sellPoint }})</div>
          </div>
        </div>
        <div class="trade-row stop">
          <span class="trade-label">止损参考</span>
          <span class="trade-price">{{ report.stopLoss }} 元</span>
          <span class="trade-desc">破位 1.5倍 ATR</span>
        </div>
        <div class="trade-row highlight">
          <span class="trade-label">建议仓位</span>
          <span class="trade-price" style="color:#722ed1">{{ report.positionSuggestion }}</span>
          <span class="trade-desc">基于ATR风险模型</span>
        </div>
        <div v-if="report.trendSignal" class="alert-box">
          ⚠️ {{ report.trendSignal }}
        </div>
      </div>
    </div>

    <div v-if="logs.length > 0" class="log-container">
      <div v-for="(log, index) in logs" :key="index" class="log-item">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { format, subDays, parseISO } from 'date-fns';

const loading = ref(false);
const logs = ref([]);
const report = ref(null); // 存储策略分析结果
const inputStockCode = ref('002436'); // 默认代码
const inputStockName = ref('兴森科技'); // 默认名称

const addLog = (msg) => {
  console.log(msg);
  logs.value.push(msg);
};

const getScoreClass = (score) => {
  if (score >= 80) return 'tag-success';
  if (score >= 60) return 'tag-warning';
  return 'tag-danger';
};

/**
 * 簡易回測引擎：验证布林带震荡策略在历史上的有效性
 * 策略逻辑：跌破下轨买入，触碰上轨或持有10天卖出
 */
function runBacktest(data) {
  let balance = 100000;
  let position = 0;
  let cost = 0;
  let tradeCount = 0;
  let winCount = 0;
  //const log = [];

  // 从第20天开始回测（需要计算指标）
  for (let i = 20; i < data.length - 1; i++) {
    // 动态计算当时的布林带
    const sliceData = data.slice(0, i + 1);
    const boll = calculateBollingerBand(sliceData, 20, 2);
    const today = data[i];
    //const nextDay = data[i+1]; // 用次日开盘价结算更真实，这里简化用次日收盘或当日收盘

    // 买入逻辑：最低价触碰下轨，且空仓
    if (position === 0 && today.low <= boll.lower) {
      position = Math.floor(balance / today.close);
      cost = today.close;
      balance -= position * cost;
      // console.log(`Buy at ${today.date}: ${cost}`);
    }
    // 卖出逻辑：最高价触碰上轨，或跌破需止损(简单模拟)
    else if (position > 0) {
      if (today.high >= boll.upper || today.close < cost * 0.95) {
        const sellPrice = today.high >= boll.upper ? boll.upper : today.close;
        const profit = (sellPrice - cost) * position;
        balance += position * sellPrice;
        
        tradeCount++;
        if (profit > 0) winCount++;
        position = 0;
        // console.log(`Sell at ${today.date}: ${sellPrice}, Profit: ${profit}`);
      }
    }
  }

  // 强平仓位
  if (position > 0) {
    const lastPrice = data[data.length - 1].close;
    balance += position * lastPrice;
  }

  const totalReturn = ((balance - 100000) / 100000 * 100).toFixed(2);
  const winRate = tradeCount > 0 ? ((winCount / tradeCount) * 100).toFixed(0) : 0;

  return { tradeCount, winRate, totalReturn };
}

const BASE_CONFIG = {
  endDate: new Date(), 
  historyDays: 120, // 增加天数以获取更稳定的长期均线
  bollWindow: 20, 
  bollStdMulti: 2, 
  atrWindow: 14, 
};

/**
 * 1. 获取A股历史日线数据
 */
async function getStockHistoryData(stockCode, days) {
  try {
    const secidPrefix = stockCode.startsWith('6') ? '1.' : '0.';
    const secid = `${secidPrefix}${stockCode}`;
    const startDate = format(subDays(BASE_CONFIG.endDate, days), 'yyyyMMdd');
    const endDate = format(BASE_CONFIG.endDate, 'yyyyMMdd');

    const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
      params: {
        secid: secid,
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        klt: '101', 
        fqt: '1', 
        beg: startDate,
        end: endDate,
      },
    });

    const { data } = response.data;
    const klines = data ? (data.klines || data.kline) : null;

    if (!klines || klines.length === 0) {
      throw new Error('获取行情数据为空');
    }

    return klines.map(item => {
      // f51:日期, f52:开, f53:收, f54:高, f55:低, f56:量, f57:额, f58:振幅, f59:涨幅, f60:涨额, f61:换手
      const [dateStr, open, close, high, low, , , amplitude, , , turnover] = item.split(',');
      return {
        date: parseISO(dateStr),
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        amplitude: parseFloat(amplitude), // 振幅%
        turnover: parseFloat(turnover)    // 换手率%
      };
    }).sort((a, b) => a.date - b.date);
  } catch (error) {
    addLog(`数据获取失败：${error.message}`);
    return [];
  }
}

/**
 * 获取股票实时估值数据 (调用东方财富详情接口)
 * 该接口包含了 PE(TTM), PB
 */
async function getStockValuation(stockCode) {
  try {
    const secidPrefix = stockCode.startsWith('6') ? '1.' : '0.';
    const secid = `${secidPrefix}${stockCode}`;
    
    // 东方财富个股详情 API
    // 增加备用字段: f162(PE-TTM), f167(PB), f116(总市值), f117(流通市值), f55(EPS-TTM), f92(BPS)
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
      params: {
        secid: secid,
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fields: 'f58,f162,f167,f9,f23,f116,f117,f55,f92', 
        invt: '2',
        fltt: '2'
      },
    });

    const data = response.data.data;
    if (!data) {
      console.warn("Valuation data response is empty");
      return null;
    }

    // 辅助解析：接口返回的是放大100倍的数值，且可能为 "-"
    const parseValue = (val) => {
      if (val === '-' || val === null || val === undefined) return NaN;
      return parseFloat(val) / 100;
    };

    // 市值解析 (f116/f117 为实际数值，单位元，需转为亿)
    const parseCap = (val) => {
      if (val === '-' || val === null || val === undefined) return '-';
      return (parseFloat(val) / 100000000).toFixed(2) + '亿';
    };

    // 直接解析 (不除以100，用于EPS/BPS等本身就是小数的字段)
    const parseRaw = (val) => {
      if (val === '-' || val === null || val === undefined) return NaN;
      return parseFloat(val);
    };

    // 优先取 f162 (PE-TTM)，其次取 f9 (PE-Dynamic)
    let pe = parseValue(data.f162);
    if (isNaN(pe)) pe = parseValue(data.f9);

    // 优先取 f167 (PB)，其次取 f23
    let pb = parseValue(data.f167);
    if (isNaN(pb)) pb = parseValue(data.f23);

    // 处理 EPS 和 BPS
    let eps = parseRaw(data.f55);
    let bps = parseRaw(data.f92);

    return {
      peTTM: isNaN(pe) ? '-' : pe.toFixed(2),
      pb: isNaN(pb) ? '-' : pb.toFixed(2),
      eps: isNaN(eps) ? '-' : eps.toFixed(3), // EPS保留3位更精确
      bps: isNaN(bps) ? '-' : bps.toFixed(2),
      totalCap: parseCap(data.f116),
      circCap: parseCap(data.f117),
    };
  } catch (err) {
    console.error('估值数据获取失败', err);
    return null;
  }
}

/**
 * 策略生成核心逻辑
 */
function generateStrategy(data, boll, atr, backtest, valuation, volCone) {
  if (!data || data.length < 14) return null;

  const latest = data[data.length - 1];
  const lastDays = data.slice(-14);
  
  // 1. 计算活跃度指标 (改为14日平均)
  const avgAmp = (lastDays.reduce((sum, item) => sum + item.amplitude, 0) / 14).toFixed(2);
  const avgTurnover = (lastDays.reduce((sum, item) => sum + item.turnover, 0) / 14).toFixed(2);

  // 2. 评分逻辑
  let score = 0;
  let statusText = "";
  let recommendation = "";
  
  // 0. 安全边际 (新增)
  let safetyStars = "";
  let valueDeviation = "暂无数据"; // 价值偏离诊断

  if (valuation && valuation.peTTM !== '-') {
    const pe = parseFloat(valuation.peTTM);
    const bps = parseFloat(valuation.bps);
    const currentPrice = latest.close;

    // 粗略估值分位逻辑
    if (pe < 20) { 
      safetyStars = "⭐⭐⭐"; 
      score += 20; 
    } else if (pe < 50) {
      safetyStars = "⭐⭐"; 
    } else {
      safetyStars = "⭐";
      score -= 10;
    }

    // 计算价值偏离度 (股价 vs 每股净资产)
    if (!isNaN(bps) && bps > 0) {
      const ratio = currentPrice / bps; // 市净率
      const premium = ((currentPrice - bps) / bps * 100).toFixed(0); // 溢价率%
      
      if (ratio > 10) {
        valueDeviation = `⚠️ 严重高估 (股价超净资产 ${ratio.toFixed(1)} 倍)`;
        score -= 20;
        statusText = "高位泡沫 " + statusText;
      } else if (ratio > 4) {
        valueDeviation = `⚠️ 溢价偏高 (溢价 ${premium}%)`;
        score -= 5;
      } else if (ratio < 1) {
        valueDeviation = `✅ 破净潜力 (折价 ${Math.abs(premium)}%)`;
        score += 15;
      } else {
        valueDeviation = `⚖️ 估值合理 (溢价 ${premium}%)`;
      }
    }
  }

  // 振幅判断
  if (avgAmp > 8) { score += 40; statusText += "剧烈波动 "; }
  else if (avgAmp > 3.5) { score += 30; statusText += "活跃波动 "; }
  else { score += 10; statusText += "低波动(僵尸) "; }

  // 换手判断
  if (avgTurnover > 15) { score += 10; statusText += "(高换手风险)"; } // 过热减分
  else if (avgTurnover > 3) { score += 40; statusText += "(流动性佳)"; }
  else { score += 10; statusText += "(流动性枯竭)"; }

  // 回测修正 (新增: 如果该股历史胜率低，扣分)
  if (backtest.winRate < 40) {
    score -= 20;
    statusText += "| 股性难做"; 
  } else if (backtest.winRate > 60) {
    score += 20;
    statusText += "| 股性契合";
  }

  // 趋势判断 (当前价 vs 中轨)
  const isBullish = latest.close > boll.mid;
  const trend = isBullish ? "多头区" : "空头区";
  statusText = `${trend} | ${statusText}`;

  // 4. 趋势过滤 (MACD) - 防止接飞刀
  const macdData = calculateMACD(data);
  const currentMacd = macdData[macdData.length - 1];
  let trendSignal = "";
  
  if (currentMacd.dif > 0 && currentMacd.dea > 0) {
    statusText += " | 趋势向上";
    score += 10;
  } else if (currentMacd.dif < 0 && currentMacd.bar < 0) {
    statusText += " | 趋势向下(慎入)";
    score -= 20; // 趋势向下时，布林下轨支撑可能失效
    trendSignal = "下跌趋势中，如抄底请轻仓";
  }

  // 5. 资金管理 (仓位建议 - 基于ATR风控)
  // 假设总资金 10万，单笔交易愿意承担 2% 的亏损
  const totalCapital = 100000;
  const riskPerTrade = totalCapital * 0.02; // 2000元
  const riskPerShare = atr * 1.5; // 每股止损空间 (1.5倍ATR)
  // 建议股数 = 总风险 / 每股风险
  const suggestShares = Math.floor(riskPerTrade / riskPerShare / 100) * 100; // 取整100股
  const positionRatio = ((suggestShares * latest.close) / totalCapital * 100).toFixed(0);

  // 最终建议
  if (score >= 60 && avgAmp > 2) {
    recommendation = "适合波动操作";
  } else {
    recommendation = "观望/不适合";
    if (backtest.winRate < 40) recommendation += "(胜率低)";
    if (avgAmp <= 2) recommendation += "(没波动)";
    if (currentMacd.dif < 0 && currentMacd.bar < 0) recommendation += "(趋势差)";
  }

  // 波动率锥特判: 死鱼期信号 (覆盖上述建议)
  if (volCone) {
    const vol10 = volCone['10日_年化波动率'];
    const vol60 = volCone['60日_年化波动率'];
    if (vol10 < vol60 * 0.7) {
      recommendation = "死鱼期(即将变盘)";
      statusText += " | 波动极低";
    }
  }

  // 计算交易区间 (基于ATR动态调整)
 // const rangeBuffer = atr * BASE_CONFIG.tradeRangeAtrK; // 注意：BASE_CONFIG.tradeRangeAtrK 可能未定义，此处直接用常数或确保定义
  // 修正：直接使用 0.4 作为系数，或者在 BASE_CONFIG 中添加
  const rangeK = 0.4;
  const buyMin = (boll.lower - atr * rangeK).toFixed(2);
  const buyMax = (boll.lower + atr * rangeK).toFixed(2);
  const midMin = (boll.mid - atr * rangeK).toFixed(2);
  const midMax = (boll.mid + atr * rangeK).toFixed(2);
  const sellMin = (boll.upper - atr * rangeK).toFixed(2);
  const sellMax = (boll.upper + atr * rangeK).toFixed(2);

  return {
    stockName: inputStockName.value || inputStockCode.value,
    score,
    recommendation,
    statusText,
    trendSignal, // 新增趋势提示
    positionSuggestion: `${suggestShares}股 (约${positionRatio}%)`, // 新增仓位建议
    safetyStars, // 安全星级
    valueDeviation, // 价值偏离度
    valuationText: valuation ? `PE: ${valuation.peTTM} | PB: ${valuation.pb}` : '暂无数据',
    companyText: valuation ? `总值: ${valuation.totalCap} | 流通: ${valuation.circCap}` : '暂无数据',
    perShareText: valuation ? `EPS: ${valuation.eps} | BPS: ${valuation.bps}` : '暂无数据', // 新增每股数据文本
    avgAmp,
    avgTurnover,
    buyPoint: boll.lower.toFixed(2), 
    buyRange: `${buyMin} ~ ${buyMax}`, // ATR动态区间
    midPoint: boll.mid.toFixed(2),
    midRange: `${midMin} ~ ${midMax}`, // 中轨区间
    sellPoint: boll.upper.toFixed(2), 
    sellRange: `${sellMin} ~ ${sellMax}`, // ATR动态区间
    stopLoss: (latest.close - 1.5 * atr).toFixed(2), 
  };
}

/**
 * 2. 计算布林带
 */
function calculateBollingerBand(data, window, stdMulti) {
  const closeList = data.map(item => item.close);
  const midList = [];
  const stdList = [];

  for (let i = window - 1; i < closeList.length; i++) {
    const slice = closeList.slice(i - window + 1, i + 1);
    const mid = slice.reduce((sum, val) => sum + val, 0) / window;
    midList.push(mid);
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mid, 2), 0) / window;
    const std = Math.sqrt(variance);
    stdList.push(std);
  }

  const latestMid = midList[midList.length - 1];
  const latestStd = stdList[stdList.length - 1];
  const upper = latestMid + stdMulti * latestStd;
  const lower = latestMid - stdMulti * latestStd;
  const bandwidth = ((upper - lower) / latestMid) * 100;

  return {
    bandwidth: parseFloat(bandwidth.toFixed(1)),
    mid: latestMid,
    upper: upper,
    lower: lower,
  };
}

/**
 * 3. 计算ATR
 * 采用标准 Wilder's Smoothing (RMA) 算法 (与TradingView等主流软件一致)
 * 逻辑说明：
 * 1. TR = Max(|High-Low|, |High-PreClose|, |Low-PreClose|)  => 这是一个完全正确的标准逻辑
 * 2. ATR计算：
 *    - 标准ATR (Wilder版): 使用 RMA 平滑移动平均 (公式: (PrevATR * (n-1) + TR) / n)
 *    - 简单ATR (SMA版): 使用简单算术平均 (您提到的逻辑: sum(TR) / n)
 * 
 * *当前采用标准 RMA 版本，因为对近期波动反应更灵敏，更适合短线策略*/
function calculateATR(data, window) {
  if (data.length <= window) return 0;

  const trList = [];
  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const prev = data[i - 1];
    const tr1 = current.high - current.low;
    const tr2 = Math.abs(current.high - prev.close);
    const tr3 = Math.abs(current.low - prev.close);
    trList.push(Math.max(tr1, tr2, tr3));
  }

  // 1. 第一个ATR用简单平均初始化
  let atr = trList.slice(0, window).reduce((sum, val) => sum + val, 0) / window;

  // 2. 后续使用 Wilder's Smoothing 公式: (PrevATR * (n-1) + CurrentTR) / n
  for (let i = window; i < trList.length; i++) {
    atr = (atr * (window - 1) + trList[i]) / window;
  }

  return parseFloat(atr.toFixed(2));
}

/**
 * 计算 MACD (12, 26, 9)
 */
function calculateMACD(data, short=12, long=26, mid=9) {
  const emaShort = [];
  const emaLong = [];
  const dif = [];
  const dea = [];
  const bar = [];

  for (let i = 0; i < data.length; i++) {
    const close = data[i].close;
    
    // EMA Short
    if (i === 0) emaShort.push(close);
    else emaShort.push((2 * close + (short - 1) * emaShort[i-1]) / (short + 1));
    
    // EMA Long
    if (i === 0) emaLong.push(close);
    else emaLong.push((2 * close + (long - 1) * emaLong[i-1]) / (long + 1));
    
    // DIF
    dif.push(emaShort[i] - emaLong[i]);
    
    // DEA
    if (i === 0) dea.push(dif[i]);
    else dea.push((2 * dif[i] + (mid - 1) * dea[i-1]) / (mid + 1));
    
    // MACD Bar
    bar.push((dif[i] - dea[i]) * 2);
  }

  return data.map((_, i) => ({
    dif: dif[i],
    dea: dea[i],
    bar: bar[i]
  }));
}

/**
 * 4. 计算波动率锥
 */
function calculateVolatilityCone(data) {
  const returnList = [];
  for (let i = 1; i < data.length; i++) {
    const prevClose = data[i - 1].close;
    const currentClose = data[i].close;
    const ret = ((currentClose - prevClose) / prevClose) * 100;
    returnList.push(ret);
  }

  const periods = [10, 20, 60];
  const result = {};

  periods.forEach(period => {
    const volList = [];
    for (let i = period - 1; i < returnList.length; i++) {
      const slice = returnList.slice(i - period + 1, i + 1);
      const mean = slice.reduce((sum, val) => sum + val, 0) / period;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      volList.push(std);
    }
    const latestDailyVol = volList[volList.length - 1];
    const annualVol = latestDailyVol * Math.sqrt(250);
    result[`${period}日_日波动率`] = parseFloat(latestDailyVol.toFixed(1));
    result[`${period}日_年化波动率`] = parseFloat(annualVol.toFixed(1));
  });

  return result;
}

async function startAnalysis() {
  if (!inputStockCode.value || inputStockCode.value.length !== 6) {
    addLog('⚠️ 请正确输入6位股票代码');
    return;
  }
  
  loading.value = true;
  logs.value = [];
  report.value = null;

  try {
    addLog(`===== ${inputStockName.value}(${inputStockCode.value}) 分析启动 =====`);
    
    // 1. 获取增强版数据（含振幅换手）
    const stockData = await getStockHistoryData(inputStockCode.value, BASE_CONFIG.historyDays);
    if (stockData.length === 0) return;

    // 1.1 获取估值数据 (新增)
    const valuationData = await getStockValuation(inputStockCode.value);
    if (valuationData) {
      addLog(`当前估值: PE(TTM)=${valuationData.peTTM}, PB=${valuationData.pb}`);
      addLog(`市值数据: 总市值=${valuationData.totalCap}, 流通值=${valuationData.circCap}`);
      addLog(`每股数据: EPS=${valuationData.eps}, BPS=${valuationData.bps}`);
    } else {
      addLog(`⚠️ 估值数据获取失败，仅进行纯技术面分析`);
    }

    // 2. 计算技术指标
    const bollResult = calculateBollingerBand(stockData, BASE_CONFIG.bollWindow, BASE_CONFIG.bollStdMulti);
    const atrValue = calculateATR(stockData, BASE_CONFIG.atrWindow);

    addLog(`ATR(14): ${atrValue} | 布林宽: ${bollResult.bandwidth}%`);

    // 3. 计算波动率锥 (提前)
    const volConeResult = calculateVolatilityCone(stockData);

    // 4. 生成策略报告
    const backtestResult = runBacktest(stockData); // 运行回测
    report.value = generateStrategy(stockData, bollResult, atrValue, backtestResult, valuationData, volConeResult);
    
    addLog(`✅ 分析完成，请查看上方策略卡片`);

    // 5. 波动率锥详细数据解读
    addLog(`\n━━━ 🔍 深度数据解读 ━━━`);
    
    // 0. 回测结果解读 (新增)
    addLog(`\n【0. 策略有效性回测 (过去${BASE_CONFIG.historyDays}天)】`);
    addLog(`模拟交易: ${backtestResult.tradeCount} 次`);
    addLog(`胜率: ${backtestResult.winRate}% (关键指标)`);
    addLog(`累计收益: ${backtestResult.totalReturn}%`);
    if (backtestResult.winRate < 50) {
      addLog(`⚠️ 警告: 该股历史波动规律性差，慎重操作！`);
    } else {
      addLog(`👍 提示: 该股股性契合布林波动策略。`);
    }

    // 1. 布林带宽解读
    addLog(`\n【1. 趋势强弱 - 布林带 (Bollinger Bands)】`);
    addLog(`带宽: ${bollResult.bandwidth}% (越小越容易变盘，越大波动越剧烈)`);
    addLog(`● 上轨压力: ${bollResult.upper.toFixed(2)} 元 (触碰易回调)`);
    addLog(`● 价值中枢: ${bollResult.mid.toFixed(2)} 元 (20日均线)`);
    addLog(`● 下轨支撑: ${bollResult.lower.toFixed(2)} 元 (触碰易反弹)`);
    
    // 2. ATR解读
    addLog(`\n【2. 真实波幅 - ATR (Average True Range)】`);
    addLog(`ATR(14): ${atrValue} (代表该股日均波动金额)`);
    const atrPercent = ((atrValue / stockData[stockData.length-1].close) * 100).toFixed(2);
    addLog(`波动占比: ${atrPercent}% (若>3% 说明股性非常活跃)`);
    addLog(`止损建议: 即使做错，亏损不要超过 ${atrValue.toFixed(2)} 元/股`);

    // 3. 波动率锥解读
    addLog(`\n【3. 波动率锥 - 历史波动分布】`);
    addLog(`(年化波动率越高，代表该周期内风险机会并存)`);
    
    const vol10 = volConeResult['10日_年化波动率'];
    const vol60 = volConeResult['60日_年化波动率'];
    
    addLog(`● 短期(10日): ${vol10}%`);
    addLog(`● 中期(60日): ${vol60}%`);
    
    if (vol10 > vol60 * 1.5) {
      addLog(`👉 信号: 短期波动率过高(${vol10}%)，情绪过热，谨防回调！`);
    } else if (vol10 < vol60 * 0.7) {
      addLog(`👉 信号: 短期波动率极低，处于死鱼期，可能即将变盘。`);
    } else {
      addLog(`👉 信号: 波动率处于正常区间，跟随趋势操作。`);
    }
    
    addLog(`\n━━━━━━━━━━━━━━━━━━━━━━`);
  } catch (err) {
    addLog(`程序异常: ${err}`);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="less" scoped>
.quant-container {
  padding: 16px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.demo-header {
  margin-bottom: 16px;
  h2 { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0;}
}

.action-area {
  margin-bottom: 20px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  
  .input-group {
    margin-bottom: 16px;
    border: 1px solid #ebedf0;
    border-radius: 4px;
    overflow: hidden;
  }
}

/* 策略卡片样式 */
.strategy-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .stock-name { font-size: 18px; font-weight: bold; }
    .score-tag {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      &.tag-success { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
      &.tag-warning { background: #fffbe6; color: #faad14; border: 1px solid #ffe58f; }
      &.tag-danger { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }
    }
  }

  .section-title {
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 10px;
  }

  .data-grid {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    
    .data-item {
      display: flex;
      flex-direction: column;
      .label { font-size: 12px; color: #999; }
      .value { font-size: 16px; font-weight: 600; color: #333; }
      .status-text { font-size: 12px; color: #666; font-weight: normal;}
    }
  }

  .highlight-section {
    background: #f9f9f9;
    padding: 12px;
    border-radius: 8px;
  }

  .trade-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed #eee;
    
    &:last-child { border-bottom: none; }

    .trade-label { font-size: 13px; color: #666; }
    .trade-price { font-size: 16px; font-weight: bold; font-family: monospace;}
    .trade-desc { font-size: 12px; color: #999; }

    &.buy .trade-price { color: #f5222d; }
    &.sell .trade-price { color: #52c41a; }
    &.stop .trade-price { color: #1890ff; }
  }

  .alert-box {
    margin-top: 10px;
    padding: 8px;
    background: #fffbe6;
    border: 1px solid #ffe58f;
    border-radius: 4px;
    color: #faad14;
    font-size: 12px;
  }
}

.log-container {
  background: #2b2b2b;
  color: #a6e22e;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Consolas', monospace;
  font-size: 16px;
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
  .log-item { margin-bottom: 4px; border-bottom: 1px solid #3e3e3e; padding-bottom: 2px;}
}
</style>
