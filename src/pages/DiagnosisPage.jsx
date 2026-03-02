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
    code: '', name: '请输入股票代码', price: '--', change: '--', is_trading: true
  });
  const [dimensions, setDimensions] = useState([
    { title: '基本面', icon: '📊', desc: '等待诊断', score: 0, expanded: false, fullDesc: '' },
    { title: '技术面', icon: '📈', desc: '等待诊断', score: 0, expanded: false, fullDesc: '' },
    { title: '资金流向', icon: '💰', desc: '等待诊断', score: 0, expanded: false, fullDesc: '' },
    { title: '市场情绪', icon: '🔥', desc: '等待诊断', score: 0, expanded: false, fullDesc: '' },
    { title: '宏观政策', icon: '🏛️', desc: '等待诊断', score: 0, expanded: false, fullDesc: '' },
    { title: '外围影响', icon: '🌍', desc: '等待诊断', score: 0, expanded: false, fullDesc: '' },
    { title: '风险探测', icon: '⚠️', desc: '等待诊断', score: 0, expanded: false, fullDesc: '' },
    { title: '综合结论', icon: '🧠', desc: '等待诊断', score: 0, expanded: false, fullDesc: '' },
  ]);
  const [comprehensiveScore, setComprehensiveScore] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [advice, setAdvice] = useState({ type: 2, target_price: '--', message: '建议观望位：--' });

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

  // AI诊断函数 - fetchAIDiagnosis
  const fetchAIDiagnosis = useCallback(async (symbol) => {
    if (!symbol) return;
    
    // 按下GO时，将isAnalyzing设为true
    setAiLoading(true);
    
    // 流A：即时行情请求
    const realtimePromise = api.get(`/api/stock_realtime?symbol=${symbol}`);
    
    // 流B：AI分析请求
    const aiPromise = api.get(`/api/stock_decision?symbol=${symbol}`);
    
    try {
      // 立即处理流A - 实时行情
      const realtimeResponse = await realtimePromise;
      if (realtimeResponse) {
        setCurrentStock({
          code: realtimeResponse.symbol || symbol,
          name: realtimeResponse.name || '未知股票',
          price: realtimeResponse.price || '--',
          change: realtimeResponse.change_percent || realtimeResponse.change || '--',
          is_trading: realtimeResponse.is_trading !== false
        });
      }
    } catch (error) {
      console.error('获取实时行情失败:', error);
    }
    
    // 启动AI分析流B
    try {
      const aiResponse = await aiPromise;
      
      // 扁平化读取，移除.data嵌套
      if (aiResponse && aiResponse.ai_8_dimensions) {
        const d = aiResponse.ai_8_dimensions;
        
        // 对齐后端key值：fundamental, technical, capital, sentiment, policy, macro, risk, comprehensive
        // 移除所有.data嵌套，直接读取res.ai_8_dimensions.*
        const mapped = [
          { ...dimensions[0], score: Number(d.fundamental?.score || 0), desc: d.fundamental?.desc || '财务报表与盈利能力', fullDesc: d.fundamental?.desc || '财务报表与盈利能力' },
          { ...dimensions[1], score: Number(d.technical?.score || 0), desc: d.technical?.desc || '量价形态与指标共振', fullDesc: d.technical?.desc || '量价形态与指标共振' },
          { ...dimensions[2], score: Number(d.capital?.score || 0), desc: d.capital?.desc || '主力机构席位跟踪', fullDesc: d.capital?.desc || '主力机构席位跟踪' },
          { ...dimensions[3], score: Number(d.sentiment?.score || 0), desc: d.sentiment?.desc || '热点题材热度分析', fullDesc: d.sentiment?.desc || '热点题材热度分析' },
          { ...dimensions[4], score: Number(d.policy?.score || 0), desc: d.policy?.desc || '行业导向影响评级', fullDesc: d.policy?.desc || '行业导向影响评级' },
          { ...dimensions[5], score: Number(d.macro?.score || 0), desc: d.macro?.desc || '全球市场联动对冲', fullDesc: d.macro?.desc || '全球市场联动对冲' },
          { ...dimensions[6], score: Number(d.risk?.score || 0), desc: d.risk?.desc || '股权质押等隐患预警', fullDesc: d.risk?.desc || '股权质押等隐患预警' },
          { ...dimensions[7], score: Number(d.comprehensive?.score || 0), desc: d.comprehensive?.desc || 'AI全维度最终建议', fullDesc: d.comprehensive?.desc || 'AI全维度最终建议' },
        ];
        
        setDimensions(mapped);
        setComprehensiveScore(Number(d.comprehensive?.score || 0));
        
        // 处理决策建议
        const adviceType = aiResponse.advice_type || 2;
        const targetPrice = aiResponse.target_price || '--';
        const adviceMessages = {
          1: `建议建仓位：${targetPrice}`,
          2: `建议观望位：${targetPrice}`,
          3: `建议平仓位：${targetPrice}`
        };
        
        setAdvice({
          type: adviceType,
          target_price: targetPrice,
          message: adviceMessages[adviceType] || adviceMessages[2]
        });
      }
    } catch (error) {
      console.error('获取AI分析失败:', error);
    } finally {
      setAiLoading(false);
    }
  }, [dimensions]);

  // 卡片折叠切换
  const toggleCardExpansion = useCallback((index) => {
    setDimensions(prev => prev.map((dim, i) => 
      i === index ? { ...dim, expanded: !dim.expanded } : dim
    ));
  }, []);

  // 过滤搜索建议
  const filteredSuggestions = stockSuggestions.filter(stock => 
    stock.code.includes(searchCode.toUpperCase()) || 
    stock.name.includes(searchCode)
  );

  // 选择建议项
  const selectSuggestion = (stock) => {
    setSearchCode(stock.code);
    setShowSuggestions(false);
    // 使用AI诊断逻辑
    fetchAIDiagnosis(stock.code);
  };

  // 搜索股票 - 使用双流加载
  const handleSearch = useCallback(() => {
    const code = searchCode.trim();
    if (!code) return;
    
    setShowSuggestions(false);
    // 使用AI诊断逻辑
    fetchAIDiagnosis(code);
  }, [searchCode, fetchAIDiagnosis]);

  // 页面初始化时默认加载600519数据
  useEffect(() => {
    fetchAIDiagnosis('600519');
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* 1. 一键诊股入口 */}
      <section className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="w-full max-w-2xl relative">
          <div className="flex p-1.2 bg-slate-100 rounded-2xl border border-slate-200">
            <input 
              className="flex-1 bg-transparent px-5 outline-none text-slate-700 font-bold" 
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
           <div className="flex items-center gap-3 mb-6">
             <h3 className="text-6xl font-black text-slate-900 tracking-tighter">¥{Number(currentStock.price)?.toFixed(2) || '--'}</h3>
             {!currentStock.is_trading && (
               <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded-full">休市中</span>
             )}
           </div>
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

      {/* 3. 8维卡片矩阵 - 折叠交互 */}
      <section className="grid grid-cols-4 gap-6 relative">
        {aiLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2rem] z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3 mx-auto"></div>
              <p className="text-sm text-slate-600 font-medium">AI正在调取8维度深度数据，请稍候...</p>
            </div>
          </div>
        )}
        {dimensions.map((d, i) => (
          <div 
            key={i} 
            onClick={() => toggleCardExpansion(i)}
            className={`group relative aspect-square bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:bg-white hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer ${aiLoading ? 'opacity-30' : ''} ${
              d.expanded ? 'row-span-2 col-span-2' : ''
            }`}
          >
            {!d.expanded ? (
              // 展开状态：显示详细分析文本
              <div className="w-full h-full flex flex-col justify-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform drop-shadow-md">{d.icon}</div>
                <h4 className="font-black text-slate-700 text-lg mb-2">{d.title}</h4>
                <div className="text-2xl font-black text-[#4e4376] mb-3">{Number(d.score || 0).toFixed(1)}</div>
                <p className="text-sm text-slate-600 leading-relaxed bg-white/50 p-4 rounded-xl">
                  {d.fullDesc || d.desc}
                </p>
              </div>
            ) : (
              // 收缩状态：只显示核心信息
              <>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">{d.icon}</div>
                <h4 className="font-black text-slate-700 text-lg mb-1">{d.title}</h4>
                <div className="text-3xl font-black text-[#4e4376] mb-2">{Number(d.score || 0).toFixed(1)}</div>
                <p className="text-[10px] text-slate-400 leading-tight opacity-60 group-hover:opacity-100 line-clamp-1">{d.desc}</p>
                <div className="w-6 h-1 bg-slate-200 rounded-full mt-4 group-hover:w-12 group-hover:bg-[#4e4376] transition-all"></div>
              </>
            )}
          </div>
        ))}
      </section>

      {/* 4. 底部决策条 - advice_type逻辑映射 */}
      <section className={`rounded-[2.5rem] p-10 text-white shadow-2xl flex items-center justify-between relative overflow-hidden border border-white/10 ${
        advice.type === 1 ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
        advice.type === 2 ? 'bg-gradient-to-r from-gray-600 to-gray-500' :
        advice.type === 3 ? 'bg-gradient-to-r from-red-600 to-red-500' :
        'bg-gradient-to-r from-gray-600 to-gray-500'
      }`}>
        <div className="flex items-center gap-10 relative z-10">
          <div className="text-center border-r border-white/20 pr-10">
            <p className="text-[10px] font-bold opacity-80 tracking-widest mb-1">AI 综合评分</p>
            <p className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-opacity-80">
              {Number(comprehensiveScore || 0).toFixed(1) || '--'}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-black flex items-center gap-3">
              {advice.message} 
              <span className="text-sm font-light opacity-80">
                {advice.type === 1 ? '高确定性机会' :
                 advice.type === 2 ? '耐心等待时机' :
                 advice.type === 3 ? '风险控制优先' :
                 '市场观望'}
              </span>
            </h4>
            <p className="opacity-80 text-xs max-w-xl italic">
              综合多维深度数据，AI 检测到{advice.type === 1 ? '机构主力正在关键支撑位构建底仓，技术面呈现多头排列，建议择机入场。' :
                                            advice.type === 2 ? '市场处于震荡调整阶段，建议耐心等待更好的入场时机。' :
                                            advice.type === 3 ? '风险因素累积，建议及时止盈止损，控制风险。' :
                                            '市场暂无明显趋势，建议谨慎观望。'}
            </p>
          </div>
        </div>
        <div className="text-4xl font-black opacity-10 absolute right-10 top-1/2 -translate-y-1/2">TRADE</div>
      </section>
    </div>
  );
};

export default DiagnosisPage;