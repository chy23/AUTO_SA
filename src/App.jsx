import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ClassroomArea from './components/ClassroomArea';
import RuleBuilderModal from './components/RuleBuilderModal';
import ManualAssignModal from './components/ManualAssignModal';
import { useSeating } from './hooks/useSeating';
import './App.css';

export default function App() {
  const seating = useSeating();
  const classroomRef = React.useRef(null);
  const [isRuleBuilderOpen, setIsRuleBuilderOpen] = useState(false);
  const [manualAssignSeatId, setManualAssignSeatId] = useState(null);

  return (
    <div className="app-container">
      <Header 
        layoutMode={seating.layoutMode} 
        lastGroupMode={seating.lastGroupMode} 
        setLayoutMode={seating.setLayoutMode} 
      />
      
      <main className="app-content">
        <Sidebar 
          seating={seating}
          classroomRef={classroomRef}
          onOpenRuleBuilder={() => setIsRuleBuilderOpen(true)}
        />

        <ClassroomArea 
          seating={seating}
          classroomRef={classroomRef}
          onSeatClick={(seatId) => setManualAssignSeatId(seatId)}
        />
      </main>

      <RuleBuilderModal 
        isOpen={isRuleBuilderOpen}
        onClose={() => setIsRuleBuilderOpen(false)}
        rules={seating.rules}
        setRules={seating.setRules}
        students={seating.students}
      />
      
      <ManualAssignModal 
        isOpen={manualAssignSeatId !== null}
        seatId={manualAssignSeatId}
        onClose={() => setManualAssignSeatId(null)}
        students={seating.students}
        assignments={seating.assignments}
        onAssign={seating.assignStudentToSeat}
      />
    </div>
  );
}
