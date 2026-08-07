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
  onToggleLock,
  isEditingLayout,
  isSelected,
  onSelect,
  onMouseDown,
  onDoubleClick
}) {
  const isLocked = assignment?.isLocked;
  
  return (
    <motion.div 
      layout
      initial={false}
      animate={{ left: `${seat.x}%`, top: `${seat.y}%` }}
      transition={isEditingLayout ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
      className={`seat group-${seat.groupId || 1} ${seat.shape || 'vertical'} ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`}
      style={{ position: 'absolute', cursor: isEditingLayout ? 'grab' : 'pointer' }}
      draggable={!isEditingLayout}
      onDragStart={(e) => { if (!isEditingLayout) onDragStart(e, seat.id); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, seat.id)}
      onClick={(e) => {
        if (isEditingLayout) {
          e.stopPropagation();
          onSelect(seat.id);
        }
      }}
      onDoubleClick={(e) => {
        if (isEditingLayout) {
          e.stopPropagation();
          onDoubleClick(seat.id);
        }
      }}
      onMouseDown={(e) => {
        if (isEditingLayout) onMouseDown(e, seat.id);
      }}
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
          className={`lock-seat-btn ${isLocked ? 'locked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(seat.id);
          }}
          title={isLocked ? "解除鎖定" : "鎖定座位"}
        >
          {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
      )}

      {!isEditingLayout && assignment?.student ? (
        <div className="student-info">
          <span className="student-id">{assignment.student.id}</span>
          <span className="student-name">{assignment.student.name}</span>
        </div>
      ) : !isEditingLayout ? (
        <div className="empty-seat">空</div>
      ) : null}
    </motion.div>
  );
}
