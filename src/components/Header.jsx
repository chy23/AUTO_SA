import React from 'react';

export default function Header({ layoutMode, lastGroupMode, setLayoutMode }) {
  // Toggle body theme
  const toggleTheme = () => {
    const isDark = document.body.classList.contains('light-theme');
    if (isDark) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  };

  return (
    <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1>智慧教室座位分配系統</h1>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button className="secondary-btn" onClick={toggleTheme} style={{ borderRadius: '50%', padding: '8px', width: '36px', height: '36px' }}>
          💡
        </button>
        <div className="mode-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px', gap: '4px' }}>
          <button 
            onClick={() => setLayoutMode(lastGroupMode)}
            style={{ padding: '6px 16px', borderRadius: '16px', border: 'none', background: layoutMode !== 'STANDARD' ? '#4CAF50' : 'transparent', color: 'white', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            小組模式
          </button>
          <button 
            onClick={() => setLayoutMode('STANDARD')}
            style={{ padding: '6px 16px', borderRadius: '16px', border: 'none', background: layoutMode === 'STANDARD' ? '#4CAF50' : 'transparent', color: 'white', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            一般模式
          </button>
        </div>
      </div>
    </header>
  );
}
