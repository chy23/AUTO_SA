import React, { useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import Seat from './Seat';

export default function ClassroomArea({ seating, classroomRef, onSeatClick }) {
  const {
    layoutMode,
    currentMap,
    assignments,
    staticItems, setStaticItems,
    staticVisibility,
    hiddenSeatIds, setHiddenSeatIds,
    manualSwap,
    toggleSeatLock,
    isEditingLayout,
    selectedSeatId, setSelectedSeatId,
    activeGroupBrush,
    updateCustomSeat,
    deleteCustomSeat
  } = seating;

  const [crosshairPos, setCrosshairPos] = React.useState(null);

  // Static item dragging
  const draggingStatic = useRef(null); // { id, offsetX, offsetY }

  const handleStaticMouseDown = (e, itemId) => {
    if (!isEditingLayout) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    draggingStatic.current = {
      id: itemId,
      offsetX: e.clientX - centerX,
      offsetY: e.clientY - centerY,
    };
  };

  // Seat physical dragging (Edit mode)
  const draggingSeat = useRef(null); // { id, offsetX, offsetY }

  const handleSeatMouseDown = (e, seatId) => {
    if (!isEditingLayout) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    draggingSeat.current = {
      id: seatId,
      offsetX: e.clientX - centerX,
      offsetY: e.clientY - centerY,
    };
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!classroomRef.current) return;
      const cr = classroomRef.current.getBoundingClientRect();

      if (draggingStatic.current) {
        const { id, offsetX, offsetY } = draggingStatic.current;
        let centerX = e.clientX - offsetX;
        let centerY = e.clientY - offsetY;
        let x = ((centerX - cr.left) / cr.width) * 100;
        let y = ((centerY - cr.top) / cr.height) * 100;
        
        // Snap to grid (2.5%)
        x = Math.round(x / 2.5) * 2.5;
        y = Math.round(y / 2.5) * 2.5;
        setCrosshairPos({ x, y });

        setStaticItems(prev => prev.map(item =>
          item.id === id ? { ...item, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : item
        ));
      } else if (draggingSeat.current) {
        const { id, offsetX, offsetY } = draggingSeat.current;
        let centerX = e.clientX - offsetX;
        let centerY = e.clientY - offsetY;
        let x = ((centerX - cr.left) / cr.width) * 100;
        let y = ((centerY - cr.top) / cr.height) * 100;

        // Snap to grid (2.5%)
        x = Math.round(x / 2.5) * 2.5;
        y = Math.round(y / 2.5) * 2.5;
        setCrosshairPos({ x, y });

        updateCustomSeat(id, { 
          x: Math.max(0, Math.min(100, x)), 
          y: Math.max(0, Math.min(100, y)) 
        });
      }
    };
    const onMouseUp = () => { 
      draggingStatic.current = null; 
      draggingSeat.current = null;
      setCrosshairPos(null);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [setStaticItems, updateCustomSeat, classroomRef]);

  // Seat dragging
  const handleSeatDragStart = (e, seatId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ itemType: 'seat', id: seatId }));
  };

  const handleSeatDrop = (e, targetSeatId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.itemType === 'seat' && data.id !== targetSeatId && !isEditingLayout) {
        manualSwap(data.id, targetSeatId);
      } else if (data.itemType === 'groupLabel') {
        updateCustomSeat(targetSeatId, { groupId: data.groupId });
      }
    } catch (err) {
      console.warn("Drop error:", err);
    }
  };

  const handleSeatDoubleClick = (seatId) => {
    if (layoutMode !== 'CUSTOM') return;
    const seat = currentMap.seats.find(s => s.id === seatId);
    if (seat) {
      updateCustomSeat(seatId, { shape: seat.shape === 'vertical' ? 'horizontal' : 'vertical' });
    }
  };

  return (
    <section className="classroom-area">
      <div className="watermark watermark-top">網站建立自楊家驊老師</div>
      <div className="watermark watermark-bottom">網站建立自楊家驊老師</div>
      
      <div 
        ref={classroomRef}
        className={`classroom ${layoutMode === 'EXAM' ? 'vertical-layout' : 'horizontal-layout'} ${isEditingLayout && layoutMode === 'CUSTOM' ? 'editing-grid' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => e.preventDefault()}
      >
        {crosshairPos && isEditingLayout && layoutMode === 'CUSTOM' && (
          <>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${crosshairPos.x}%`, width: '1px', background: 'var(--primary)', zIndex: 10, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${crosshairPos.y}%`, height: '1px', background: 'var(--primary)', zIndex: 10, pointerEvents: 'none' }} />
          </>
        )}
        <div className="blackboard">黑板</div>
        
        {layoutMode !== 'CUSTOM' && (currentMap?.labels || []).map((label, idx) => (
          <div 
            key={`label-${idx}`} 
            className="group-label"
            style={{ left: `${label.x}%`, top: `${label.y}%` }}
          >
            {label.text}
          </div>
        ))}
        
        {(staticItems || []).map(item => staticVisibility[item.id] && (
          <div 
            key={item.id} 
            className={`static-label ${item.orientation === 'vertical' ? 'static-vertical' : 'static-horizontal'}`}
            style={{ left: `${item.x}%`, top: `${item.y}%`, cursor: 'grab', userSelect: 'none' }}
            onMouseDown={(e) => handleStaticMouseDown(e, item.id)}
          >
            {item.name}
          </div>
        ))}
        
        {(currentMap?.seats || [])
          .filter(seat => !hiddenSeatIds.includes(seat.id))
          .map(seat => {
          const ass = assignments.find(a => a.seatId === seat.id);
          return (
            <Seat 
              key={seat.id}
              seat={seat}
              assignment={ass}
              layoutMode={layoutMode}
              onDragStart={handleSeatDragStart}
              onDrop={handleSeatDrop}
              onDelete={(id) => {
                if (layoutMode === 'CUSTOM') {
                  deleteCustomSeat(id);
                } else {
                  setHiddenSeatIds(prev => [...prev, id]);
                }
              }}
              onToggleLock={toggleSeatLock}
              isEditingLayout={isEditingLayout}
              isDeletingSeat={seating.isDeletingSeat}
              isSelected={selectedSeatId === seat.id}
              onSelect={setSelectedSeatId}
              onMouseDown={handleSeatMouseDown}
              onDoubleClick={handleSeatDoubleClick}
              onSeatClick={onSeatClick}
              activeGroupBrush={activeGroupBrush}
              onAssignGroup={(id, g) => updateCustomSeat(id, { groupId: g })}
            />
          );
        })}
      </div>
      <p className="drag-hint" style={{ textAlign: 'center', marginTop: '15px', color: 'var(--text-muted)' }}>
        <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
        提示：您可以自由拖曳座位與各項設施地標到教室內的任意位置
      </p>
    </section>
  );
}
