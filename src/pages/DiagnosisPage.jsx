import React, { useState, useEffect, useCallback } from 'react';
import KLineChart from '../components/KLineChart';
import api from '../api';

// 常用股票代码建议
const stockSuggestions = [
  { code: '600519', name: '贵州茅台' },
  { code: '000001', name: '平安银行' },
  { code: '000002', name: '万科A' },
  { code: '000858', name: '五粮液' },
  { code: '002415', name: '海康威视' },
  { code: '300059', name: '东方财富' },
  { code: '601318', name: '中国平安' },
  { code: '600036', name: '招商银行' },
];

const DiagnosisPage = () => {
  const [searchCode, setSearchCode] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentStock, setCurrentStock] = useState({ 
    code: '', name: '请输入股票代码', price: '--', change: '--'
  });
  const [dimensions, setDimensions] = useState([
    { title: '基本面', icon: '📊', desc: '等待诊断', score: 0 },
    { title: '技术面', icon: '📈', desc: '等待诊断', score: 0 },
    { title: '资金流向', icon: '💰', desc: '等待诊断', score: 0 },
    { title: '市场情绪', icon: '🔥', desc: '等待诊断', score: 0 },
    { title: '宏观政策', icon: '🏛️', desc: '等待诊断', score: 0 },
    { title: '外围影响', icon: '🌍', desc: '等待诊断', score: 0 },
    { title: '风险探测', icon: '⚠️', desc: '等待诊断', score: 0 },
    { title: '综合结论', icon: '🧠', desc: '等待诊断', score: 0 },
  ]);
  const [comprehensiveScore, setComprehensiveScore] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);

  // A股交易时间判断
  const isTradingTime = useCallback(() => {
    const now = new Date();
    const day = now.getDay(); // 0是周日，6是周六
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 周末不交易
    if (day === 0 || day === 6) return false;
    
    // 上午交易时间：9:30-11:30
    if (hour === 9 && minute >= 30) return true;
    if (hour === 10 || hour === 11) return true;
    if (hour === 11 && minute <= 30) return true;
    
    // 下午交易时间：13:00-15:00
    if (hour === 13 || hour === 14) return true;
    if (hour === 15 && minute === 0) return true;
    
    return false;
  }, []);

  // 获取实时行情数据
  const fetchRealtimeData = useCallback(async (symbol) => {
    try {
      const response = await api.get('/api/stock_realtime', { 
        params: { symbol } 
      });
      
      if (response) {
        setCurrentStock({
          code: response.symbol || symbol,
          name: response.name || '未知股票',
          price: response.price || '--',
          change: response.change_percent || response.change || '--'
        });
      }
    } catch (error) {
      console.error('获取实时行情失败:', error);
    }
  }, []);

  // AI分析请求 - handleAnalyze函数
  const handleAnalyze = useCallback(async (symbol) => {
    if (!symbol) return;
    
    setAiLoading(true);
    try {
      const response = await api.get('/api/stock_decision', { 
        params: { symbol } 
      });
      
      if (response && response.ai_8_dimensions) {
        const d = response.ai_8_dimensions;
        
        // 按fundamental到comprehensive的顺序映射8个维度
        const mapped = [
          { ...dimensions[0], score: d.fundamental?.score || 0, desc: d.fundamental?.desc || '财务报表与盈利能力' },
          { ...dimensions[1], score: d.technical?.score || 0, desc: d.technical?.desc || '量价形态与指标共振' },
          { ...dimensions[2], score: d.capital?.score || 0, desc: d.capital?.desc || '主力机构席位跟踪' },
          { ...dimensions[3], score: d.sentiment?.score || 0, desc: d.sentiment?.desc || '热点题材热度分析' },
          { ...dimensions[4], score: d.policy?.score || 0, desc: d.policy?.desc || '行业导向影响评级' },
          { ...dimensions[5], score: d.macro?.score || 0, desc: d.macro?.desc || '全球市场联动对冲' },
          { ...dimensions[6], score: d.risk?.score || 0, desc: d.risk?.desc || '股权质押等隐患预警' },
          { ...dimensions[7], score: d.comprehensive?.score || 0, desc: d.comprehensive?.desc || 'AI全维度最终建议' },
        ];
        
        // 这一步不写，页面永远是 0 分
        setDimensions(mapped);
        
        // 同步更新AI综合评分
        setComprehensiveScore(d.comprehensive?.score || 0);
        
        // 更新当前股票信息
        setCurrentStock(prev => ({
          ...prev,
          code: symbol,
          name: response.name || prev.name,
          price: response.price || prev.price,
          change: response.change_percent || response.change || prev.change
        }));
      }
    } catch (error) {
      console.error('获取AI分析失败:', error);
    } finally {
      setAiLoading(false);
    }
  }, [dimensions]);

  // 过滤搜索建议
  const filteredSuggestions = stockSuggestions.filter(stock => 
    stock.code.includes(searchCode.toUpperCase()) || 
    stock.name.includes(searchCode)
  );

  // 选择建议项
  const selectSuggestion = (stock) => {
    setSearchCode(stock.code);
    setShowSuggestions(false);
    fetchRealtimeData(stock.code);
    setCurrentStock(prev => ({ 
      ...prev, 
      code: stock.code, 
      name: stock.name 
    }));
  };

  // 搜索股票
  const handleSearch = useCallback(() => {
    const code = searchCode.trim();
    if (!code) return;
    
    setShowSuggestions(false);
    // 立即获取实时数据
    fetchRealtimeData(code);
    
    // 设置为当前股票代码
    setCurrentStock(prev => ({ ...prev, code }));
  }, [searchCode, fetchRealtimeData]);

  // 初始化和实时行情轮询
  useEffect(() => {
    // 默认加载600519的实时数据
    fetchRealtimeData('600519');
    
    if (isTradingTime()) {
      // 交易时段每30秒轮询一次
      const interval = setInterval(() => {
        if (currentStock.code) {
          fetchRealtimeData(currentStock.code);
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [fetchRealtimeData, isTradingTime, currentStock.code]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* 1. 一键诊股入口 */}
      <section className="bg-white/70 backdrop-blur-md rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col items-center gap-4">
        <div className="w-full max-w-2xl relative">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <input 
              className="flex-1 bg-transparent px-6 outline-none text-slate-700 font-bold" 
              placeholder="输入股票代码(如600519)或名称..." 
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="bg-[#4e4376] text-white px-8 py-3 rounded-xl font-black shadow-lg active:scale-95 transition-all"
              onClick={handleSearch}
            >GO</button>
          </div>
          
          {/* 搜索建议下拉框 */}
          {showSuggestions && searchCode && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg z-10 max-h-60 overflow-y-auto">
              {filteredSuggestions.map((stock, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                  onClick={() => selectSuggestion(stock)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm text-slate-600">{stock.code}</span>
                    <span className="text-sm text-slate-800 font-medium">{stock.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-3 rounded-xl font-black shadow-lg active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          onClick={() => handleAnalyze(currentStock.code)}
          disabled={!currentStock.code || currentStock.code === '' || aiLoading}
        >
          {aiLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              AI分析中...
            </>
          ) : (
            <>
              🤖 AI分析诊断
            </>
          )}
        </button>
      </section>

      {/* 2. 【找回的部分】K线与盘口数据 */}
      <div className="grid grid-cols-12 gap-6 h-[480px]">
        {/* K线图区域 - 强化边界 */}
        <div className="col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xl font-black text-slate-800">
              {currentStock.name} <span className="text-xs font-mono text-slate-400 ml-2">{currentStock.code}</span>
            </span>
            <div className="flex bg-white p-1 rounded-lg border border-slate-200">
              {['分时', '日K', '周K'].map(t => (
                <button key={t} className={`px-4 py-1 text-xs rounded ${t==='日K'?'bg-[#4e4376] text-white font-bold':'text-slate-400'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 p-4 relative">
             <KLineChart symbol={currentStock.code} />
          </div>
        </div>

        {/* 盘口数据区域 - 强化边界 */}
        <div className="col-span-4 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">当前成交价</p>
           <h3 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter">¥{currentStock.price}</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 mb-1 uppercase font-bold">当日涨跌</p>
                <p className="text-xl font-black text-red-500">{currentStock.change}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 mb-1 uppercase font-bold">成交金额</p>
                <p className="text-xl font-black text-slate-700">42.8亿</p>
              </div>
           </div>
        </div>
      </div>

      {/* 3. 8维卡片矩阵 - 强化边缘(border-slate-200) */}
      <section className="grid grid-cols-4 gap-6">
        {dimensions.map((d, i) => (
          <div key={i} className="group relative aspect-square bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:bg-white hover:-translate-y-2 transition-all duration-500 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">{d.icon}</div>
            <h4 className="font-black text-slate-700 text-lg mb-1">{d.title}</h4>
            <div className="text-3xl font-black text-[#4e4376] mb-2">{d.score}</div>
            <p className="text-[10px] text-slate-400 leading-tight opacity-60 group-hover:opacity-100">{d.desc}</p>
            <div className="w-6 h-1 bg-slate-200 rounded-full mt-4 group-hover:w-12 group-hover:bg-[#4e4376] transition-all"></div>
          </div>
        ))}
      </section>

      {/* 4. 底部决策条 - 全部改为中文 */}
      <section className="bg-gradient-to-r from-[#2b5876] to-[#4e4376] rounded-[2.5rem] p-10 text-white shadow-2xl flex items-center justify-between relative overflow-hidden border border-white/10">
        <div className="flex items-center gap-10 relative z-10">
          <div className="text-center border-r border-white/20 pr-10">
            <p className="text-[10px] font-bold text-blue-300 tracking-widest mb-1">AI 综合评分</p>
            <p className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">
              {comprehensiveScore || '--'}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-black flex items-center gap-3">建议积极买入 <span className="text-blue-300 text-sm font-light">高确定性机会</span></h4>
            <p className="text-blue-100/60 text-xs max-w-xl italic">
              综合多维深度数据，AI 检测到机构主力正在关键支撑位构建底仓，技术面呈现多头排列，建议择机入场。
            </p>
          </div>
        </div>
        <div className="text-4xl font-black text-white/10 absolute right-10 top-1/2 -translate-y-1/2">TRADE</div>
      </section>
    </div>
  );
};

export default DiagnosisPage;