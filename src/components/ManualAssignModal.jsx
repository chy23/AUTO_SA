import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ManualAssignModal({ isOpen, seatId, onClose, students, assignments, onAssign }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredStudents = students.filter(s => 
    s.name.includes(searchTerm) || s.id.includes(searchTerm)
  );

  const currentAssignedStudent = assignments.find(a => a.seatId === seatId)?.student;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '450px' }}>
        <div className="modal-header">
          <h2>指定學生至座位 {seatId}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          {currentAssignedStudent ? (
            <div style={{ marginBottom: '15px', color: 'var(--text-main)', padding: '10px', background: 'var(--item-bg)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              目前座位上的學生：<strong>{currentAssignedStudent.name}</strong>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                (提示：若指定新學生，兩人將會互換座位，且此座位將自動鎖定)
              </div>
            </div>
          ) : (
            <p style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>目前座位為空。<br/><span style={{fontSize: '12px'}}>(提示：指定後該座位將自動鎖定)</span></p>
          )}

          <input 
            type="text" 
            placeholder="搜尋姓名或座號..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none' }}
          />
          
          <div className="student-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', maxHeight: '300px', overflowY: 'auto', padding: '5px' }}>
            {filteredStudents.map(student => {
              const isCurrent = currentAssignedStudent?.id === student.id;
              return (
                <button 
                  key={student.id}
                  onClick={() => {
                    onAssign(seatId, student);
                    onClose();
                  }}
                  style={{ 
                    padding: '8px 4px', 
                    borderRadius: '4px', 
                    border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isCurrent ? 'rgba(59, 130, 246, 0.15)' : 'var(--item-bg)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: isCurrent ? 'bold' : 'normal',
                    fontSize: '0.9rem'
                  }}
                >
                  {student.id}. {student.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
