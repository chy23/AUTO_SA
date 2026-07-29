export const SEAT_MAP = [
  // Group 1 (獨立座位 3, 相連: 17, 24, 13, 14)
  { id: 3, groupId: 1, x: 70, y: 15 },
  { id: 17, groupId: 1, x: 85, y: 10 },
  { id: 24, groupId: 1, x: 85, y: 25 },
  { id: 14, groupId: 1, x: 85, y: 40 },
  { id: 13, groupId: 1, x: 70, y: 40 },

  // Group 2 (獨立座位 21, 相連: 19, 11, 25, 9)
  { id: 21, groupId: 2, x: 70, y: 55 },
  { id: 19, groupId: 2, x: 85, y: 55 },
  { id: 11, groupId: 2, x: 85, y: 70 },
  { id: 25, groupId: 2, x: 85, y: 85 },
  { id: 9, groupId: 2, x: 70, y: 85 },

  // Group 3 (相連: 2, 8, 6, 18)
  { id: 2, groupId: 3, x: 40, y: 45 },
  { id: 8, groupId: 3, x: 55, y: 45 },
  { id: 6, groupId: 3, x: 40, y: 65 },
  { id: 18, groupId: 3, x: 55, y: 65 },

  // Group 4 (獨立座位 15, 相連: 12, 20, 16, 7)
  { id: 15, groupId: 4, x: 25, y: 50 },
  { id: 12, groupId: 4, x: 10, y: 50 },
  { id: 20, groupId: 4, x: 10, y: 65 },
  { id: 16, groupId: 4, x: 10, y: 80 },
  { id: 7, groupId: 4, x: 25, y: 80 },

  // Group 5 (獨立座位 1, 相連: 4, 10, 22, 23)
  { id: 1, groupId: 5, x: 25, y: 15 },
  { id: 4, groupId: 5, x: 10, y: 10 },
  { id: 10, groupId: 5, x: 10, y: 25 },
  { id: 22, groupId: 5, x: 10, y: 40 },
  { id: 23, groupId: 5, x: 25, y: 40 },
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
