const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '../src/data/changelog.json');
let changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf8'));

const translations = {
  "implement automated changelog modal fetching last 50 commits": "實作自動抓取前 50 次提交紀錄的更新紀錄對話窗",
  "move modal CSS styles to App.css so ManualAssignModal renders correctly in the center": "將對話窗樣式移至全域，修復指定學生視窗無法置中的排版問題",
  "leave seats empty on student list upload to allow manual pre-assignment before auto-assignment": "匯入名單後預設清空座位，讓使用者能在自動排座前「手動指定並鎖定」特定學生",
  "missing onClearEdit prop caused edited rules to remain in edit state, and allow editing from modal rule list": "修復規則儲存後編輯狀態未清除的異常，並支援在對話窗內直接點擊列表進行編輯",
  "syntax error due to missing closing div in RuleBuilderModal": "修復對話窗的語法渲染錯誤",
  "keep RuleBuilderModal open after saving to allow continuous addition of rules without reopening": "優化體驗：儲存規則後對話窗會保持開啟，方便老師連續建立多筆規則",
  "support editing existing seating rules by clicking on them": "支援直接點擊側邊欄的條件列表來修改現有規則",
  "allow clicking any seat to manually assign and lock a student from a searchable list before auto-assignment": "實作「指定學生至座位」功能：點擊空座位即可搜尋並綁定學生",
  "dark mode text color invisible in RuleBuilderModal student selection grid": "修復深色模式下，對話窗學生網格文字顏色太暗看不見的問題",
  "adjacency constraints failing in sparse/custom grids by replacing hardcoded threshold with nearest-neighbor detection": "升級排座演算法：導入最近鄰居 (Nearest-Neighbor) 偵測，修復自定義版面中「相鄰」條件判定失效的問題",
  "only show layout toggle button in group/exam modes, removing it from standard mode as well": "優化介面：只在小組與個人考試模式顯示版面切換按鈕",
  "hide layout toggle button in custom mode": "優化介面：在自定義版面隱藏不必要的版面切換按鈕",
  "add spacing constraint to prevent adjacent seats from belonging to the same group in custom mode auto-generation": "優化自定義版面小組自動生成：加入間距限制，避免相鄰座位被分配到同一個小組",
  "support grouping in custom mode by automatically dividing students into groups of 4 based on spatial proximity using K-Means clustering": "升級自定義版面：導入 K-Means 機器學習分群演算法，能根據座位的空間距離自動將座位分配成 4 人一組",
  "add visual indicators and group badges for custom mode to easily see student groups": "為自定義版面加入視覺標示與小組號碼牌，讓分組狀態一目瞭然",
  "support double-clicking seats to rotate them in custom mode": "支援在自定義版面中「雙擊座位」來快速旋轉座位方向",
  "add missing removeRule functionality from useSeating hook": "修復刪除排座條件按鈕沒有反應的問題",
  "ensure empty seats without a group aren't included in group validation penalties": "修復排座演算法：確保沒有組別的空座位不會錯誤地被計入「必須同組」的違規扣分中",
  "render correct group badges for different modes and fix standard mode layout": "修復不同模式下的小組標籤渲染，並優化一般模式的版面顯示",
  "support custom mode grid dragging and auto-align feature": "實作自定義版面：支援自由拖曳座位，以及加入智慧對齊網格功能",
  "add floating widget for custom layout mode configuration": "為自定義版面加入懸浮設定工具列",
  "fix button layouts in sidebar": "優化側邊欄按鈕排版",
  "add dynamic layout switching between group, exam, custom and standard modes": "支援在小組、考試、自定義與一般模式之間進行動態版面切換",
  "implement full layout generation logic for group mode and standard modes": "實作小組模式與一般模式的自動排版邏輯",
  "add UI components for Sidebar, ClassroomArea and modals": "新增側邊欄、教室主要區域與設定對話窗等核心介面元件",
  "add fetch-depth 0 to GitHub Actions checkout to fetch full git history for changelog generation": "修正 GitHub Actions 部署設定，確保更新紀錄能抓取到完整的歷史資料",
  "dynamically fetch changelog to preserve initial 50 commits and append future updates": "優化更新紀錄抓取邏輯：永久保留最初的 50 筆紀錄並動態疊加未來所有的更新"
};

const detailTranslations = {
  "implement automated changelog modal fetching last 50 commits": "實作自動抓取前 50 次提交紀錄的更新紀錄對話窗，並自動將紀錄透過精美時間軸呈現，系統會在每次部署時自動抓取最新進度。",
  "leave seats empty on student list upload to allow manual pre-assignment before auto-assignment": "為了讓老師能事先把特定學生安排在特殊座位（例如講桌旁），現在匯入名單後不再立刻自動排滿，而是留空讓老師先綁定特定座位後，再執行自動排座。",
  "adjacency constraints failing in sparse/custom grids by replacing hardcoded threshold with nearest-neighbor detection": "過去的演算法使用固定像素距離來判斷是否相鄰，導致在老師自己隨意拉動座位的「自定義版面」中判斷常常失準。現在升級為 Nearest-Neighbor 動態偵測，能精準找出每個座位周遭的鄰居，讓「不能相鄰」與「必須相鄰」的條件在任何畸形版面都能完美生效！",
  "support grouping in custom mode by automatically dividing students into groups of 4 based on spatial proximity using K-Means clustering": "在自定義版面中，老師排出的形狀可能千奇百怪。為了能自動分配小組號碼，我們導入了 K-Means 機器學習分群演算法，它會分析畫面上所有座位的 X, Y 座標，聰明地將距離相近的座位聚集成 4 人一組的小組！"
};

changelog.forEach(entry => {
  const originalTitle = entry.title;
  if (translations[originalTitle]) {
    entry.title = translations[originalTitle];
  }
  
  if (detailTranslations[originalTitle]) {
    entry.details = detailTranslations[originalTitle];
  } else if (!entry.details) {
    entry.details = "優化了系統內部穩定性與細節操作體驗。";
  }
});

fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2), 'utf8');
console.log('Changelog translated!');
