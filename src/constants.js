export const SEAT_MAP = [
  // Group 5
  { id: 4, groupId: 5, col: 1, row: 1 },
  { id: 1, groupId: 5, col: 2, row: 1 },
  { id: 10, groupId: 5, col: 1, row: 2 },
  { id: 22, groupId: 5, col: 1, row: 3 },
  { id: 23, groupId: 5, col: 2, row: 3 },

  // Group 4
  { id: 12, groupId: 4, col: 1, row: 4 },
  { id: 15, groupId: 4, col: 2, row: 4 },
  { id: 20, groupId: 4, col: 1, row: 5 },
  { id: 16, groupId: 4, col: 1, row: 6 },
  { id: 7, groupId: 4, col: 2, row: 6 },

  // Group 3
  { id: 2, groupId: 3, col: 3, row: 4 },
  { id: 8, groupId: 3, col: 4, row: 4 },
  { id: 6, groupId: 3, col: 3, row: 5 },
  { id: 18, groupId: 3, col: 4, row: 5 },

  // Group 1
  { id: 3, groupId: 1, col: 5, row: 1 },
  { id: 17, groupId: 1, col: 6, row: 1 },
  { id: 24, groupId: 1, col: 6, row: 2 },
  { id: 13, groupId: 1, col: 5, row: 3 },
  { id: 14, groupId: 1, col: 6, row: 3 },

  // Group 2
  { id: 21, groupId: 2, col: 5, row: 4 },
  { id: 19, groupId: 2, col: 6, row: 4 },
  { id: 11, groupId: 2, col: 6, row: 5 },
  { id: 9, groupId: 2, col: 5, row: 6 },
  { id: 25, groupId: 2, col: 6, row: 6 },
];

export const GROUPS = [
  { id: 1, name: "第壹組" },
  { id: 2, name: "第二組" },
  { id: 3, name: "第三組" },
  { id: 4, name: "第四組" },
  { id: 5, name: "第五組" },
];

export const getAdjacencyList = () => {
  // 將視覺上上下左右相連的座位都列為相鄰 (隔壁)
  const adj = {};
  SEAT_MAP.forEach(s => (adj[s.id] = []));

  const addEdge = (a, b) => {
    if (!adj[a].includes(b)) adj[a].push(b);
    if (!adj[b].includes(a)) adj[b].push(a);
  };

  // Group 1 相鄰
  addEdge(17, 24);
  addEdge(24, 14);
  addEdge(14, 13);
  
  // Group 2 相鄰
  addEdge(19, 11);
  addEdge(11, 25);
  addEdge(25, 9);
  
  // Group 3 相鄰
  addEdge(2, 8);
  addEdge(2, 6);
  addEdge(8, 18);
  addEdge(6, 18);

  // Group 4 相鄰
  addEdge(12, 20);
  addEdge(20, 16);
  addEdge(16, 7);

  // Group 5 相鄰
  addEdge(4, 10);
  addEdge(10, 22);
  addEdge(22, 23);

  // 根據圖片，1, 3, 15, 21 沒有相鄰
  // 檢查是否有跨組相鄰：看起來組跟組之間都有走道，沒有直接相鄰
  return adj;
};

export const ADJACENCY_LIST = getAdjacencyList();
