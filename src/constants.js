export const SEAT_MAP = [
  // Col 1
  { id: 25, groupId: 2, col: 1, row: 1 },
  { id: 17, groupId: 1, col: 1, row: 2 },
  { id: 4, groupId: 5, col: 1, row: 3 },
  { id: 12, groupId: 4, col: 1, row: 4 },
  { id: 20, groupId: 4, col: 1, row: 5 },
  { id: 22, groupId: 5, col: 1, row: 6 },

  // Col 2
  { id: 3, groupId: 1, col: 2, row: 1 },
  { id: 10, groupId: 5, col: 2, row: 3 },
  { id: 21, groupId: 2, col: 2, row: 4 },
  { id: 13, groupId: 1, col: 2, row: 6 },

  // Col 3
  { id: 6, groupId: 3, col: 3, row: 4 },
  { id: 16, groupId: 4, col: 3, row: 5 },

  // Col 4
  { id: 23, groupId: 5, col: 4, row: 4 },
  { id: 9, groupId: 2, col: 4, row: 5 },

  // Col 5
  { id: 2, groupId: 3, col: 5, row: 1 },
  { id: 8, groupId: 3, col: 5, row: 3 },
  { id: 15, groupId: 4, col: 5, row: 4 },
  { id: 11, groupId: 2, col: 5, row: 6 },

  // Col 6
  { id: 24, groupId: 1, col: 6, row: 1 },
  { id: 18, groupId: 3, col: 6, row: 2 },
  { id: 14, groupId: 1, col: 6, row: 3 },
  { id: 19, groupId: 2, col: 6, row: 4 },
  { id: 1, groupId: 5, col: 6, row: 5 },
  { id: 7, groupId: 4, col: 6, row: 6 },
];

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
  SEAT_MAP.forEach(s => (adj[s.id] = []));

  const addEdge = (a, b) => {
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  };

  // Group 1 相鄰 (Based on Image 2)
  addEdge(17, 3);
  addEdge(3, 24);
  addEdge(24, 18);
  addEdge(14, 18);
  addEdge(14, 13);
  
  // Group 2 相鄰 (Based on Image 2)
  addEdge(25, 21);
  addEdge(21, 19);
  addEdge(19, 11);
  addEdge(11, 7);
  addEdge(9, 11);

  // Group 3 相鄰 (Based on Image 2)
  addEdge(6, 2);
  addEdge(2, 8);
  addEdge(8, 18);

  // Group 4 相鄰 (Based on Image 2)
  addEdge(12, 15);
  addEdge(15, 20);
  addEdge(20, 16);
  addEdge(16, 7);

  // Group 5 相鄰 (Based on Image 2)
  addEdge(4, 10);
  addEdge(10, 23);
  addEdge(23, 1);
  addEdge(1, 22);

  // 根據圖片，1, 3, 15, 21 沒有相鄰
  // 檢查是否有跨組相鄰：看起來組跟組之間都有走道，沒有直接相鄰
  return adj;
};

export const ADJACENCY_LIST = getAdjacencyList();
