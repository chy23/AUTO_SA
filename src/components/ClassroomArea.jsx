import React, { useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import Seat from './Seat';

export default function ClassroomArea({ seating, classroomRef }) {
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
    updateCustomSeat
  } = seating;

  // Static item dragging
  const draggingStatic = useRef(null); // { id, offsetX, offsetY }

  const handleStaticMouseDown = (e, itemId) => {
    if (!isEditingLayout) return;
    e.preventDefault();
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
    e.preventDefault();
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
        setStaticItems(prev => prev.map(item =>
          item.id === id ? { ...item, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : item
        ));
      } else if (draggingSeat.current) {
        const { id, offsetX, offsetY } = draggingSeat.current;
        let centerX = e.clientX - offsetX;
        let centerY = e.clientY - offsetY;
        let x = ((centerX - cr.left) / cr.width) * 100;
        let y = ((centerY - cr.top) / cr.height) * 100;
        updateCustomSeat(id, { 
          x: Math.max(0, Math.min(100, x)), 
          y: Math.max(0, Math.min(100, y)) 
        });
      }
    };
    const onMouseUp = () => { 
      draggingStatic.current = null; 
      draggingSeat.current = null;
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
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.itemType === 'seat' && data.id !== targetSeatId && !isEditingLayout) {
        manualSwap(data.id, targetSeatId);
      } else if (data.itemType === 'groupLabel' && isEditingLayout) {
        updateCustomSeat(targetSeatId, { groupId: data.groupId });
      }
    } catch {}
  };

  const handleSeatDoubleClick = (seatId) => {
    if (!isEditingLayout) return;
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
        className={`classroom ${layoutMode === 'EXAM' ? 'vertical-layout' : 'horizontal-layout'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <div className="blackboard">黑板</div>
        
        {layoutMode !== 'CUSTOM' && currentMap.labels.map((label, idx) => (
          <div 
            key={`label-${idx}`} 
            className="group-label"
            style={{ left: `${label.x}%`, top: `${label.y}%` }}
          >
            {label.text}
          </div>
        ))}
        
        {staticItems.map(item => staticVisibility[item.id] && (
          <div 
            key={item.id} 
            className={`static-label ${item.orientation === 'vertical' ? 'static-vertical' : 'static-horizontal'}`}
            style={{ left: `${item.x}%`, top: `${item.y}%`, cursor: 'grab', userSelect: 'none' }}
            onMouseDown={(e) => handleStaticMouseDown(e, item.id)}
          >
            {item.name}
          </div>
        ))}
        
        {currentMap.seats.map(seat => {
          const ass = assignments.find(a => a.seatId === seat.id);
          return (
            <Seat 
              key={seat.id}
              seat={seat}
              assignment={ass}
              layoutMode={layoutMode}
              onDragStart={handleSeatDragStart}
              onDrop={handleSeatDrop}
              onDelete={(id) => setHiddenSeatIds(prev => [...prev, id])}
              onToggleLock={toggleSeatLock}
              isEditingLayout={isEditingLayout}
              isSelected={selectedSeatId === seat.id}
              onSelect={setSelectedSeatId}
              onMouseDown={handleSeatMouseDown}
              onDoubleClick={handleSeatDoubleClick}
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
