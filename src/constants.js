export const LAYOUT_HORIZONTAL = {
  seats: [
    { id: 1, groupId: 5, x: 10, y: 15 },
    { id: 2, groupId: 5, x: 10, y: 30 },
    { id: 3, groupId: 5, x: 10, y: 45 },
    { id: 6, groupId: 5, x: 25, y: 15 },
    { id: 7, groupId: 5, x: 25, y: 45 },
    
    { id: 4, groupId: 4, x: 10, y: 60 },
    { id: 5, groupId: 4, x: 10, y: 75 },
    { id: 10, groupId: 4, x: 10, y: 90 },
    { id: 8, groupId: 4, x: 25, y: 60 },
    { id: 9, groupId: 4, x: 25, y: 90 },
    
    { id: 11, groupId: 3, x: 45, y: 60 },
    { id: 12, groupId: 3, x: 60, y: 60 },
    { id: 13, groupId: 3, x: 45, y: 90 },
    { id: 14, groupId: 3, x: 60, y: 90 },
    
    { id: 15, groupId: 1, x: 75, y: 15 },
    { id: 21, groupId: 1, x: 90, y: 15 },
    { id: 18, groupId: 1, x: 90, y: 30 },
    { id: 16, groupId: 1, x: 75, y: 45 },
    { id: 22, groupId: 1, x: 90, y: 45 },
    
    { id: 19, groupId: 2, x: 75, y: 60 },
    { id: 23, groupId: 2, x: 90, y: 60 },
    { id: 24, groupId: 2, x: 90, y: 75 },
    { id: 17, groupId: 2, x: 75, y: 90 },
    { id: 20, groupId: 2, x: 90, y: 90 },
  ],
  labels: [
    { text: '5', x: 25, y: 30 },
    { text: '4', x: 25, y: 75 },
    { text: '3', x: 52.5, y: 75 },
    { text: '1', x: 75, y: 30 },
    { text: '2', x: 75, y: 75 },
  ],
  staticItems: [
    { id: 'front-door', name: '前門', x: 2, y: 15 },
    { id: 'back-corridor', name: '後走廊門', x: 95, y: 15 },
    { id: 'back-door', name: '後門', x: 2, y: 90 },
    { id: 'teacher', name: '導師', x: 60, y: 95 },
    { id: 'restroom', name: '廁所', x: 90, y: 95 }
  ]
};

export const LAYOUT_VERTICAL = {
  seats: [
    { id: 1, groupId: 5, x: 10, y: 15 },
    { id: 2, groupId: 5, x: 10, y: 30 },
    { id: 3, groupId: 5, x: 10, y: 45 },
    { id: 4, groupId: 4, x: 10, y: 60 },
    { id: 5, groupId: 4, x: 10, y: 75 },
    
    { id: 6, groupId: 5, x: 25, y: 15 },
    { id: 7, groupId: 5, x: 25, y: 30 },
    { id: 8, groupId: 4, x: 25, y: 45 },
    { id: 9, groupId: 4, x: 25, y: 60 },
    { id: 10, groupId: 4, x: 25, y: 75 },
    
    { id: 11, groupId: 3, x: 40, y: 15 },
    { id: 12, groupId: 3, x: 40, y: 30 },
    { id: 13, groupId: 3, x: 40, y: 45 },
    { id: 14, groupId: 3, x: 40, y: 60 },
    
    { id: 15, groupId: 1, x: 55, y: 15 },
    { id: 16, groupId: 1, x: 55, y: 30 },
    { id: 17, groupId: 2, x: 55, y: 45 },
    
    { id: 18, groupId: 1, x: 70, y: 15 },
    { id: 19, groupId: 2, x: 70, y: 30 },
    { id: 20, groupId: 2, x: 70, y: 45 },
    
    { id: 21, groupId: 1, x: 85, y: 15 },
    { id: 22, groupId: 1, x: 85, y: 30 },
    { id: 23, groupId: 2, x: 85, y: 45 },
    { id: 24, groupId: 2, x: 85, y: 60 },
  ],
  labels: [],
  staticItems: [
    { id: 'front-door', name: '前門', x: 2, y: 15 },
    { id: 'back-corridor', name: '後走廊門', x: 95, y: 15 },
    { id: 'back-door', name: '後門', x: 2, y: 90 },
    { id: 'teacher', name: '導師', x: 60, y: 95 },
    { id: 'restroom', name: '廁所', x: 90, y: 95 }
  ]
};

export const GROUPS = [
  { id: 1, name: "第壹組" },
  { id: 2, name: "第二組" },
  { id: 3, name: "第三組" },
  { id: 4, name: "第四組" },
  { id: 5, name: "第五組" },
];

export const getAdjacencyList = () => {
  const adj = {};
  LAYOUT_HORIZONTAL.seats.forEach(s => (adj[s.id] = []));

  const addEdge = (a, b) => {
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  };
  
  const seats = LAYOUT_HORIZONTAL.seats;
  for (let i = 0; i < seats.length; i++) {
    for (let j = i + 1; j < seats.length; j++) {
      const dx = Math.abs(seats[i].x - seats[j].x);
      const dy = Math.abs(seats[i].y - seats[j].y);
      // If they are exactly adjacent vertically or horizontally in group layout
      if ((dx === 0 && dy === 15) || (dx === 15 && dy === 0)) {
        addEdge(seats[i].id, seats[j].id);
      }
    }
  }
  return adj;
};

export const ADJACENCY_LIST = getAdjacencyList();
