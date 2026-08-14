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
  "dynamically fetch changelog to preserve initial 50 commits and append future updates": "優化更新紀錄抓取邏輯：永久保留最初的 50 筆紀錄並動態疊加未來所有的更新",
  "correct import error in changelog generator that caused manual translations to be overwritten": "修復腳本錯誤：解決更新紀錄在雲端部署時意外覆蓋翻譯紀錄的問題",
  "UI: change changelog button text to '更新紀錄'": "優化介面：將標題旁的版本號按鈕文字改為「更新紀錄」",
  "add clear seats button to allow clearing assignments without removing students": "新增「清空座位」功能：支援一鍵清除所有已排好的座位，但保留學生名單",
  "UI: set default layout to standard mode and reorder mode buttons with rename to U型小組模式": "優化介面：設定初次載入預設為「一般模式」，並將小組模式移至最後且更名為「U型小組模式」",
  "UI: add step-by-step usage guide for custom mode in sidebar": "新增教學：在自定義模式的側邊欄加入簡單 5 步驟的使用流程引導",
  "UI: change custom mode add seats to use a numeric input field for adding multiple seats at once": "優化介面：自定義模式改為「座位總數」輸入框，支援一口氣新增指定數量的座位",
  "UI: change custom mode seat input to set total seats instead of adding incrementally": "升級排版功能：自定義模式可直接輸入「座位總數」，系統會自動重新產生方正網格排列",
  "automatically exit edit layout mode when switching between layout modes to prevent dragging seats in standard modes": "修復切換模式的錯誤：現在切換版面時會自動退出編輯狀態，避免在一般模式下座位也能被拖曳的問題"
};

const detailTranslations = {
  "implement automated changelog modal fetching last 50 commits": "實作自動抓取前 50 次提交紀錄的更新紀錄對話窗，並自動將紀錄透過精美時間軸呈現，系統會在每次部署時自動抓取最新進度。",
  "leave seats empty on student list upload to allow manual pre-assignment before auto-assignment": "為了讓老師能事先把特定學生安排在特殊座位（例如講桌旁），現在匯入名單後不再立刻自動排滿，而是留空讓老師先綁定特定座位後，再執行自動排座。",
  "adjacency constraints failing in sparse/custom grids by replacing hardcoded threshold with nearest-neighbor detection": "過去的演算法使用固定像素距離來判斷是否相鄰，導致在老師自己隨意拉動座位的「自定義版面」中判斷常常失準。現在升級為 Nearest-Neighbor 動態偵測，能精準找出每個座位周遭的鄰居，讓「不能相鄰」與「必須相鄰」的條件在任何畸形版面都能完美生效！",
  "support grouping in custom mode by automatically dividing students into groups of 4 based on spatial proximity using K-Means clustering": "在自定義版面中，老師排出的形狀可能千奇百怪。為了能自動分配小組號碼，我們導入了 K-Means 機器學習分群演算法，它會分析畫面上所有座位的 X, Y 座標，聰明地將距離相近的座位聚集成 4 人一組的小組！",
  "add clear seats button to allow clearing assignments without removing students": "在側邊欄加入紅色的「清空座位」按鈕，當老師想要重新手動安排或覺得排出來的座位不滿意時，可以直接把所有排好的座位一鍵清空，且不會刪除原本已經匯入的學生名單，省去重新上傳的麻煩。",
  "新增「清空座位」功能：支援一鍵清除所有已排好的座位，但保留學生名單": "在側邊欄加入紅色的「清空座位」按鈕，當老師想要重新手動安排或覺得排出來的座位不滿意時，可以直接把所有排好的座位一鍵清空，且不會刪除原本已經匯入的學生名單，省去重新上傳的麻煩。",
  "UI: set default layout to standard mode and reorder mode buttons with rename to U型小組模式": "將網站初次開啟時的預設版面改為最常用的「一般模式」，並將右上角的版面切換按鈕依序調整為「一般模式、自定義模式、U型小組模式」，同時將小組模式更名，使其更貼近實際排版形狀。",
  "優化介面：設定初次載入預設為「一般模式」，並將小組模式移至最後且更名為「U型小組模式」": "將網站初次開啟時的預設版面改為最常用的「一般模式」，並將右上角的版面切換按鈕依序調整為「一般模式、自定義模式、U型小組模式」，同時將小組模式更名，使其更貼近實際排版形狀。",
  "UI: add step-by-step usage guide for custom mode in sidebar": "在「自定義模式」的側邊欄最上方新增了一個醒目的「簡單 5 步驟」提示區塊，明確引導使用者如何點擊編輯、新增座位、拖曳排版、使用筆刷分組，最後完成入座的完整流程。",
  "新增教學：在自定義模式的側邊欄加入簡單 5 步驟的使用流程引導": "在「自定義模式」的側邊欄最上方新增了一個醒目的「簡單 5 步驟」提示區塊，明確引導使用者如何點擊編輯、新增座位、拖曳排版、使用筆刷分組，最後完成入座的完整流程。",
  "UI: change custom mode add seats to use a numeric input field for adding multiple seats at once": "將自定義模式中原本固定的「+1」和「+5」新增座位按鈕，升級為一個可自由輸入數字的輸入框，讓老師可以直接輸入想要的座位數量（例如 30），點擊後即可一次產生對應數量的座位。",
  "優化介面：自定義模式改為「座位總數」輸入框，支援一口氣新增指定數量的座位": "將自定義模式中原本固定的「+1」和「+5」新增座位按鈕，升級為一個可自由輸入數字的輸入框，讓老師可以直接輸入想要的座位數量（例如 30），點擊後即可一次產生對應數量的座位。",
  "UI: change custom mode seat input to set total seats instead of adding incrementally": "大幅優化自定義模式的座位產生邏輯：現在改為直接輸入「座位總數」，點擊重新產生後，系統會自動將該數量的座位排列成完美的方正網格陣型，大幅減少老師手動把座位排整齊的時間！",
  "升級排版功能：自定義模式可直接輸入「座位總數」，系統會自動重新產生方正網格排列": "大幅優化自定義模式的座位產生邏輯：現在改為直接輸入「座位總數」，點擊重新產生後，系統會自動將該數量的座位排列成完美的方正網格陣型，大幅減少老師手動把座位排整齊的時間！",
  "automatically exit edit layout mode when switching between layout modes to prevent dragging seats in standard modes": "修復了一個系統邏輯錯誤：原本在自定義模式開啟「編輯」後若直接切換到其他模式，編輯狀態並未解除，導致一般模式的座位也能被意外拖曳。現在切換任何模式都會自動退出編輯狀態，確保系統穩定。",
  "修復切換模式的錯誤：現在切換版面時會自動退出編輯狀態，避免在一般模式下座位也能被拖曳的問題": "修復了一個系統邏輯錯誤：原本在自定義模式開啟「編輯」後若直接切換到其他模式，編輯狀態並未解除，導致一般模式的座位也能被意外拖曳。現在切換任何模式都會自動退出編輯狀態，確保系統穩定。"
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
