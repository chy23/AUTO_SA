export const LAYOUT_HORIZONTAL = {
  seats: [
    { id: 1, groupId: 5, x: 15.0, y: 22.0, shape: 'vertical' },
    { id: 2, groupId: 5, x: 15.0, y: 34.6, shape: 'vertical' },
    { id: 3, groupId: 5, x: 15.0, y: 47.2, shape: 'horizontal' },
    { id: 6, groupId: 5, x: 28.1, y: 22.0, shape: 'vertical' },
    { id: 7, groupId: 5, x: 28.1, y: 47.2, shape: 'horizontal' },
    
    { id: 4, groupId: 4, x: 15.0, y: 59.8, shape: 'vertical' },
    { id: 5, groupId: 4, x: 15.0, y: 72.4, shape: 'vertical' },
    { id: 10, groupId: 4, x: 15.0, y: 85.0, shape: 'horizontal' },
    { id: 8, groupId: 4, x: 28.1, y: 59.8, shape: 'horizontal' },
    { id: 9, groupId: 4, x: 28.1, y: 85.0, shape: 'horizontal' },
    
    { id: 11, groupId: 3, x: 45.6, y: 59.8, shape: 'horizontal' },
    { id: 12, groupId: 3, x: 58.8, y: 59.8, shape: 'horizontal' },
    { id: 13, groupId: 3, x: 45.6, y: 85.0, shape: 'horizontal' },
    { id: 14, groupId: 3, x: 58.8, y: 85.0, shape: 'horizontal' },
    
    { id: 15, groupId: 1, x: 71.9, y: 22.0, shape: 'vertical' },
    { id: 21, groupId: 1, x: 85.0, y: 22.0, shape: 'vertical' },
    { id: 18, groupId: 1, x: 85.0, y: 34.6, shape: 'vertical' },
    { id: 16, groupId: 1, x: 71.9, y: 47.2, shape: 'horizontal' },
    { id: 22, groupId: 1, x: 85.0, y: 47.2, shape: 'horizontal' },
    
    { id: 19, groupId: 2, x: 71.9, y: 59.8, shape: 'horizontal' },
    { id: 23, groupId: 2, x: 85.0, y: 59.8, shape: 'vertical' },
    { id: 24, groupId: 2, x: 85.0, y: 72.4, shape: 'vertical' },
    { id: 17, groupId: 2, x: 71.9, y: 85.0, shape: 'horizontal' },
    { id: 20, groupId: 2, x: 85.0, y: 85.0, shape: 'horizontal' },
  ],
  labels: [
    { text: '5', x: 28.1, y: 34.6 },
    { text: '4', x: 28.1, y: 72.4 },
    { text: '3', x: 52.2, y: 72.4 },
    { text: '1', x: 71.9, y: 34.6 },
    { text: '2', x: 71.9, y: 72.4 },
  ],
  staticItems: [
    { id: 'front-door', name: '前門', x: 2.0, y: 22.0 },
    { id: 'back-corridor', name: '後走廊門', x: 95.0, y: 22.0 },
    { id: 'back-door', name: '後門', x: 2.0, y: 85.0 },
    { id: 'teacher', name: '導師', x: 58.8, y: 95.0 },
    { id: 'restroom', name: '廁所', x: 85.0, y: 95.0 }
  ]
};

export const LAYOUT_VERTICAL = {
  seats: [
    { id: 1, groupId: 5, x: 15.0, y: 22.0, shape: 'horizontal' },
    { id: 2, groupId: 5, x: 15.0, y: 34.6, shape: 'horizontal' },
    { id: 3, groupId: 5, x: 15.0, y: 47.2, shape: 'horizontal' },
    { id: 4, groupId: 4, x: 15.0, y: 59.8, shape: 'horizontal' },
    { id: 5, groupId: 4, x: 15.0, y: 72.4, shape: 'horizontal' },
    
    { id: 6, groupId: 5, x: 28.1, y: 22.0, shape: 'horizontal' },
    { id: 7, groupId: 5, x: 28.1, y: 34.6, shape: 'horizontal' },
    { id: 8, groupId: 4, x: 28.1, y: 47.2, shape: 'horizontal' },
    { id: 9, groupId: 4, x: 28.1, y: 59.8, shape: 'horizontal' },
    { id: 10, groupId: 4, x: 28.1, y: 72.4, shape: 'horizontal' },
    
    { id: 11, groupId: 3, x: 41.3, y: 22.0, shape: 'horizontal' },
    { id: 12, groupId: 3, x: 41.3, y: 34.6, shape: 'horizontal' },
    { id: 13, groupId: 3, x: 41.3, y: 47.2, shape: 'horizontal' },
    { id: 14, groupId: 3, x: 41.3, y: 59.8, shape: 'horizontal' },
    
    { id: 15, groupId: 1, x: 54.4, y: 22.0, shape: 'horizontal' },
    { id: 16, groupId: 1, x: 54.4, y: 34.6, shape: 'horizontal' },
    { id: 17, groupId: 2, x: 54.4, y: 47.2, shape: 'horizontal' },
    
    { id: 18, groupId: 1, x: 67.5, y: 22.0, shape: 'horizontal' },
    { id: 19, groupId: 2, x: 67.5, y: 34.6, shape: 'horizontal' },
    { id: 20, groupId: 2, x: 67.5, y: 47.2, shape: 'horizontal' },
    
    { id: 21, groupId: 1, x: 80.6, y: 22.0, shape: 'horizontal' },
    { id: 22, groupId: 1, x: 80.6, y: 34.6, shape: 'horizontal' },
    { id: 23, groupId: 2, x: 80.6, y: 47.2, shape: 'horizontal' },
    { id: 24, groupId: 2, x: 80.6, y: 59.8, shape: 'horizontal' },
  ],
  labels: [],
  staticItems: [
    { id: 'front-door', name: '前門', x: 2.0, y: 22.0 },
    { id: 'back-corridor', name: '後走廊門', x: 95.0, y: 22.0 },
    { id: 'back-door', name: '後門', x: 2.0, y: 85.0 },
    { id: 'teacher', name: '導師', x: 58.8, y: 95.0 },
    { id: 'restroom', name: '廁所', x: 85.0, y: 95.0 }
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
