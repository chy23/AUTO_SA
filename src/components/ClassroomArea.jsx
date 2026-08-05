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
    toggleSeatLock
  } = seating;

  // Static item dragging
  const draggingStatic = useRef(null); // { id, offsetX, offsetY }

  const handleStaticMouseDown = (e, itemId) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    draggingStatic.current = {
      id: itemId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingStatic.current || !classroomRef.current) return;
      const { id, offsetX, offsetY } = draggingStatic.current;
      const cr = classroomRef.current.getBoundingClientRect();
      let x = ((e.clientX - cr.left - offsetX) / cr.width) * 100;
      let y = ((e.clientY - cr.top - offsetY) / cr.height) * 100;
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
      setStaticItems(prev => prev.map(item =>
        item.id === id ? { ...item, x, y } : item
      ));
    };
    const onMouseUp = () => { draggingStatic.current = null; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [setStaticItems, classroomRef]);

  // Seat dragging
  const handleSeatDragStart = (e, seatId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ itemType: 'seat', id: seatId }));
  };

  const handleSeatDrop = (e, targetSeatId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.itemType === 'seat' && data.id !== targetSeatId) {
        manualSwap(data.id, targetSeatId);
      }
    } catch {}
  };

  return (
    <section className="classroom-area">
      <div className="watermark watermark-top">網站建立自楊家驊老師</div>
      <div className="watermark watermark-bottom">網站建立自楊家驊老師</div>
      
      <div 
        ref={classroomRef}
        className={`classroom ${layoutMode === 'GROUP' ? 'horizontal-layout' : 'vertical-layout'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <div className="blackboard">黑板</div>
        
        {currentMap.labels.map((label, idx) => (
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
