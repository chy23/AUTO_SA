import React from 'react';
import { X, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Seat({ 
  seat, 
  assignment, 
  layoutMode, 
  onDragStart, 
  onDrop, 
  onDelete,
  onToggleLock
}) {
  const isLocked = assignment?.isLocked;
  
  return (
    <motion.div 
      layout
      initial={false}
      animate={{ left: `${seat.x}%`, top: `${seat.y}%` }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`seat group-${seat.groupId || 1} ${seat.shape || 'vertical'}`}
      style={{ position: 'absolute' }}
      draggable
      onDragStart={(e) => onDragStart(e, seat.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, seat.id)}
    >
      <div className="seat-no">{seat.id}</div>
      
      {/* Delete button (Standard Mode) */}
      {layoutMode === 'STANDARD' && (
        <button 
          className="delete-seat-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(seat.id);
          }}
        >
          <X size={12} />
        </button>
      )}

      {/* Lock toggle button */}
      {assignment?.student && (
        <button 
          className="lock-seat-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(seat.id);
          }}
          style={{
            position: 'absolute',
            top: '-5px',
            left: '-5px',
            background: isLocked ? '#ff4444' : '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: isLocked ? 1 : 0,
            transition: 'opacity 0.2s'
          }}
          title={isLocked ? "解除鎖定" : "鎖定座位"}
        >
          {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
      )}

      {assignment?.student ? (
        <div className="student-info">
          <span className="student-id">{assignment.student.id}</span>
          <span className="student-name">{assignment.student.name}</span>
        </div>
      ) : (
        <div className="empty-seat">空</div>
      )}
    </motion.div>
  );
}
