import { ADJACENCY_LIST } from '../constants';

const buildAdjacencyList = (seats) => {
  const adj = {};
  seats.forEach(s => (adj[s.id] = []));
  
  for (let i = 0; i < seats.length; i++) {
    for (let j = i + 1; j < seats.length; j++) {
      const dx = Math.abs(seats[i].x - seats[j].x);
      const dy = Math.abs(seats[i].y - seats[j].y);
      // Allow a small margin (3%) for alignment imperfections during custom dragging
      if ((dx < 3 && dy < 16) || (dy < 3 && dx < 16)) {
        adj[seats[i].id].push(seats[j].id);
        adj[seats[j].id].push(seats[i].id);
      }
    }
  }
  return adj;
};

export const evaluateAssignment = (assignment, rules, currentMap) => {
  let penalty = 0;
  const getSeat = id => currentMap.seats.find(s => s.id === id);
  const adjacencyList = buildAdjacencyList(currentMap.seats);
  
  rules.forEach(rule => {
    if (!rule.students) return;
    const items = rule.students.map(studentId => 
      assignment.find(a => a.student?.name === studentId || a.student?.id === studentId)
    ).filter(Boolean);

    if (items.length < 2) return;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const seat1 = getSeat(items[i].seatId);
        const seat2 = getSeat(items[j].seatId);
        if (!seat1 || !seat2) continue;
        
        const g1 = seat1.groupId || 0;
        const g2 = seat2.groupId || 0;
        if (rule.type === 'NOT_SAME_GROUP' && g1 > 0 && g2 > 0 && g1 === g2) penalty += 1000;
        if (rule.type === 'SAME_GROUP' && (g1 === 0 || g2 === 0 || g1 !== g2)) penalty += 1000;
        
        const isAdjacent = adjacencyList[seat1.id]?.includes(seat2.id);
        if (rule.type === 'NOT_ADJACENT' && isAdjacent) penalty += 1000;
        if (rule.type === 'ADJACENT' && !isAdjacent) penalty += 1000;
      }
    }
  });
  return penalty;
};

export const assignSeats = (students, rules, currentMap, layoutMode, previousAssignments) => {
  if (students.length === 0) return [];
  
  const totalSeats = currentMap.seats.length;
  
  // Find locked assignments
  const lockedAssignments = previousAssignments ? previousAssignments.filter(a => a.isLocked) : [];
  const lockedSeatIds = lockedAssignments.map(a => a.seatId);
  const lockedStudentIds = lockedAssignments.map(a => a.student?.id).filter(Boolean);
  
  // Remaining students to assign
  const remainingStudents = students.filter(s => !lockedStudentIds.includes(s.id));
  let studentIndex = 0;
  
  // Build the initial assignment respecting locked seats
  let currentAssignment = currentMap.seats.map(seat => {
    const lockedAss = lockedAssignments.find(a => a.seatId === seat.id);
    if (lockedAss) return { ...lockedAss };
    
    // Assign a remaining student if available
    const student = studentIndex < remainingStudents.length ? remainingStudents[studentIndex++] : null;
    return {
      seatId: seat.id,
      student,
      isLocked: false
    };
  });
  
  // Determine swappable indices
  let swappableIndices = [];
  currentAssignment.forEach((ass, index) => {
    if (!ass.isLocked) {
      swappableIndices.push(index);
    }
  });
  
  // In STANDARD mode, lock the trailing empty seats to the back
  if (layoutMode === 'STANDARD' && totalSeats > students.length) {
    const numEmpty = totalSeats - students.length;
    // Remove the last 'numEmpty' unlocked indices from swappable list
    // Wait, since some seats might be locked, we shouldn't just remove from swappableIndices.
    // To simplify, if it's standard mode, we keep empty seats at the end of the swappable pool.
    // For now, we will sort swappable indices to push empty seats to the end, then remove them from swappable list.
    let emptyCount = 0;
    for (let i = swappableIndices.length - 1; i >= 0 && emptyCount < numEmpty; i--) {
       const idx = swappableIndices[i];
       if (currentAssignment[idx].student === null) {
          swappableIndices.splice(i, 1);
          emptyCount++;
       }
    }
  }

  // Initial shuffle among swappable indices
  for (let i = swappableIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const idx1 = swappableIndices[i];
    const idx2 = swappableIndices[j];
    [currentAssignment[idx1].student, currentAssignment[idx2].student] = 
    [currentAssignment[idx2].student, currentAssignment[idx1].student];
  }

  let currentScore = evaluateAssignment(currentAssignment, rules, currentMap);
  let bestAssignment = [...currentAssignment];
  let bestScore = currentScore;

  const iterations = 5000;
  if (swappableIndices.length >= 2) {
    for (let i = 0; i < iterations; i++) {
      if (bestScore === 0) break;
      
      const newAssignment = [...currentAssignment];
      const r1 = Math.floor(Math.random() * swappableIndices.length);
      const r2 = Math.floor(Math.random() * swappableIndices.length);
      const idx1 = swappableIndices[r1];
      const idx2 = swappableIndices[r2];
      
      const temp = newAssignment[idx1].student;
      newAssignment[idx1].student = newAssignment[idx2].student;
      newAssignment[idx2].student = temp;

      const newScore = evaluateAssignment(newAssignment, rules, currentMap);

      if (newScore < currentScore) {
        currentAssignment = newAssignment;
        currentScore = newScore;
        if (newScore < bestScore) {
          bestAssignment = [...newAssignment];
          bestScore = newScore;
        }
      } else {
        const p = Math.exp((currentScore - newScore) / (100 / (i + 1)));
        if (Math.random() < p) {
          currentAssignment = newAssignment;
          currentScore = newScore;
        }
      }
    }
  }
  return bestAssignment;
};
