import React, { useState, useRef } from 'react';
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
  isDeletingSeat,
  isSelected,
  onSelect,
  onMouseDown,
  onDoubleClick,
  activeGroupBrush,
  onAssignGroup,
  onSeatClick
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const isLocked = assignment?.isLocked;
  const groupId = seat.groupId ?? 0;
  const clickTimeout = useRef(null);
  const lastClickTime = useRef(0);

  const handleClick = (e) => {
    e.stopPropagation();
    
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime.current;
    
    if (timeDiff < 300) {
      // It's a double click!
      if (clickTimeout.current !== null) {
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
      }
      if (onDoubleClick) {
        onDoubleClick(seat.id);
      }
      lastClickTime.current = 0; // reset to prevent triple-click bugs
    } else {
      // It's a single click (for now)
      lastClickTime.current = currentTime;
      
      if (clickTimeout.current !== null) {
        clearTimeout(clickTimeout.current);
      }
      
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;
        if (isEditingLayout) {
          if (activeGroupBrush === 'DELETE') {
            onDelete(seat.id);
          } else if (activeGroupBrush !== null && onAssignGroup) {
            onAssignGroup(seat.id, activeGroupBrush);
          } else {
            onSelect(seat.id);
          }
        } else if (isDeletingSeat) {
          onDelete(seat.id);
        } else {
          if (onSeatClick) onSeatClick(seat.id);
        }
      }, 300); // 300ms delay
    }
  };

  
  return (
    <motion.div 
      initial={false}
      animate={{ left: `${seat.x}%`, top: `${seat.y}%` }}
      transition={isEditingLayout ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
      className={`seat group-${groupId} ${seat.shape || 'vertical'} ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`}
      style={{ 
        position: 'absolute', 
        cursor: isEditingLayout ? (activeGroupBrush !== null ? 'crosshair' : 'grab') : (isDeletingSeat ? 'crosshair' : 'pointer'),
        boxShadow: isDragOver ? '0 0 0 3px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.4)' : undefined,
        transform: isDragOver ? 'scale(1.08)' : undefined,
        transition: 'box-shadow 0.15s ease, transform 0.15s ease'
      }}
      draggable={!isEditingLayout}
      onDragStart={(e) => { if (!isEditingLayout) onDragStart(e, seat.id); }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        if (!isDragOver) setIsDragOver(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e, seat.id);
      }}
      onClick={handleClick}
      onMouseDown={(e) => {
        if (isEditingLayout) onMouseDown(e, seat.id);
      }}
    >
      <div className="seat-no" style={{ pointerEvents: 'none' }}>{seat.id}</div>
      
      {/* Group indicator in normal mode */}
      {!isEditingLayout && groupId > 0 && (
        <div style={{
          position: 'absolute',
          top: '2px',
          right: '4px',
          fontSize: 'clamp(9px, 1.1cqw, 11px)',
          fontWeight: 'bold',
          color: `var(--group-${groupId}, #3b82f6)`,
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          G{groupId}
        </div>
      )}

      {/* Delete button (Edit Mode) */}
      {isEditingLayout && (
        <button 
          className="delete-seat-btn"
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#ff4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            cursor: 'pointer',
            zIndex: 20,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(seat.id);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          title="刪除座位"
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

      {/* Normal mode student info */}
      {!isEditingLayout && assignment?.student ? (
        <div className="student-info" style={{ pointerEvents: 'none' }}>
          {assignment.student.id && <span className="student-id">{assignment.student.id}</span>}
          <span className="student-name">{assignment.student.name}</span>
        </div>
      ) : !isEditingLayout ? (
        <div className="empty-seat" style={{ pointerEvents: 'none' }}>空</div>
      ) : null}

      {/* Custom edit mode center display */}
      {isEditingLayout && (
        groupId > 0 ? (
          <div style={{
            background: `var(--group-${groupId}, #3b82f6)`,
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: 'clamp(10px, 1.3cqw, 13px)',
            padding: '2px 6px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            userSelect: 'none',
            pointerEvents: 'none',
            textAlign: 'center'
          }}>
            第 {groupId} 組
          </div>
        ) : (
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '11px',
            opacity: 0.5,
            pointerEvents: 'none',
            userSelect: 'none'
          }}>
            (空白)
          </div>
        )
      )}
    </motion.div>
  );
}
