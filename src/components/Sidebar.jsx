import React from 'react';
import { Upload, Shuffle, Download, Settings2, Trash2, Image as ImageIcon, Undo } from 'lucide-react';
import { parseFile } from '../utils/fileUtils';
import { exportToPPTX, exportToJPEG } from '../utils/exportUtils';

export default function Sidebar({
  seating,
  classroomRef,
  onOpenRuleBuilder
}) {
  const {
    students, setStudents,
    assignments, setAssignments,
    rules, setRules,
    layoutMode, setLayoutMode,
    lastGroupMode, setLastGroupMode,
    standardRows, setStandardRows,
    standardCols, setStandardCols,
    hiddenSeatIds, setHiddenSeatIds,
    staticVisibility, setStaticVisibility,
    currentMap, staticItems,
    isAssigning, handleAssign,
    undo, canUndo
  } = seating;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const studentObjs = await parseFile(file);
      setStudents(studentObjs);
      setAssignments(currentMap.seats.map((seat, index) => ({
        seatId: seat.id,
        student: studentObjs[index] || null,
        isLocked: false
      })));
    } catch (err) {
      alert("讀取檔案失敗：" + err.message);
    }
  };

  const removeRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <aside className="sidebar">
      {/* 1. Student Upload */}
      <section className="panel upload-panel">
        <h2>1. 學生名單</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label className="upload-btn" style={{ flex: 1 }}>
            <Upload size={18} /> 上傳名單
            <input id="file-upload" type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} hidden />
          </label>
          <button 
            className="secondary-btn" 
            onClick={() => {
              if (window.confirm("確定要清除所有學生名單嗎？")) {
                setStudents([]);
                setAssignments(currentMap.seats.map(seat => ({ seatId: seat.id, student: null, isLocked: false })));
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.value = '';
              }
            }}
            style={{ padding: '0 1rem' }}
            title="清除所有學生"
          >
            <Trash2 size={18} /> 清除
          </button>
        </div>
        <div className="student-stats" style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#ccc' }}>
          已載入 {students.length} 名學生
        </div>
      </section>

      {/* Static Item Toggles */}
      <section className="panel settings-panel">
        <h2>環境設施顯示</h2>
        <div className="visibility-toggles" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {Object.keys(staticVisibility).map(key => {
            const itemDef = staticItems.find(i => i.id === key) || { name: key };
            return (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={staticVisibility[key]}
                  onChange={(e) => setStaticVisibility(prev => ({...prev, [key]: e.target.checked}))}
                /> 
                {itemDef?.name}
              </label>
            )
          })}
        </div>
      </section>

      {/* Rules */}
      <section className="panel rules-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>2. 排座條件</h2>
          <button className="secondary-btn" onClick={onOpenRuleBuilder} style={{ padding: '4px 8px', fontSize: '12px' }}>
            + 新增設定
          </button>
        </div>
        <ul className="rule-list">
          {rules.length === 0 && <li style={{ color: '#888', textAlign: 'center', border: 'none' }}>目前沒有條件</li>}
          {rules.map(r => (
            <li key={r.id}>
              <span>{r.students ? r.students.join(', ') : ''} 
                {r.type === 'NOT_SAME_GROUP' && " 不能同組"}
                {r.type === 'NOT_ADJACENT' && " 不能相鄰"}
                {r.type === 'SAME_GROUP' && " 必須同組"}
                {r.type === 'ADJACENT' && " 必須相鄰"}
              </span>
              <button className="icon-btn danger" onClick={() => removeRule(r.id)}><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      </section>

      {/* Controls & Export */}
      <section className="panel actions">
        {layoutMode !== 'STANDARD' && (
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
        )}
        
        {layoutMode === 'STANDARD' && (
          <div className="standard-mode-settings" style={{ marginTop: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-color)' }}>一般模式設定</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>行數: 
                <input type="number" min="1" max="15" value={standardRows} onChange={e => setStandardRows(Number(e.target.value))} style={{ width: '50px', marginLeft: '5px' }}/>
              </label>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>列數: 
                <input type="number" min="1" max="15" value={standardCols} onChange={e => setStandardCols(Number(e.target.value))} style={{ width: '50px', marginLeft: '5px' }}/>
              </label>
            </div>
            <button className="secondary-btn" onClick={() => setHiddenSeatIds([])} style={{ fontSize: '12px', padding: '4px 8px' }}>重置所有座位</button>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="action-btn primary" onClick={handleAssign} disabled={isAssigning || students.length === 0} style={{ flex: 3 }}>
             <Shuffle size={16} /> 自動排座位
          </button>
          <button className="secondary-btn" onClick={undo} disabled={!canUndo} style={{ flex: 1, padding: 0 }} title="復原上一步 (手動移動或洗牌)">
             <Undo size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
           <button className="secondary-btn" onClick={() => exportToPPTX(assignments, currentMap, staticItems, staticVisibility)} style={{ flex: 1, padding: '10px' }}>
             <Download size={16} /> 匯出 PPTX
           </button>
           <div style={{ display: 'flex', gap: '10px' }}>
             <button className="secondary-btn" onClick={() => exportToJPEG(classroomRef.current, false)} style={{ flex: 1, padding: '10px' }}>
               <ImageIcon size={16} /> 黑底圖檔
             </button>
             <button className="secondary-btn" onClick={() => exportToJPEG(classroomRef.current, true)} style={{ flex: 1, padding: '10px', background: '#fff', color: '#333', border: '1px solid #ccc' }}>
               <ImageIcon size={16} /> 白底圖檔
             </button>
           </div>
        </div>
      </section>
    </aside>
  );
}
