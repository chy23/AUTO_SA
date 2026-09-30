## Design review: 智慧教室座位分配系統 (Seat Assignment System)

### Summary
Overall rating: **Needs work (需改進)**。
本專案的設計主軸 (Thesis) 是一個強大且專業的排座工具，其最令人印象深刻的視覺特徵是帶有玻璃擬物化 (Glassmorphism) 的側邊欄與發光的「自動排座」按鈕。然而，目前系統在深色模式下表現良好，但在「淺色主題 (Light Theme)」的實作上存在明顯的對比度與層次失效問題，且部分硬編碼的色彩破壞了跨主題的一致性。

### Critical
- **淺色模式層次失效 (Light Mode Hierarchy Breakdown)**
  - **What**: 在 `App.css` 中，`.panel` 與 `details.accordion-panel` 的背景被硬編碼為 `rgba(255, 255, 255, 0.03)`。在深色模式下這能產生微亮的層次感，但在淺色模式 (`--panel-bg: #ffffff`) 下，白底加上 3% 的白色會完全隱形，導致側邊欄內的區塊失去視覺邊界。
  - **Why**: `color.md › Best practices`："Make sure all your app’s colors work well in light, dark, and increased contrast contexts." (確保所有顏色在淺色與深色環境下都能正常運作)。
  - **Fix**: 建議在 `index.css` 中新增 CSS 變數 `--panel-inner-bg`，深色模式設為 `rgba(255, 255, 255, 0.03)`，淺色模式設為 `rgba(0, 0, 0, 0.03)`，並在 `App.css` 中替換。

### Improvements
- **High: 淺色模式的 Liquid Glass 失效**
  - **What**: `.sidebar` 套用了 `backdrop-filter: blur(12px)`，但在 `index.css` 的淺色主題中，`--panel-bg` 被設定為不透明的純白 `#ffffff`，這使得毛玻璃效果完全無法穿透。
  - **Why**: `liquid-glass.md`："For smaller elements... the system can adapt Liquid Glass between a light and dark appearance in response to the underlying content."
  - **Fix**: 將淺色模式的 `--panel-bg` 改為半透明，例如 `rgba(255, 255, 255, 0.7)`，讓背景的漸層圓點能透出。

- **Medium: 遺漏的主題變數 (Missing Theme Variable)**
  - **What**: 發光的「自動排座」按鈕使用了 `var(--primary)` 與 `var(--accent)` 的漸層。但淺色主題並未重新定義 `--accent`，導致它直接繼承深色模式的 `#8b5cf6` (紫色)，在以 Zinc (灰) 與 Blue (藍) 為主的淺色主題中略顯突兀。
  - **Why**: `color.md › System colors`：應避免在不同外觀模式下遺漏對應的語意色彩。
  - **Fix**: 在 `body.light-theme` 中加入適合淺色背景的 `--accent` 顏色（例如 `#7c3aed` 或更亮的藍紫色）。

### Craft notes
- **Signature Element (標誌性元素)**: 那顆帶有 `pulse-glow` 動畫的「自動排座」按鈕是這個介面的靈魂。它非常明確地暗示了這個 App 的核心價值（一鍵算出最佳解）。這種大膽的設計在工具類 App 中很少見，保留了獨特的個性。
- **Typography (字體)**: 採用 `Inter` 搭配系統原生字體，符合專業工具的冷靜調性。但部分標籤（如 `.seat-no` 和 `.group-label`）的字體使用 `clamp` 縮放時，在極小尺寸下可能低於 Apple 建議的 11pt 最小可讀尺寸，需確保其在極端情況下仍可辨識。

### What works
- **佈局彈性 (Responsive Layout)**：使用 CSS Grid/Flexbox 與 `aspect-ratio` 來維持教室比例，這是非常符合跨平台精神的優良設計。
- **操作回饋 (Interaction)**：按鈕的 `:active` 狀態 (`transform: scale(0.97)`) 提供了紮實的點擊手感，符合 HIG 對於觸控與指標回饋的要求。
