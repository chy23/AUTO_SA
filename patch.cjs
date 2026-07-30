const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add X icon import
code = code.replace(/import \{ Upload, Shuffle, Download, Settings2, Trash2, MapPin \} from 'lucide-react';/,
  "import { Upload, Shuffle, Download, Settings2, Trash2, MapPin, X } from 'lucide-react';\nimport { useMemo } from 'react';");

// 2. State variables and standardMap
code = code.replace(/const \[layoutMode, setLayoutMode\] = useState\('GROUP'\); \/\/ 'GROUP' or 'EXAM'\n  const currentMap = layoutMode === 'GROUP' \? LAYOUT_HORIZONTAL : LAYOUT_VERTICAL;/,
`const [layoutMode, setLayoutMode] = useState('GROUP');
  const [standardRows, setStandardRows] = useState(6);
  const [standardCols, setStandardCols] = useState(5);
  const [hiddenSeatIds, setHiddenSeatIds] = useState([]);

  const standardMap = useMemo(() => {
    const seats = [];
    let currentId = 1;
    const xStart = 10, xEnd = 90, yStart = 15, yEnd = 90;
    const xStep = standardCols > 1 ? (xEnd - xStart) / (standardCols - 1) : 0;
    const yStep = standardRows > 1 ? (yEnd - yStart) / (standardRows - 1) : 0;
    
    for (let r = 0; r < standardRows; r++) {
      for (let c = 0; c < standardCols; c++) {
        if (!hiddenSeatIds.includes(currentId)) {
          seats.push({
            id: currentId,
            groupId: c + 1,
            x: standardCols === 1 ? 50 : xStart + (c * xStep),
            y: standardRows === 1 ? 50 : yStart + (r * yStep),
            shape: 'horizontal'
          });
        }
        currentId++;
      }
    }
    return { seats, labels: [], staticItems: LAYOUT_VERTICAL.staticItems };
  }, [standardRows, standardCols, hiddenSeatIds]);

  const currentMap = layoutMode === 'GROUP' ? LAYOUT_HORIZONTAL :
                     layoutMode === 'EXAM' ? LAYOUT_VERTICAL :
                     standardMap;`);

// 3. Update useEffect for staticItems
code = code.replace(/setStaticItems\(layoutMode === 'GROUP' \? LAYOUT_HORIZONTAL\.staticItems : LAYOUT_VERTICAL\.staticItems\);/,
`setStaticItems(layoutMode === 'GROUP' ? LAYOUT_HORIZONTAL.staticItems : 
                   layoutMode === 'EXAM' ? LAYOUT_VERTICAL.staticItems : 
                   LAYOUT_VERTICAL.staticItems);`);

// 4. Update layout toggle button
code = code.replace(/<button \n            className="action-btn outline"\n            onClick=\{\(\) => setLayoutMode\(prev => prev === 'GROUP' \? 'EXAM' : 'GROUP'\)\}\n          >\n            <Settings2 size=\{18\} \/>\n            \{layoutMode === 'GROUP' \? '切換為考試版\(直版\)' : '切換為分組版\(橫版\)'\}\n          <\/button>/,
`<button 
            className="action-btn outline"
            onClick={() => setLayoutMode(prev => prev === 'GROUP' ? 'EXAM' : prev === 'EXAM' ? 'STANDARD' : 'GROUP')}
          >
            <Settings2 size={18} />
            {layoutMode === 'GROUP' ? '切換為考試版(直版)' : layoutMode === 'EXAM' ? '切換為一般模式' : '切換為分組版(橫版)'}
          </button>
          
          {layoutMode === 'STANDARD' && (
            <div className="standard-mode-settings" style={{ marginTop: '10px', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>一般模式設定</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', color: '#555' }}>行數: 
                  <input type="number" min="1" max="15" value={standardRows} onChange={e => setStandardRows(Number(e.target.value))} style={{ width: '50px', marginLeft: '5px' }}/>
                </label>
                <label style={{ fontSize: '12px', color: '#555' }}>列數: 
                  <input type="number" min="1" max="15" value={standardCols} onChange={e => setStandardCols(Number(e.target.value))} style={{ width: '50px', marginLeft: '5px' }}/>
                </label>
              </div>
              <button className="secondary-btn" onClick={() => setHiddenSeatIds([])} style={{ fontSize: '12px', padding: '4px 8px' }}>重置所有座位</button>
            </div>
          )}`);

// 5. Add Delete button to seats
code = code.replace(/<div className="seat-no">\{seat\.id\}<\/div>/,
`<div className="seat-no">{seat.id}</div>
                  {layoutMode === 'STANDARD' && (
                    <button 
                      className="delete-seat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHiddenSeatIds(prev => [...prev, seat.id]);
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}`);

fs.writeFileSync('src/App.jsx', code);
console.log("App.jsx patched successfully!");
