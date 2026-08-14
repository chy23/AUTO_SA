import React from 'react';
import { Upload, Shuffle, Download, Settings2, Trash2, Image as ImageIcon, Undo, Eraser } from 'lucide-react';
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
    undo, canUndo,
    resetCustomMap,
    activeGroupBrush, setActiveGroupBrush,
    saveCustomStaticItems,
    snapshots,
    saveSnapshot,
    loadSnapshot,
    deleteSnapshot
  } = seating;

  const [customSeatCount, setCustomSeatCount] = React.useState(1);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const studentObjs = await parseFile(file);
      setStudents(studentObjs);
      setAssignments(currentMap.seats.map((seat) => ({
        seatId: seat.id,
        student: null,
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
          <button className="secondary-btn" onClick={() => onOpenRuleBuilder(null)} style={{ padding: '4px 8px', fontSize: '12px' }}>
            + 新增設定
          </button>
        </div>
        <ul className="rule-list">
          {rules.length === 0 && <li style={{ color: '#888', textAlign: 'center', border: 'none' }}>目前沒有條件</li>}
          {rules.map(r => (
            <li 
              key={r.id} 
              onClick={() => onOpenRuleBuilder(r.id)}
              style={{ cursor: 'pointer', transition: 'background 0.2s' }}
              title="點擊以編輯條件"
            >
              <span>{r.students ? r.students.join(', ') : ''} 
                {r.type === 'NOT_SAME_GROUP' && " 不能同組"}
                {r.type === 'NOT_ADJACENT' && " 不能相鄰"}
                {r.type === 'SAME_GROUP' && " 必須同組"}
                {r.type === 'ADJACENT' && " 必須相鄰"}
              </span>
              <button 
                className="icon-btn danger" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeRule(r.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Controls & Export */}
      <section className="panel actions">
        {(layoutMode === 'GROUP' || layoutMode === 'EXAM') && (
          <button 
            className="action-btn outline"
            onClick={() => {
              const nextMode = layoutMode === 'GROUP' ? 'EXAM' : 'GROUP';
              setLayoutMode(nextMode);
              setLastGroupMode(nextMode);
            }}
          >
            <Settings2 size={18} />
            {layoutMode === 'GROUP' ? '切換為直排 (個人考試)' : '切換為橫排 (分組上課)'}
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
          </div>
        )}
        
        {layoutMode !== 'CUSTOM' && hiddenSeatIds.length > 0 && (
          <button className="secondary-btn" onClick={() => setHiddenSeatIds([])} style={{ fontSize: '12px', padding: '4px 8px', marginTop: '5px' }}>
            還原被隱藏的座位
          </button>
        )}
        
        {layoutMode === 'CUSTOM' && (
          <div className="custom-mode-settings" style={{ marginTop: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-color)' }}>自定義版面</h3>
            {!seating.isEditingLayout && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}>
                <strong style={{ color: 'var(--text-color)' }}>📌 簡單 5 步驟：</strong>
                <ol style={{ margin: '5px 0 0 15px', padding: 0 }}>
                  <li>點擊下方「<strong>編輯座位配置</strong>」開始排版</li>
                  <li>新增座位並<strong>直接拖曳</strong>至黑板區的位置</li>
                  <li>使用<strong>號碼筆刷</strong>幫座位上色分組</li>
                  <li>完成後點擊「<strong>儲存並退出編輯</strong>」</li>
                  <li>最後點擊最下方「<strong>自動排座位</strong>」完成入座</li>
                </ol>
              </div>
            )}
            <button 
              className={`action-btn ${seating.isEditingLayout ? 'primary' : 'outline'}`}
              onClick={() => {
                if (seating.isEditingLayout) saveCustomStaticItems();
                seating.setIsEditingLayout(!seating.isEditingLayout);
              }}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              <Settings2 size={16} style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />
              {seating.isEditingLayout ? '儲存並退出編輯' : '編輯座位配置'}
            </button>
            {seating.isEditingLayout && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <p>• 直接拖曳可移動座位與設施位置</p>
                <p>• 點擊座位可編輯其群組與方向</p>
                <div style={{ display: 'flex', gap: '5px', marginTop: '10px', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-color)', whiteSpace: 'nowrap' }}>座位總數:</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={customSeatCount} 
                    onChange={(e) => setCustomSeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: '50px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', textAlign: 'center' }}
                  />
                  <button 
                    className="secondary-btn" 
                    onClick={() => {
                      if (window.confirm(`確定要重新產生 ${customSeatCount} 個座位嗎？\n\n警告：這會清除您目前在版面上的所有排列與小組設定！`)) {
                        seating.resetCustomMap(customSeatCount);
                      }
                    }} 
                    style={{ flex: 1, padding: '6px', color: '#ef4444' }}
                  >
                    重新產生
                  </button>
                </div>
                <button 
                  className="secondary-btn" 
                  onClick={() => {
                    if (window.confirm("確定要清除所有座位的組號嗎？")) {
                      seating.clearAllCustomGroups();
                    }
                  }} 
                  style={{ width: '100%', padding: '6px', marginTop: '5px' }}
                >
                  僅清除所有組號
                </button>
                
                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '13px', margin: 0, color: 'var(--text-color)' }}>分配小組號碼牌</h4>
                    {activeGroupBrush !== null && (
                      <button 
                        onClick={() => setActiveGroupBrush(null)}
                        style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: '11px', cursor: 'pointer', padding: '2px 4px' }}
                      >
                        取消筆刷
                      </button>
                    )}
                  </div>
                  
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                    • 可<strong>直接拖曳</strong>號碼牌至座位<br/>
                    • 或<strong>點選號碼</strong>開啟筆刷，再連續點擊座位上色
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(g => {
                      const isActive = activeGroupBrush === g;
                      return (
                        <div
                          key={g}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'copyMove';
                            e.dataTransfer.setData('text/plain', JSON.stringify({ itemType: 'groupLabel', groupId: g }));
                          }}
                          onClick={() => setActiveGroupBrush(isActive ? null : g)}
                          className={`group-badge-${g}`}
                          style={{ 
                            width: '32px', height: '32px', borderRadius: '6px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                            color: '#fff', 
                            boxShadow: isActive ? '0 0 0 2px #fff, 0 0 8px var(--primary)' : '0 2px 4px rgba(0,0,0,0.2)',
                            transform: isActive ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.15s ease'
                          }}
                          title={`拖曳或點選第 ${g} 組`}
                        >
                          {g}
                        </div>
                      );
                    })}
                    {(() => {
                      const isActive = activeGroupBrush === 0;
                      return (
                        <div
                          key={0}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'copyMove';
                            e.dataTransfer.setData('text/plain', JSON.stringify({ itemType: 'groupLabel', groupId: 0 }));
                          }}
                          onClick={() => setActiveGroupBrush(isActive ? null : 0)}
                          className="group-badge-0"
                          style={{ 
                            width: '32px', height: '32px', borderRadius: '6px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                            color: '#fff', 
                            boxShadow: isActive ? '0 0 0 2px #fff, 0 0 8px #ff4444' : '0 2px 4px rgba(0,0,0,0.2)',
                            transform: isActive ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.15s ease'
                          }}
                          title="拖曳或點選清除組別"
                        >
                          無
                        </div>
                      );
                    })()}
                  </div>

                  {activeGroupBrush !== null && (
                    <div style={{ marginTop: '8px', padding: '6px 8px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '11px', color: '#93c5fd' }}>
                      🖌️ 筆刷模式中：點擊任意座位立即設為「{activeGroupBrush === 0 ? '無組別' : `第 ${activeGroupBrush} 組`}」
                    </div>
                  )}
                </div>

                {seating.selectedSeatId && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '13px', margin: '0 0 5px' }}>編輯所選座位 #{seating.selectedSeatId}</h4>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                      所屬小組:
                      <input 
                        type="number" min="0" max="15" 
                        value={seating.customMap.seats.find(s => s.id === seating.selectedSeatId)?.groupId ?? 0}
                        onChange={(e) => seating.updateCustomSeat(seating.selectedSeatId, { groupId: Number(e.target.value) })}
                        style={{ width: '50px' }}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{color: 'var(--text-muted)', fontSize: '11px'}}>(也可直接從上方拖曳號碼，或雙擊座位旋轉)</span>
                    </label>
                    <button 
                      className="icon-btn danger" 
                      onClick={() => seating.deleteCustomSeat(seating.selectedSeatId)}
                      style={{ width: '100%', padding: '4px', display: 'flex', justifyContent: 'center', gap: '5px' }}
                    >
                      <Trash2 size={14} /> 刪除此座位
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="action-btn primary" onClick={handleAssign} disabled={isAssigning || students.length === 0} style={{ flex: 3 }}>
             <Shuffle size={16} /> 自動排座位
          </button>
          <button 
             className="secondary-btn" 
             onClick={() => {
                if (window.confirm("確定要清空所有已排好的座位嗎？（不會清除左側的學生名單）\n\n提示：如果您有手動鎖定的座位，它們也會一併被清空。")) {
                  setAssignments([]);
                }
             }} 
             disabled={assignments.length === 0}
             style={{ flex: 1, padding: '0 5px', color: '#ef4444' }} 
             title="清空所有排好的座位"
          >
             <Eraser size={16} /> 清空座位
          </button>
          <button className="secondary-btn" onClick={undo} disabled={!canUndo} style={{ flex: 1, padding: 0 }} title="復原上一步 (手動移動或洗牌)">
             <Undo size={16} />
          </button>
        </div>

        {/* 暫存座位表 */}
        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '8px', padding: '10px', marginTop: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', margin: 0, color: 'var(--text-color)' }}>暫存座位表</h3>
            <button 
              className="action-btn" 
              onClick={() => {
                saveSnapshot();
                alert('已暫存目前畫面！');
              }}
              style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--primary)', color: 'white', border: 'none' }}
            >
              + 暫存目前畫面
            </button>
          </div>
          {snapshots.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
              尚無暫存紀錄
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '120px', overflowY: 'auto' }}>
              {snapshots.map(snap => (
                <li key={snap.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '6px 8px', borderRadius: '4px', marginBottom: '5px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-color)' }}>{snap.timeString}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {snap.layoutMode === 'STANDARD' ? '一般' : snap.layoutMode === 'CUSTOM' ? '自定義' : snap.layoutMode === 'GROUP' ? 'U型小組' : '考試'}模式
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={() => {
                        if (window.confirm('確定要載入此暫存嗎？這將會覆蓋目前的畫面與設定！')) {
                          loadSnapshot(snap.id);
                        }
                      }}
                      style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--btn-secondary-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      載入
                    </button>
                    <button 
                      onClick={() => deleteSnapshot(snap.id)}
                      style={{ fontSize: '11px', padding: '2px 6px', background: 'none', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      刪除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
