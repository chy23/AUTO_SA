export const LAYOUT_HORIZONTAL = {
  seats: [
    // Group 5
    { id: 4, groupId: 5, x: 10, y: 15 },
    { id: 1, groupId: 5, x: 24, y: 15 },
    { id: 10, groupId: 5, x: 10, y: 30 },
    { id: 22, groupId: 5, x: 10, y: 45 },
    { id: 23, groupId: 5, x: 20, y: 45 },
    // Group 4
    { id: 12, groupId: 4, x: 10, y: 60 },
    { id: 15, groupId: 4, x: 24, y: 60 },
    { id: 20, groupId: 4, x: 10, y: 75 },
    { id: 16, groupId: 4, x: 10, y: 90 },
    { id: 7, groupId: 4, x: 20, y: 90 },
    // Group 3
    { id: 2, groupId: 3, x: 42, y: 60 },
    { id: 8, groupId: 3, x: 54, y: 60 },
    { id: 6, groupId: 3, x: 42, y: 75 },
    { id: 18, groupId: 3, x: 54, y: 75 },
    // Group 1
    { id: 3, groupId: 1, x: 74, y: 15 },
    { id: 17, groupId: 1, x: 86, y: 15 },
    { id: 24, groupId: 1, x: 86, y: 30 },
    { id: 13, groupId: 1, x: 76, y: 45 },
    { id: 14, groupId: 1, x: 86, y: 45 },
    // Group 2
    { id: 21, groupId: 2, x: 74, y: 60 },
    { id: 19, groupId: 2, x: 86, y: 60 },
    { id: 11, groupId: 2, x: 86, y: 75 },
    { id: 9, groupId: 2, x: 76, y: 90 },
    { id: 25, groupId: 2, x: 86, y: 90 },
  ],
  labels: [
    { text: '5', x: 20, y: 30 },
    { text: '4', x: 20, y: 75 },
    { text: '3', x: 48, y: 67 },
    { text: '1', x: 76, y: 30 },
    { text: '2', x: 76, y: 75 },
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
    { id: 25, groupId: 2, x: 10, y: 15 }, { id: 17, groupId: 1, x: 10, y: 30 }, { id: 4, groupId: 5, x: 10, y: 45 }, { id: 12, groupId: 4, x: 10, y: 60 }, { id: 20, groupId: 4, x: 10, y: 75 },
    { id: 3, groupId: 1, x: 25, y: 15 }, { id: 10, groupId: 5, x: 25, y: 30 }, { id: 21, groupId: 2, x: 25, y: 45 }, { id: 13, groupId: 1, x: 25, y: 60 }, { id: 22, groupId: 5, x: 25, y: 75 },
    { id: 6, groupId: 3, x: 40, y: 15 }, { id: 23, groupId: 5, x: 40, y: 30 }, { id: 16, groupId: 4, x: 40, y: 45 }, { id: 9, groupId: 2, x: 40, y: 60 },
    { id: 2, groupId: 3, x: 55, y: 15 }, { id: 8, groupId: 3, x: 55, y: 30 }, { id: 11, groupId: 2, x: 55, y: 45 },
    { id: 18, groupId: 3, x: 70, y: 15 }, { id: 15, groupId: 4, x: 70, y: 30 }, { id: 7, groupId: 4, x: 70, y: 45 },
    { id: 24, groupId: 1, x: 85, y: 15 }, { id: 14, groupId: 1, x: 85, y: 30 }, { id: 19, groupId: 2, x: 85, y: 45 }, { id: 1, groupId: 5, x: 85, y: 60 },
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

export const GROUP_LABELS = [
  { text: '5', col: '2', row: '2' },
  { text: '1', col: '5', row: '2' },
  { text: '4', col: '2', row: '5' },
  { text: '2', col: '5', row: '5' },
  // Box 3 is exactly between col 3,4 and row 4,5
  { text: '3', col: '3 / span 2', row: '4 / span 2', customStyle: { margin: 'auto' } },
];

export const STATIC_LABELS = [
  { text: '前門', style: { top: '0', left: '-80px', width: '50px', height: '100px', writingMode: 'vertical-rl', textOrientation: 'upright' } },
  { text: '後走廊門', style: { top: '0', right: '-80px', width: '50px', height: '100px', writingMode: 'vertical-rl', textOrientation: 'upright' } },
  { text: '後門', style: { bottom: '0', left: '-80px', width: '50px', height: '100px', writingMode: 'vertical-rl', textOrientation: 'upright' } },
  { text: '導師', style: { bottom: '-60px', right: '150px', width: '150px', height: '40px' } },
  { text: '廁所', style: { bottom: '-60px', right: '0', width: '80px', height: '40px' } }
];

export const getAdjacencyList = () => {
  // 將視覺上上下左右相連的座位都列為相鄰 (隔壁)
  const adj = {};
  LAYOUT_HORIZONTAL.seats.forEach(s => (adj[s.id] = []));

  const addEdge = (a, b) => {
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  };

  // Group 1 相鄰
  addEdge(17, 3);
  addEdge(3, 24);
  addEdge(24, 18);
  addEdge(14, 18);
  addEdge(14, 13);
  
  // Group 2 相鄰
  addEdge(25, 21);
  addEdge(21, 19);
  addEdge(19, 11);
  addEdge(11, 7);
  addEdge(9, 11);

  // Group 3 相鄰
  addEdge(6, 2);
  addEdge(2, 8);
  addEdge(8, 18);

  // Group 4 相鄰
  addEdge(12, 15);
  addEdge(15, 20);
  addEdge(20, 16);
  addEdge(16, 7);

  // Group 5 相鄰
  addEdge(4, 10);
  addEdge(10, 23);
  addEdge(23, 1);
  addEdge(1, 22);

  return adj;
};

export const ADJACENCY_LIST = getAdjacencyList();
