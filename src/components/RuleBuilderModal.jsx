import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Trash2 } from 'lucide-react';

export default function RuleBuilderModal({ isOpen, onClose, rules, setRules, students, editingRuleId, onClearEdit }) {
  const [ruleType, setRuleType] = useState('NOT_SAME_GROUP');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingRuleId) {
        const rule = rules.find(r => r.id === editingRuleId);
        if (rule) {
          setRuleType(rule.type);
          setSelectedStudents(students.filter(s => rule.students.includes(s.name)));
        }
      } else {
        setRuleType('NOT_SAME_GROUP');
        setSelectedStudents([]);
      }
      setSearchTerm('');
    }
  }, [isOpen, editingRuleId, rules, students]);

  if (!isOpen) return null;

  const handleAddRule = () => {
    if (selectedStudents.length < 2) {
      alert("請至少選擇 2 位學生");
      return;
    }
    
    if (editingRuleId) {
      setRules(rules.map(r => r.id === editingRuleId ? {
        ...r,
        type: ruleType,
        students: selectedStudents.map(s => s.name)
      } : r));
      if (onClearEdit) onClearEdit();
    } else {
      setRules([...rules, { 
        id: Date.now(), 
        type: ruleType, 
        students: selectedStudents.map(s => s.name) 
      }]);
    }
    
    // Clear selection for next rule
    setSelectedStudents([]);
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

  const toggleStudent = (student) => {
    if (selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      if (selectedStudents.length >= 5) {
        alert("最多只能選擇 5 位學生");
        return;
      }
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || s.id.includes(searchTerm)
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>新增排座規則</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>1. 選擇規則類型：</label>
            <select value={ruleType} onChange={e => setRuleType(e.target.value)} className="rule-select" style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
              <option value="NOT_SAME_GROUP">不能同組 (適合愛講話的組合)</option>
              <option value="NOT_ADJACENT">不能相鄰/坐隔壁</option>
              <option value="SAME_GROUP">必須同組 (適合小老師指導)</option>
              <option value="ADJACENT">必須相鄰/坐隔壁</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>2. 選擇學生 (已選 {selectedStudents.length}/5)：</label>
            <div className="selected-tags" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', margin: '10px 0' }}>
              {selectedStudents.map(s => (
                <span key={s.id} className="tag" style={{ background: '#4CAF50', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {s.name} <X size={12} style={{ cursor: 'pointer' }} onClick={() => toggleStudent(s)} />
                </span>
              ))}
              {selectedStudents.length === 0 && <span style={{ color: '#888', fontSize: '12px' }}>尚未選擇學生</span>}
            </div>
            
            <input 
              type="text" 
              placeholder="搜尋姓名或座號..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="rule-input"
              style={{ width: '100%', marginBottom: '10px' }}
            />
            
            <div className="student-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', maxHeight: '200px', overflowY: 'auto', padding: '5px' }}>
              {filteredStudents.map(student => {
                const isSelected = selectedStudents.find(s => s.id === student.id);
                return (
                  <button 
                    key={student.id}
                    onClick={() => toggleStudent(student)}
                    style={{ 
                      padding: '6px', 
                      borderRadius: '4px', 
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--item-bg)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
                  >
                    {student.id}. {student.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {rules.length > 0 && (
          <div className="current-rules-section" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-color)' }}>目前已建立的條件：</h3>
            <ul className="rule-list" style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '5px' }}>
              {rules.map(r => (
                <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--item-bg)', padding: '6px 10px', borderRadius: '4px', marginBottom: '6px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
                  <span>
                    {r.students ? r.students.join(', ') : ''} 
                    <strong style={{ color: 'var(--primary)', marginLeft: '5px' }}>
                      {r.type === 'NOT_SAME_GROUP' && "不能同組"}
                      {r.type === 'NOT_ADJACENT' && "不能相鄰"}
                      {r.type === 'SAME_GROUP' && "必須同組"}
                      {r.type === 'ADJACENT' && "必須相鄰"}
                    </strong>
                  </span>
                  <button 
                    className="icon-btn danger" 
                    style={{ padding: '4px', color: '#ef4444' }}
                    onClick={() => setRules(rules.filter(rule => rule.id !== r.id))}
                    title="刪除條件"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
          {showSavedMsg && <span style={{ color: '#4CAF50', fontSize: '0.9rem', fontWeight: 'bold' }}>已儲存！您可以繼續新增</span>}
          <button className="secondary-btn" onClick={onClose}>完成 / 關閉</button>
          <button className="action-btn primary" onClick={handleAddRule}>
            {editingRuleId ? '儲存變更' : '儲存規則'}
          </button>
        </div>
      </div>
      
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--bg-color);
          padding: 20px;
          border-radius: 8px;
          width: 500px;
          max-width: 90vw;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .modal-header h2 { margin: 0; font-size: 1.2rem; }
      `}</style>
    </div>
  );
}
