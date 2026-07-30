const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add lastGroupMode
code = code.replace(/const \[layoutMode, setLayoutMode\] = useState\('GROUP'\);/,
  "const [layoutMode, setLayoutMode] = useState('GROUP');\n  const [lastGroupMode, setLastGroupMode] = useState('GROUP');");

// 2. Update header with global toggle
code = code.replace(/<header className="app-header">\n        <h1>智慧教室座位分配系統<\/h1>\n      <\/header>/,
  `<header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>智慧教室座位分配系統</h1>
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
      </header>`);

// 3. Update sidebar layout toggle
code = code.replace(/<button \n            className="action-btn outline"\n            onClick=\{\(\) => setLayoutMode\(prev => prev === 'GROUP' \? 'EXAM' : prev === 'EXAM' \? 'STANDARD' : 'GROUP'\)\}\n          >\n            <Settings2 size=\{18\} \/>\n            \{layoutMode === 'GROUP' \? '切換為考試版\(直版\)' : layoutMode === 'EXAM' \? '切換為一般模式' : '切換為分組版\(橫版\)'\}\n          <\/button>/,
  `{layoutMode !== 'STANDARD' && (
            <button 
              className="action-btn outline"
              onClick={() => {
                const nextMode = layoutMode === 'GROUP' ? 'EXAM' : 'GROUP';
                setLayoutMode(nextMode);
                setLastGroupMode(nextMode);
              }}
            >
              <Settings2 size={18} />
              {layoutMode === 'GROUP' ? '切換為直排' : '切換為橫排'}
            </button>
          )}`);

fs.writeFileSync('src/App.jsx', code);
console.log("App.jsx patched successfully!");
