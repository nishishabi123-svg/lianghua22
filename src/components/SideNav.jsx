import React from 'react';

const SideNav = () => {
  const menuItems = [
    { id: 'diag', name: '个股诊断', icon: '🔍' },
    { id: 'strategy', name: '策略选股', icon: '🎯' },
    { id: 'vip', name: 'VIP 会员', icon: '👑' },
    { id: 'settings', name: '系统设置', icon: '⚙️' },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-600 via-blue-500 to-sky-400 text-white p-6 relative">
      {/* Logo 区域 */}
      <div className="mb-12 flex flex-col items-center">
        <div className="w-16 h-16 mb-3 flex items-center justify-center bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 shadow-lg">
          {/* 这里用 SVG 抽象化你的水墨牛图标 */}
          <svg viewBox="0 0 100 100" className="w-12 h-12 fill-white shadow-inner">
            <path d="M20,40 Q50,10 80,40 L70,50 Q50,30 30,50 Z" />
            <circle cx="35" cy="45" r="3" fill="rgba(255,255,255,0.5)" />
            <path d="M15,45 Q10,60 25,80 L75,80 Q90,60 85,45 Q70,55 50,55 Q30,55 15,45" />
          </svg>
        </div>
        <h1 className="text-xl font-black tracking-tighter">牛消息智能 AI</h1>
        <p className="text-[10px] text-blue-100 opacity-80 mt-1 uppercase tracking-widest">深度分析 · 辅助决策</p>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
              ${item.id === 'diag' 
                ? 'bg-white text-blue-600 shadow-xl shadow-blue-700/20 font-bold scale-105' 
                : 'hover:bg-white/10 text-blue-50'}`}
          >
            <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span>
            <span className="text-sm tracking-wide">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* 底部免责声明 */}
      <div className="pt-6 border-t border-white/20">
        <div className="bg-blue-700/30 p-4 rounded-xl backdrop-blur-sm border border-white/10">
          <p className="text-[10px] leading-relaxed text-blue-50/70 italic">
            风险提示：本系统结果仅供参考，不构成投资建议。理性投资，合理入市。
          </p>
          <p className="text-[10px] mt-2 font-mono text-blue-100/90">
            意见反馈：cuba@88.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default SideNav;