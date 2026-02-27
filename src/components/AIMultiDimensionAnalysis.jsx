import React, { useState } from 'react';

// 模拟数据 (实际应从 props 传入)
const AI_DATA = [
  { id: 'fundamentals', icon: '📊', title: '基本面', sentiment: 'positive', confidence: 92, summary: '营收净利双增 30%，估值处于历史低位，安全边际极高。', details: 'EPS 达 1.2 元 (同比 +30%)，动态 PE 仅 15 倍。公司经营性现金流充沛，负债率降至 20%，具备极强的抗风险能力和分红潜力。' },
  { id: 'technicals', icon: '📈', title: '技术面', sentiment: 'positive', confidence: 85, summary: '放量突破 20 日均线，MACD 金叉发散，多头排列。', details: '股价站稳生命线，成交量温和放大。MACD 零轴上方金叉，红柱变长。布林带开口向上，短期目标看至前高。' },
  { id: 'capital', icon: '💰', title: '资金流向', sentiment: 'neutral', confidence: 60, summary: '主力小幅净流入，北向资金连续 3 日增持。', details: '今日主力净流入 520 万元。虽然大单意愿不强，但北向资金已连续 3 日净买入，显示长线资金看好。' },
  { id: 'sentiment', icon: '📰', title: '舆情监控', sentiment: 'positive', confidence: 88, summary: '媒体普遍看好，无重大利空，热度上升 40%。', details: '近 7 日正面新闻占比 80%，聚焦新产品发布。社交媒体讨论热度环比上升，散户情绪高涨但未狂热。' },
  { id: 'policy', icon: '⚖️', title: '政策环境', sentiment: 'positive', confidence: 95, summary: '“十四五”重点扶持产业，多地出台补贴细则。', details: '所属行业被列入国家战略性新兴产业目录。监管环境宽松，鼓励并购重组，利好龙头外延式扩张。' },
  { id: 'global', icon: '🌍', title: '外围影响', sentiment: 'negative', confidence: 75, summary: '美股科技股回调，加息预期带来估值压力。', details: '隔夜纳斯达克下跌 1.5%，A50 期货微跌。美联储加息预期升温，可能抑制全球流动性，对成长股构成短期压制。' },
  { id: 'conclusion', icon: '🎯', title: '综合结论', sentiment: 'positive', confidence: 88, summary: '七维共振，强烈建议买入，目标价 12.5 元。', details: '基于基本面强劲、技术面突破、政策面利好等多重因素，AI 模型给出 88 分高分，建议重仓介入。' },
];

const AIMultiDimensionAnalysis = () => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'positive') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (sentiment === 'negative') return 'text-rose-600 bg-rose-50 border-rose-200';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
          七维深度诊断
        </h3>
        <span className="text-xs text-sky-600 bg-sky-50 px-3 py-1 rounded-full font-medium">点击卡片查看详情</span>
      </div>

      {/* 网格布局：大屏 3 列，中屏 2 列，小屏 1 列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {AI_DATA.map((item) => (
          <div 
            key={item.id}
            onClick={() => toggleExpand(item.id)}
            className={`
              relative bg-white rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col
              ${expandedId === item.id 
                ? 'col-span-1 md:col-span-2 lg:col-span-3 border-sky-400 shadow-xl ring-2 ring-sky-100 scale-[1.01]' 
                : 'border-sky-100 shadow-md hover:shadow-xl hover:border-sky-300 hover:-translate-y-1'}
            `}
          >
            {/* 卡片封面 */}
            <div className="p-6 flex-1 flex flex-col items-center text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 text-3xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h4>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${item.sentiment === 'positive' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : item.sentiment === 'negative' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-gray-400'}`}></span>
                <span className={`text-xs font-bold uppercase tracking-wide ${item.sentiment === 'positive' ? 'text-emerald-600' : item.sentiment === 'negative' ? 'text-rose-600' : 'text-gray-500'}`}>
                  {item.sentiment === 'positive' ? '利好' : item.sentiment === 'negative' ? '利空' : '中性'}
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                "{item.summary}"
              </p>
            </div>

            {/* 底部装饰条 */}
            <div className="h-1.5 w-full bg-gray-100 transition-colors">
              <div className={`h-full mx-auto rounded-full transition-all duration-500 ${expandedId === item.id ? 'w-full bg-sky-500' : 'w-1/3 bg-sky-300'}`}></div>
            </div>

            {/* 展开详情 */}
            {expandedId === item.id && (
              <div className="bg-sky-50/50 border-t border-sky-100 p-6 animate-fadeIn">
                <div className="flex items-start gap-3 max-w-4xl mx-auto">
                  <span className="text-2xl">💡</span>
                  <div className="flex-1">
                    <h5 className="font-bold text-sky-800 mb-1">深度解析</h5>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{item.details}</p>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-sky-100 shadow-sm">
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">AI 置信度</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full" style={{ width: `${item.confidence}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-sky-600 w-8 text-right">{item.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIMultiDimensionAnalysis;