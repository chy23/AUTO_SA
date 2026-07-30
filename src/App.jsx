import React, { useState, useCallback, useRef } from 'react';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import { Upload, Shuffle, Download, Settings2, Trash2 } from 'lucide-react';
import { SEAT_MAP, GROUPS, ADJACENCY_LIST, GROUP_LABELS, STATIC_LABELS } from './constants';
import './App.css';

// --- Utility Functions ---

// 簡單的陣列洗牌
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// 計算分數 (約束滿足程度)
// 分數越低越好，0 分代表完全符合
const evaluateAssignment = (assignment, rules) => {
  let penalty = 0;
  
  // 建立座位 ID 對應到學生的 Map，方便查詢
  const seatToStudent = {};
  assignment.forEach(item => {
    seatToStudent[item.seatId] = item.student;
  });

  rules.forEach(rule => {
    const { type, students: ruleStudents } = rule;
    
    // 找出這些學生目前的座位
    const items = ruleStudents.map(studentId => 
      assignment.find(a => a.student?.id === studentId)
    ).filter(Boolean);

    // 如果沒有找到足夠的學生，就不算分數
    if (items.length < 2) return;

    // 兩兩比較
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const s1 = SEAT_MAP.find(s => s.id === items[i].seatId);
        const s2 = SEAT_MAP.find(s => s.id === items[j].seatId);
        if (!s1 || !s2) continue;

        const isSameGroup = s1.groupId === s2.groupId;
        const isAdjacent = ADJACENCY_LIST[s1.id].includes(s2.id);

        if (type === 'NOT_SAME_GROUP' && isSameGroup) penalty += 100;
        if (type === 'NOT_ADJACENT' && isAdjacent) penalty += 100;
        if (type === 'SAME_GROUP' && !isSameGroup) penalty += 50;
        if (type === 'ADJACENT' && !isAdjacent) penalty += 50;
      }
    }
  });

  return penalty;
};

// 自動排座演算法 (模擬退火 / 隨機交換)
const assignSeats = (students, rules) => {
  if (students.length === 0) return [];
  
  // 初始化隨機分配
  let currentAssignment = SEAT_MAP.map((seat, index) => ({
    seatId: seat.id,
    student: index < students.length ? students[index] : null,
  }));
  currentAssignment = shuffleArray(currentAssignment);

  let currentScore = evaluateAssignment(currentAssignment, rules);
  let bestAssignment = [...currentAssignment];
  let bestScore = currentScore;

  // 如果已經是 0 分就直接回傳
  if (bestScore === 0) return bestAssignment;

  // 嘗試多次交換來找最佳解
  const maxIterations = 5000;
  for (let i = 0; i < maxIterations; i++) {
    // 隨機挑兩個座位交換
    const idx1 = Math.floor(Math.random() * currentAssignment.length);
    const idx2 = Math.floor(Math.random() * currentAssignment.length);
    
    const newAssignment = [...currentAssignment];
    // 交換學生
    const temp = newAssignment[idx1].student;
    newAssignment[idx1].student = newAssignment[idx2].student;
    newAssignment[idx2].student = temp;

    const newScore = evaluateAssignment(newAssignment, rules);

    if (newScore < currentScore) {
      currentAssignment = newAssignment;
      currentScore = newScore;
      if (currentScore < bestScore) {
        bestScore = currentScore;
        bestAssignment = [...currentAssignment];
      }
    }
    
    if (bestScore === 0) break;
  }

  return bestAssignment;
};


