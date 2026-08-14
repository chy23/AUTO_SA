import { useState, useEffect, useCallback } from 'react';
import { LAYOUT_HORIZONTAL, LAYOUT_VERTICAL } from '../constants';
import { assignSeats } from '../utils/algorithm';

// Robust useLocalStorage hook with functional updater support
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed = JSON.parse(item);
      // Guard against corrupted or empty custom map
      if (key === 'auto_sa_custom_map') {
        if (!parsed || !Array.isArray(parsed.seats) || parsed.seats.length === 0) {
          return initialValue;
        }
      }
      return parsed;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (e) {
          console.warn("Error saving to localStorage", e);
        }
        return valueToStore;
      });
    } catch (error) {
      console.warn(error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export const useSeating = () => {
  // Persisted states
  const [students, setStudents] = useLocalStorage('auto_sa_students', []);
  const [rules, setRules] = useLocalStorage('auto_sa_rules', []);
  const [layoutMode, setLayoutMode] = useLocalStorage('auto_sa_layout_mode', 'STANDARD');
  const [lastGroupMode, setLastGroupMode] = useLocalStorage('auto_sa_last_group_mode', 'GROUP');
  const [standardRows, setStandardRows] = useLocalStorage('auto_sa_std_rows', 6);
  const [standardCols, setStandardCols] = useLocalStorage('auto_sa_std_cols', 5);
  const [hiddenSeatIds, setHiddenSeatIds] = useLocalStorage('auto_sa_hidden_seats', []);
  const [staticVisibility, setStaticVisibility] = useLocalStorage('auto_sa_static_vis', {
    'front-door': true, 'back-corridor': true, 'back-door': true, 'teacher': true, 'restroom': true
  });
  
  const generateDefaultBlankSeats = (count = 30) => {
    const seats = [];
    const cols = Math.max(1, Math.ceil(Math.sqrt(count)) + 1); // rough aspect ratio
    for (let i = 0; i < count; i++) {
      seats.push({
        id: i + 1,
        groupId: 0,
        x: 20 + (i % cols) * 12, 
        y: 25 + Math.floor(i / cols) * 14, 
        shape: 'vertical'
      });
    }
    return seats;
  };

  const defaultCustomMap = {
    labels: [],
    seats: generateDefaultBlankSeats(),
    staticItems: LAYOUT_VERTICAL.staticItems
  };

  const [customMap, setCustomMap] = useLocalStorage('auto_sa_custom_map', defaultCustomMap);
  
  const safeCustomMap = {
    labels: customMap?.labels || [],
    seats: (Array.isArray(customMap?.seats) && customMap.seats.length > 0)
      ? customMap.seats 
      : generateDefaultBlankSeats(),
    staticItems: customMap?.staticItems || LAYOUT_VERTICAL.staticItems
  };

  // Non-persisted transient states
  const [isAssigning, setIsAssigning] = useState(false);
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  useEffect(() => {
    setIsEditingLayout(false);
    setHiddenSeatIds([]);
  }, [layoutMode, setHiddenSeatIds]);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [activeGroupBrush, setActiveGroupBrush] = useState(null);
  const [history, setHistory] = useState([]); // Array of assignment arrays
  
  // Dynamic Maps
  const standardMap = {
    seats: [],
    labels: [],
    staticItems: LAYOUT_VERTICAL.staticItems
  };
  let currentId = 1;
  const xStep = standardCols > 1 ? 76 / (standardCols - 1) : 0;
  const yStep = standardRows > 1 ? 74 / (standardRows - 1) : 0;
  const xStart = 12;
  const yStart = 12;
  
  for (let r = 0; r < standardRows; r++) {
    for (let c = 0; c < standardCols; c++) {
      if (!hiddenSeatIds.includes(currentId)) {
        standardMap.seats.push({
          id: currentId,
          groupId: c + 1,
          x: standardCols === 1 ? 50 : xStart + (c * xStep),
          y: standardRows === 1 ? 50 : yStart + (r * yStep),
          shape: 'horizontal'
        });
      }
      currentId++;
    }
  }

  const currentMap = layoutMode === 'GROUP' ? LAYOUT_HORIZONTAL :
                     layoutMode === 'EXAM' ? LAYOUT_VERTICAL :
                     layoutMode === 'CUSTOM' ? safeCustomMap :
                     standardMap;
                     
  // Globally persist static items positions across all modes!
  const [staticItems, setStaticItems] = useLocalStorage('auto_sa_global_static_items', LAYOUT_VERTICAL.staticItems);

  // We persist assignments, but initialize based on map if empty
  const [assignments, setAssignments] = useLocalStorage('auto_sa_assignments', []);

  // Initialize empty assignments if needed without adding mock students
  useEffect(() => {
    if (assignments.length === 0 && students.length > 0) {
      const initAss = LAYOUT_VERTICAL.seats.map((seat) => ({
        seatId: seat.id,
        student: null,
        isLocked: false
      }));
      setAssignments(initAss);
    }
  }, [assignments.length, students]);

  // Actions
  const handleAssign = () => {
    if (students.length === 0) {
      alert("請先上傳名單");
      return;
    }
    if (students.length > currentMap.seats.length) {
      alert(`座位數量不足！\n目前有 ${students.length} 位學生，但只有 ${currentMap.seats.length} 個座位。\n請切換至「一般模式」增加行列數，或移除部分學生。`);
      return;
    }
    
    setIsAssigning(true);
    // Push current assignments to history before changing
    setHistory(prev => [...prev, assignments].slice(-20)); // keep last 20
    
    // Slight timeout to allow UI to show assigning state if needed
    setTimeout(() => {
      const result = assignSeats(students, rules, currentMap, layoutMode, assignments);
      setAssignments(result);
      setIsAssigning(false);
    }, 50);
  };

  const undo = useCallback(() => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setAssignments(previous);
      setHistory(prev => prev.slice(0, -1));
    }
  }, [history, setAssignments]);

  const manualSwap = (seatId1, seatId2) => {
    setHistory(prev => [...prev, assignments].slice(-20));
    setAssignments(prev => {
      const newAss = [...prev];
      let idx1 = newAss.findIndex(a => a.seatId === seatId1);
      let idx2 = newAss.findIndex(a => a.seatId === seatId2);
      
      // If a seat doesn't have an assignment record yet (e.g., newly added custom seat), create it
      if (idx1 === -1) {
        newAss.push({ seatId: seatId1, student: null, isLocked: false });
        idx1 = newAss.length - 1;
      }
      if (idx2 === -1) {
        newAss.push({ seatId: seatId2, student: null, isLocked: false });
        idx2 = newAss.length - 1;
      }
      
      const temp = newAss[idx1].student;
      newAss[idx1].student = newAss[idx2].student;
      newAss[idx2].student = temp;
      
      return newAss;
    });
  };
  
  const toggleSeatLock = (seatId, forceState = null) => {
    setAssignments(prev => prev.map(a => 
      a.seatId === seatId ? { ...a, isLocked: forceState !== null ? forceState : !a.isLocked } : a
    ));
  };
  
  const assignStudentToSeat = (seatId, student) => {
    setHistory(prev => [...prev, assignments].slice(-20));
    setAssignments(prev => {
      const newAss = [...prev];
      
      const studentCurrentIdx = newAss.findIndex(a => a.student?.id === student.id);
      let targetIdx = newAss.findIndex(a => a.seatId === seatId);
      
      if (targetIdx === -1) {
        newAss.push({ seatId, student: null, isLocked: false });
        targetIdx = newAss.length - 1;
      }
      
      const occupant = newAss[targetIdx].student;
      
      if (studentCurrentIdx !== -1) {
        newAss[studentCurrentIdx].student = occupant;
      }
      
      newAss[targetIdx].student = student;
      newAss[targetIdx].isLocked = true;
      
      return newAss;
    });
  };
  
  // Custom Layout Methods
  const addCustomSeat = () => {
    setCustomMap(prev => {
      const seats = Array.isArray(prev?.seats) && prev.seats.length > 0 ? prev.seats : generateDefaultBlankSeats();
      const maxId = seats.reduce((max, s) => Math.max(max, s.id), 0);
      const newSeat = { id: maxId + 1, groupId: 0, x: 50, y: 50, shape: 'vertical' };
      return { ...prev, seats: [...seats, newSeat] };
    });
  };

  const addMultipleCustomSeats = (count) => {
    setCustomMap(prev => {
      const seats = Array.isArray(prev?.seats) && prev.seats.length > 0 ? prev.seats : generateDefaultBlankSeats();
      let maxId = seats.reduce((max, s) => Math.max(max, s.id), 0);
      const newSeats = [];
      for (let i = 0; i < count; i++) {
        maxId++;
        newSeats.push({ 
          id: maxId, 
          groupId: 0, 
          x: 35 + (i % 5) * 7.5, 
          y: 35 + Math.floor(i / 5) * 7.5, 
          shape: 'vertical' 
        });
      }
      return { ...prev, seats: [...seats, ...newSeats] };
    });
  };

  const updateCustomSeat = useCallback((seatId, changes) => {
    setCustomMap(prev => {
      const seats = Array.isArray(prev?.seats) && prev.seats.length > 0 ? prev.seats : generateDefaultBlankSeats();
      return {
        ...prev,
        seats: seats.map(s => s.id === seatId ? { ...s, ...changes } : s)
      };
    });
  }, [setCustomMap]);

  const deleteCustomSeat = (seatId) => {
    setCustomMap(prev => {
      const seats = Array.isArray(prev?.seats) ? prev.seats : [];
      return {
        ...prev,
        seats: seats.filter(s => s.id !== seatId)
      };
    });
    if (selectedSeatId === seatId) setSelectedSeatId(null);
  };
  
  const saveCustomStaticItems = () => {
    setCustomMap(prev => ({ ...prev, staticItems }));
  };

  const resetCustomMap = (count = 30) => {
    const fresh = {
      labels: [],
      seats: generateDefaultBlankSeats(count),
      staticItems: LAYOUT_VERTICAL.staticItems
    };
    setCustomMap(fresh);
    setSelectedSeatId(null);
  };

  const clearAllCustomGroups = () => {
    setCustomMap(prev => {
      const seats = Array.isArray(prev?.seats) && prev.seats.length > 0 ? prev.seats : generateDefaultBlankSeats();
      return {
        ...prev,
        seats: seats.map(s => ({ ...s, groupId: 0 }))
      };
    });
  };

  return {
    students, setStudents,
    assignments, setAssignments,
    rules, setRules,
    layoutMode, setLayoutMode,
    lastGroupMode, setLastGroupMode,
    standardRows, setStandardRows,
    standardCols, setStandardCols,
    hiddenSeatIds, setHiddenSeatIds,
    staticItems, setStaticItems,
    staticVisibility, setStaticVisibility,
    currentMap,
    customMap, setCustomMap,
    isAssigning,
    isEditingLayout, setIsEditingLayout,
    selectedSeatId, setSelectedSeatId,
    activeGroupBrush, setActiveGroupBrush,
    handleAssign,
    undo,
    canUndo: history.length > 0,
    manualSwap,
    toggleSeatLock,
    assignStudentToSeat,
    addCustomSeat,
    addMultipleCustomSeats,
    updateCustomSeat,
    deleteCustomSeat,
    saveCustomStaticItems,
    resetCustomMap,
    clearAllCustomGroups
  };
};
