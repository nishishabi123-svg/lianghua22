import React from 'react';

const SideNav = () => {
  const menuItems = [
    { id: 'diag', name: '个股诊断', icon: '🔍' },
    { id: 'strategy', name: '策略选股', icon: '🎯' },
    { id: 'vip', name: 'VIP 会员', icon: '👑' },
    { id: 'settings', name: '系统设置', icon: '⚙️' },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#2b5876] to-[#4e4376] text-white p-6 relative overflow-hidden">
      {/* 增加一个朦胧的装饰圆，打破沉闷 */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
      
      <div className="mb-12 flex flex-col items-center relative z-10">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl">
          <svg viewBox="0 0 100 100" className="w-10 h-10 fill-white opacity-90">
             <path d="M20,45 Q50,15 80,45 Q70,55 50,35 Q30,55 20,45" stroke="white" strokeWidth="2" fill="none" />
             <path d="M15,50 Q10,65 25,85 L75,85 Q90,65 85,50" fill="white" />
          </svg>
        </div>
        <h1 className="text-lg font-black tracking-widest text-blue-50">牛消息智能AI</h1>
        <p className="text-[10px] opacity-60 tracking-[0.3em] mt-1">DEEP ANALYSIS</p>
      </div>

      <nav className="flex-1 space-y-3 relative z-10">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500
              ${item.id === 'diag' 
                ? 'bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg font-bold' 
                : 'hover:bg-white/5 text-blue-100/70'}`}
          >
            <span className="text-xl opacity-80">{item.icon}</span>
            <span className="text-sm tracking-wider">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto relative z-10">
        <div className="bg-black/10 backdrop-blur-md p-4 rounded-2xl border border-white/5 text-[10px] text-blue-100/40 leading-relaxed">
          <p>风险提示：系统结果仅供参考，不构成投资建议。理性投资，合理入市。</p>
          <p className="mt-2 font-mono opacity-60">Feedback: cuba@88.com</p>
        </div>
      </div>
    </div>
  );
};

export default SideNav;