function App() {
  const [students, setStudents] = useState([]);
  const [rules, setRules] = useState([]);
  const [assignments, setAssignments] = useState(
    SEAT_MAP.map(s => ({ seatId: s.id, student: null }))
  );
  const [draggedSeat, setDraggedSeat] = useState(null);

  // --- 規則設定相關 ---
  const [ruleType, setRuleType] = useState('NOT_SAME_GROUP');
  const [ruleInputs, setRuleInputs] = useState(['', '', '', '', '']);

  const handleRuleInputChange = (index, value) => {
    const newInputs = [...ruleInputs];
    newInputs[index] = value;
    setRuleInputs(newInputs);
  };

  const handleAddRule = () => {
    const validStudents = ruleInputs.map(v => v.trim()).filter(v => v !== '');
    if (validStudents.length < 2) {
      alert("請至少輸入兩個座號");
      return;
    }
    setRules([...rules, { id: Date.now(), type: ruleType, students: validStudents }]);
    setRuleInputs(['', '', '', '', '']);
  };

  const removeRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  // --- 檔案上傳 ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isCSV = file.name.endsWith('.csv');
    if (isCSV) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          processRawData(results.data);
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processRawData(data);
      };
      reader.readAsBinaryString(file);
    }
  };

  const processRawData = (data) => {
    // 假設欄位有 "座號", "姓名" 或類似
    const parsedStudents = data.map((row, idx) => {
      const id = row['座號'] || row['id'] || (idx + 1).toString();
      const name = row['姓名'] || row['名字'] || row['name'] || `學生${id}`;
      return { id: id.toString(), name: name.toString() };
    }).filter(s => s.name);
    
    setStudents(parsedStudents.slice(0, 25)); // 最多 25 人
  };

  // --- 排座位 ---
  const handleAssign = () => {
    if (students.length === 0) {
      alert("請先上傳名單");
      return;
    }
    const result = assignSeats(students, rules);
    setAssignments(result);
  };

  // --- 拖曳功能 ---
  const handleDragStart = (e, seatId) => {
    setDraggedSeat(seatId);
    e.dataTransfer.setData("text/plain", seatId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetSeatId) => {
    e.preventDefault();
    if (draggedSeat === null || draggedSeat === targetSeatId) return;

    setAssignments(prev => {
      const newAss = [...prev];
      const idx1 = newAss.findIndex(a => a.seatId === draggedSeat);
      const idx2 = newAss.findIndex(a => a.seatId === targetSeatId);
      
      const temp = newAss[idx1].student;
      newAss[idx1].student = newAss[idx2].student;
      newAss[idx2].student = temp;
      
      return newAss;
    });
    setDraggedSeat(null);
  };

  // --- PPTX 匯出 ---
  const handleExportPPTX = () => {
    const pres = new pptxgen();
    const slide = pres.addSlide();
    
    // 黑板
    slide.addShape(pres.ShapeType.rect, { 
      x: 3, y: 0.5, w: 4, h: 0.8, fill: "333333", align: "center", color: "ffffff", 
      text: "黑板"
    });

    assignments.forEach(ass => {
      const seat = SEAT_MAP.find(s => s.id === ass.seatId);
      if (!seat) return;

      const px = (seat.col - 1) * 1.5 + 0.5; 
      const py = (seat.row - 1) * 0.8 + 1.2; 
      
      let text = `${seat.id}`;
      if (ass.student) {
        text += `\n${ass.student.name}`;
      }
      
      let fillCol = "ffffff";
      switch(seat.groupId) {
        case 1: fillCol = "ffcccc"; break;
        case 2: fillCol = "ccffcc"; break;
        case 3: fillCol = "ccccff"; break;
        case 4: fillCol = "ffffcc"; break;
        case 5: fillCol = "ffccff"; break;
      }

      slide.addShape(pres.ShapeType.rect, {
        x: px, y: py, w: 1, h: 0.8, fill: fillCol, line: { color: "666666", width: 1 },
        align: "center", font_size: 12, text: text
      });
    });

    pres.writeFile({ fileName: "座位表.pptx" });
  };


  return (
    <div className="app-container">
      <header className="app-header">
        <h1>智慧教室座位分配系統</h1>
      </header>

      <main className="app-content">
        <aside className="sidebar">
          
          <section className="panel">
            <h2>1. 名單上傳</h2>
            <label className="upload-btn">
              <Upload size={16} /> 上傳 Excel/CSV
              <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} hidden />
            </label>
            <p className="hint">已載入 {students.length} 名學生</p>
          </section>

          <section className="panel">
            <h2>2. 條件設定</h2>
            <div className="rule-form">
              <select value={ruleType} onChange={e => setRuleType(e.target.value)}>
                <option value="NOT_SAME_GROUP">不排同一組</option>
                <option value="NOT_ADJACENT">不坐隔壁</option>
                <option value="SAME_GROUP">坐同一組</option>
                <option value="ADJACENT">坐隔壁</option>
              </select>
              <div className="rule-inputs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {ruleInputs.map((val, idx) => (
                  <input 
                    key={idx}
                    type="text" 
                    placeholder={`座號 ${idx + 1}`} 
                    value={val} 
                    onChange={e => handleRuleInputChange(idx, e.target.value)} 
                    style={idx === 4 ? { gridColumn: '1 / -1' } : {}}
                  />
                ))}
              </div>
              <button className="add-rule-btn" onClick={handleAddRule}>新增條件</button>
            </div>
            
            <ul className="rule-list">
              {rules.map(r => (
                <li key={r.id}>
                  <span>{r.students ? r.students.join(', ') : (r.student1 + ' 與 ' + r.student2)} 
                    {r.type === 'NOT_SAME_GROUP' && " 不能同組"}
                    {r.type === 'NOT_ADJACENT' && " 不能相鄰"}
                    {r.type === 'SAME_GROUP' && " 必須同組"}
                    {r.type === 'ADJACENT' && " 必須相鄰"}
                  </span>
                  <button onClick={() => removeRule(r.id)}><Trash2 size={14}/></button>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel actions">
             <button className="primary-btn" onClick={handleAssign}>
               <Shuffle size={16} /> 自動排座位
             </button>
             <button className="secondary-btn" onClick={handleExportPPTX}>
               <Download size={16} /> 匯出 PPTX
             </button>
          </section>

        </aside>

        <section className="classroom-area">
          <div className="classroom">
            <div className="blackboard">黑板</div>
            {GROUP_LABELS.map((label, idx) => (
              <div 
                key={`label-${idx}`} 
                className="group-label"
                style={{ 
                  gridColumn: label.col, 
                  gridRow: label.row,
                  justifySelf: label.text === '5' || label.text === '4' ? 'end' : (label.text === '1' || label.text === '2' ? 'start' : 'center'),
                  alignSelf: label.text === '3' ? 'center' : 'end',
                  marginBottom: label.text === '3' ? '0' : '10px',
                  marginLeft: label.text === '1' || label.text === '2' ? '10px' : '0',
                  marginRight: label.text === '5' || label.text === '4' ? '10px' : '0',
                  ...label.customStyle 
                }}
              >
                {label.text}
              </div>
            ))}
            {STATIC_LABELS.map((label, idx) => (
              <div 
                key={`static-${idx}`} 
                className="static-label"
                style={label.style}
              >
                {label.text}
              </div>
            ))}
            {SEAT_MAP.map(seat => {
              const ass = assignments.find(a => a.seatId === seat.id);
              return (
                <div 
                  key={seat.id} 
                  className={`seat group-${seat.groupId}`}
                  style={{ gridColumn: seat.col, gridRow: seat.row }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, seat.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, seat.id)}
                >
                  <span className="seat-no">{seat.id}</span>
                  {ass?.student && (
                    <div className="student-info">
                      <span className="student-id">{ass.student.id}</span>
                      <span className="student-name">{ass.student.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="drag-hint">提示：直接拖曳學生的座位即可交換位置。</p>
        </section>
      </main>
    </div>
  );
}

export default App;
