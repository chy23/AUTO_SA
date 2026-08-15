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
    assignments, setAssignments, clearSeats,
    rules, setRules,
    layoutMode, changeLayoutMode,
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
    deleteSnapshot,
    clearSnapshots,
    isDeletingSeat, setIsDeletingSeat,
    isRotatingSeat, setIsRotatingSeat,
    rotatedSeatIds, setRotatedSeatIds
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

  const filteredSnapshots = snapshots.filter(s => s.layoutMode === layoutMode);

  return (
    <aside className="sidebar">
      {/* 區塊 A: 排版與佈局 */}
      <details className="accordion-panel" open>
        <summary>排版與佈局</summary>
        <div className="accordion-content">
          {(layoutMode === 'GROUP' || layoutMode === 'EXAM') && (
            <button 
              className="action-btn outline"
              onClick={() => {
                const nextMode = layoutMode === 'GROUP' ? 'EXAM' : 'GROUP';
                changeLayoutMode(nextMode);
                setLastGroupMode(nextMode);
              }}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              <Settings2 size={18} />
              {layoutMode === 'GROUP' ? '切換為直排 (個人考試)' : '切換為橫排 (分組上課)'}
            </button>
          )}

          {layoutMode === 'STANDARD' && (
            <div className="standard-mode-settings" style={{ marginBottom: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-color)' }}>一般模式行列設定</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>行數: 
                  <input type="number" min="1" max="15" value={standardRows} onChange={e => setStandardRows(Number(e.target.value))} style={{ width: '45px', marginLeft: '5px', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}/>
                </label>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>列數: 
                  <input type="number" min="1" max="15" value={standardCols} onChange={e => setStandardCols(Number(e.target.value))} style={{ width: '45px', marginLeft: '5px', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}/>
                </label>
              </div>
            </div>
          )}

          {layoutMode === 'CUSTOM' && (
            <div className="custom-mode-settings" style={{ marginBottom: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              {!seating.isEditingLayout && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}>
                  <strong style={{ color: 'var(--text-color)' }}>📌 簡單 5 步驟：</strong>
                  <ol style={{ margin: '5px 0 0 15px', padding: 0 }}>
                    <li>點擊下方「<strong>編輯座位配置</strong>」</li>
                    <li>新增座位並<strong>拖曳</strong>位置</li>
                    <li>使用<strong>號碼筆刷</strong>上色分組</li>
                    <li>完成後「<strong>儲存並退出編輯</strong>」</li>
                    <li>點擊最下方「<strong>自動排座位</strong>」</li>
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
                  <div style={{ display: 'flex', gap: '5px', marginTop: '10px', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-color)', whiteSpace: 'nowrap' }}>座位總數:</span>
                    <input 
                      type="number" 
                      min="1" max="100" 
                      value={customSeatCount} 
                      onChange={(e) => setCustomSeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '45px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', textAlign: 'center' }}
                    />
                    <button 
                      className="secondary-btn" 
                      onClick={() => {
                        if (window.confirm(`確定要重新產生 ${customSeatCount} 個座位嗎？\n\n警告：這會清除您目前在版面上的所有排列與小組設定！`)) {
                          seating.resetCustomMap(customSeatCount);
                        }
                      }} 
                      style={{ flex: 1, padding: '4px', color: '#ef4444' }}
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
                              width: '28px', height: '28px', borderRadius: '6px', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
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
                              width: '28px', height: '28px', borderRadius: '6px', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              cursor: 'pointer', fontWeight: 'bold', fontSize: '10px',
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
                    
                    <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                      <button
                        onClick={() => setActiveGroupBrush(activeGroupBrush === 'ROTATE' ? null : 'ROTATE')}
                        className={`action-btn ${activeGroupBrush === 'ROTATE' ? 'primary' : 'outline'}`}
                        style={{ flex: 1, fontSize: '11px', padding: '4px', display: 'flex', justifyContent: 'center', gap: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)' }}
                      >
                        🔄 旋轉座位
                      </button>
                    </div>
                  </div>
                  
                  {seating.selectedSeatId && (
                    <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                      <h4 style={{ fontSize: '12px', margin: '0 0 5px' }}>編輯所選座位 #{seating.selectedSeatId}</h4>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px' }}>
                        所屬小組:
                        <input 
                          type="number" min="0" max="15" 
                          value={seating.customMap.seats.find(s => s.id === seating.selectedSeatId)?.groupId ?? 0}
                          onChange={(e) => seating.updateCustomSeat(seating.selectedSeatId, { groupId: Number(e.target.value) })}
                          style={{ width: '45px', padding: '2px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                        />
                      </label>
                      <button 
                        className="icon-btn danger" 
                        onClick={() => seating.deleteCustomSeat(seating.selectedSeatId)}
                        style={{ width: '100%', padding: '4px', display: 'flex', justifyContent: 'center', gap: '5px', fontSize: '11px' }}
                      >
                        <Trash2 size={12} /> 刪除此座位
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {layoutMode !== 'CUSTOM' && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-color)' }}>版面微調工具</h3>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  className={`action-btn ${isRotatingSeat ? 'primary' : 'outline'}`}
                  onClick={() => { setIsRotatingSeat(!isRotatingSeat); setIsDeletingSeat(false); }}
                  style={{ fontSize: '12px', padding: '6px', flex: 1 }}
                >
                  {isRotatingSeat ? '完成旋轉' : '🔄 旋轉座位'}
                </button>
                <button 
                  className={`action-btn ${isDeletingSeat ? 'danger' : 'outline'}`}
                  onClick={() => { setIsDeletingSeat(!isDeletingSeat); setIsRotatingSeat(false); }}
                  style={{ fontSize: '12px', padding: '6px', flex: 1 }}
                >
                  {isDeletingSeat ? '完成刪除' : '🗑 刪除座位'}
                </button>
              </div>
              
              {(hiddenSeatIds.length > 0 || rotatedSeatIds.length > 0) && (
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  {hiddenSeatIds.length > 0 && (
                    <button className="secondary-btn" onClick={() => setHiddenSeatIds([])} style={{ fontSize: '11px', padding: '4px', flex: 1 }}>
                      還原刪除
                    </button>
                  )}
                  {rotatedSeatIds.length > 0 && (
                    <button className="secondary-btn" onClick={() => setRotatedSeatIds([])} style={{ fontSize: '11px', padding: '4px', flex: 1 }}>
                      還原旋轉
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </details>

      {/* 區塊 B: 環境與條件 */}
      <details className="accordion-panel">
        <summary>環境與條件</summary>
        <div className="accordion-content">
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-color)' }}>環境設施顯示</h3>
            <div className="visibility-toggles" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.keys(staticVisibility).map(key => {
                const itemDef = staticItems.find(i => i.id === key) || { name: key };
                return (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px' }}>
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
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '13px', margin: 0, color: 'var(--text-color)' }}>排座條件</h3>
              <button className="secondary-btn" onClick={() => onOpenRuleBuilder(null)} style={{ padding: '2px 6px', fontSize: '11px' }}>
                + 新增設定
              </button>
            </div>
            <ul className="rule-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {rules.length === 0 && <li style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '12px', padding: '10px' }}>目前沒有條件</li>}
              {rules.map(r => (
                <li 
                  key={r.id} 
                  onClick={() => onOpenRuleBuilder(r.id)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 8px', borderRadius: '4px', marginBottom: '4px', fontSize: '12px' }}
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
                    onClick={(e) => { e.stopPropagation(); removeRule(r.id); }}
                    style={{ padding: '2px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      {/* 區塊 C: 資料與歷史 */}
      <details className="accordion-panel">
        <summary>資料與歷史</summary>
        <div className="accordion-content">
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-color)' }}>學生名單 ({students.length} 人)</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label className="upload-btn" style={{ flex: 1, padding: '6px', fontSize: '12px' }}>
                <Upload size={14} /> 上傳名單
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
                style={{ padding: '0 8px', color: '#ef4444' }}
                title="清除所有學生"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-color)' }}>匯出座位表</h3>
            <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
               <button className="secondary-btn" onClick={() => exportToPPTX(assignments, currentMap, staticItems, staticVisibility)} style={{ padding: '6px', fontSize: '12px' }}>
                 <Download size={14} style={{ marginRight: '4px' }}/> 匯出 PPTX
               </button>
               <div style={{ display: 'flex', gap: '5px' }}>
                 <button className="secondary-btn" onClick={() => exportToJPEG(classroomRef.current, false)} style={{ flex: 1, padding: '6px', fontSize: '12px' }}>
                   <ImageIcon size={14} style={{ marginRight: '4px' }}/> 黑底圖檔
                 </button>
                 <button className="secondary-btn" onClick={() => exportToJPEG(classroomRef.current, true)} style={{ flex: 1, padding: '6px', fontSize: '12px', background: '#fff', color: '#333' }}>
                   <ImageIcon size={14} style={{ marginRight: '4px' }}/> 白底圖檔
                 </button>
               </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '13px', margin: 0, color: 'var(--text-color)' }}>自動暫存紀錄</h3>
              {filteredSnapshots.length > 0 && (
                <button 
                  className="icon-btn" 
                  onClick={() => {
                    if (window.confirm('確定要清空當前模式的所有暫存紀錄嗎？此動作無法復原！')) {
                      clearSnapshots(layoutMode);
                    }
                  }}
                  title="清空當前模式的所有暫存紀錄"
                  style={{ padding: '2px', color: 'var(--text-muted)' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            {filteredSnapshots.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '15px 0', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '18px', opacity: 0.5 }}>📂</span>
                尚無暫存紀錄
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '150px', overflowY: 'auto' }}>
                {filteredSnapshots.map(snap => (
                  <li 
                    key={snap.id} 
                    onClick={() => { if (window.confirm('確定要載入此暫存嗎？這將會覆蓋目前的畫面與設定！')) loadSnapshot(snap.id); }}
                    className="snapshot-item"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '6px 8px', borderRadius: '4px', marginBottom: '5px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="點擊載入此暫存紀錄"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-color)' }}>{snap.timeString}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {snap.layoutMode === 'STANDARD' ? '一般' : snap.layoutMode === 'CUSTOM' ? '自定義' : snap.layoutMode === 'GROUP' ? 'U型小組' : '考試'}模式
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteSnapshot(snap.id); }} 
                        style={{ fontSize: '10px', padding: '2px 6px', background: 'none', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'none'; }}
                        title="刪除"
                      >
                        刪除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </details>

      {/* 固定在底部的核心操作區 */}
      <div className="bottom-actions">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button 
             className="secondary-btn" 
              onClick={() => {
                if (window.confirm("確定要清空所有已排好的座位嗎？（不會清除左側的學生名單）\n\n提示：如果您有手動鎖定的座位，它們也會一併被清空。")) {
                  clearSeats();
                }
              }} 
             disabled={assignments.length === 0}
             style={{ flex: 1, padding: '8px', color: '#ef4444', fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '4px' }} 
             title="清空所有排好的座位"
          >
             <Eraser size={14} /> 清空
          </button>
          <button className="secondary-btn" onClick={undo} disabled={!canUndo} style={{ flex: 1, padding: '8px', fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '4px' }} title="復原上一步 (手動移動或洗牌)">
             <Undo size={14} /> 復原
          </button>
        </div>
        <button className="action-btn auto-assign-btn" onClick={handleAssign} disabled={isAssigning || students.length === 0} style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
           <Shuffle size={18} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> 自動排座位
        </button>
      </div>
    </aside>
  );
}
