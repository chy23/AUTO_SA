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
  const [layoutMode, setLayoutMode] = useLocalStorage('auto_sa_layout_mode', 'GROUP');
  const [lastGroupMode, setLastGroupMode] = useLocalStorage('auto_sa_last_group_mode', 'GROUP');
  const [standardRows, setStandardRows] = useLocalStorage('auto_sa_std_rows', 6);
  const [standardCols, setStandardCols] = useLocalStorage('auto_sa_std_cols', 5);
  const [hiddenSeatIds, setHiddenSeatIds] = useLocalStorage('auto_sa_hidden_seats', []);
  const [staticVisibility, setStaticVisibility] = useLocalStorage('auto_sa_static_vis', {
    'front-door': true, 'back-corridor': true, 'back-door': true, 'teacher': true, 'restroom': true
  });
  
  const generateDefaultBlankSeats = () => {
    const seats = [];
    for (let i = 0; i < 30; i++) {
      seats.push({
        id: i + 1,
        groupId: 0,
        x: 20 + (i % 6) * 12, // 6 columns
        y: 25 + Math.floor(i / 6) * 14, // 5 rows
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
                     
  const [staticItems, setStaticItems] = useState(currentMap.staticItems || LAYOUT_VERTICAL.staticItems);

  // We persist assignments, but initialize based on map if empty
  const [assignments, setAssignments] = useLocalStorage('auto_sa_assignments', []);

  // Initialize empty assignments if needed without adding mock students
  useEffect(() => {
    if (assignments.length === 0 && students.length > 0) {
      const initAss = LAYOUT_VERTICAL.seats.map((seat, index) => ({
        seatId: seat.id,
        student: students[index] || null,
        isLocked: false
      }));
      setAssignments(initAss);
    }
  }, [assignments.length, students]);
  
  // When layoutMode changes, reset static items to default positions of that mode
  useEffect(() => {
    const defaultStatic = (safeCustomMap && safeCustomMap.staticItems) ? safeCustomMap.staticItems : LAYOUT_VERTICAL.staticItems;
    setStaticItems(layoutMode === 'GROUP' ? LAYOUT_HORIZONTAL.staticItems : 
                   layoutMode === 'EXAM' ? LAYOUT_VERTICAL.staticItems : 
                   layoutMode === 'CUSTOM' ? defaultStatic :
                   LAYOUT_VERTICAL.staticItems);
  }, [layoutMode, customMap?.staticItems]);

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
      const idx1 = newAss.findIndex(a => a.seatId === seatId1);
      const idx2 = newAss.findIndex(a => a.seatId === seatId2);
      if (idx1 !== -1 && idx2 !== -1) {
        const temp = newAss[idx1].student;
        newAss[idx1].student = newAss[idx2].student;
        newAss[idx2].student = temp;
      }
      return newAss;
    });
  };
  
  const toggleSeatLock = (seatId) => {
    setAssignments(prev => prev.map(a => 
      a.seatId === seatId ? { ...a, isLocked: !a.isLocked } : a
    ));
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
          x: 35 + (i % 5) * 6, 
          y: 35 + Math.floor(i / 5) * 6, 
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

  const resetCustomMap = () => {
    const fresh = {
      labels: [],
      seats: generateDefaultBlankSeats(),
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
    addCustomSeat,
    addMultipleCustomSeats,
    updateCustomSeat,
    deleteCustomSeat,
    saveCustomStaticItems,
    resetCustomMap,
    clearAllCustomGroups
  };
};
