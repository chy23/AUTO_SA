import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';
import { Upload, Shuffle, Download, Settings2, Trash2, MapPin, X, Image as ImageIcon } from 'lucide-react';
import { LAYOUT_HORIZONTAL, LAYOUT_VERTICAL, GROUPS, ADJACENCY_LIST } from './constants';
import './App.css';

// --- Utility Functions ---
const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const processData = (dataArray) => {
      if (!dataArray || dataArray.length === 0) return [];
      
      let idColIdx = -1;
      let nameColIdx = -1;
      let headerRowIdx = -1;

      for (let i = 0; i < Math.min(5, dataArray.length); i++) {
        const row = dataArray[i];
        if (!row) continue;
        for (let j = 0; j < row.length; j++) {
          const val = String(row[j]).trim();
          if (val === '座號' || val.toLowerCase() === 'id' || val === '序號') idColIdx = j;
          if (val === '姓名' || val.toLowerCase() === 'name') nameColIdx = j;
        }
        if (nameColIdx !== -1) {
          headerRowIdx = i;
          break; 
        }
      }

      const students = [];

      if (nameColIdx !== -1) {
        for (let i = headerRowIdx + 1; i < dataArray.length; i++) {
          const row = dataArray[i];
          if (!row) continue;
          const name = String(row[nameColIdx] || '').trim();
          if (!name) continue;
          
          let id = idColIdx !== -1 ? String(row[idColIdx] || '').trim() : '';
          if (!id) id = (i - headerRowIdx).toString(); 
          
          students.push({ id, name });
        }
      } else {
        let guessIdCol = -1;
        let guessNameCol = 0;
        
        for(let i=0; i < dataArray.length; i++) {
           if(dataArray[i] && dataArray[i].length > 0) {
              const val0 = String(dataArray[i][0]).trim();
              if (val0) {
                if(!isNaN(val0) && dataArray[i].length >= 2) {
                   guessIdCol = 0;
                   guessNameCol = 1;
                }
                break;
              }
           }
        }

        for (let i = 0; i < dataArray.length; i++) {
          const row = dataArray[i];
          if (!row) continue;
          
          const name = String(row[guessNameCol] || '').trim();
          if (!name) continue;
          
          let id = '';
          if (guessIdCol !== -1) {
             id = String(row[guessIdCol] || '').trim();
          } else {
             id = (i + 1).toString();
          }
          
          if (id && name) {
             students.push({ id, name });
          }
        }
      }
      return students;
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        complete: (results) => resolve(processData(results.data)),
        error: reject
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          resolve(processData(json));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
};

const evaluateAssignment = (assignment, rules, currentMap) => {
  let penalty = 0;
  const getSeat = id => currentMap.seats.find(s => s.id === id);
  
  rules.forEach(rule => {
    if (!rule.students) return;
    const items = rule.students.map(studentId => 
      assignment.find(a => a.student?.name === studentId || a.student?.id === studentId)
    ).filter(Boolean);

    if (items.length < 2) return;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const seat1 = getSeat(items[i].seatId);
        const seat2 = getSeat(items[j].seatId);
        if (!seat1 || !seat2) continue;
        
        if (rule.type === 'NOT_SAME_GROUP' && seat1.groupId === seat2.groupId) penalty += 1000;
        if (rule.type === 'SAME_GROUP' && seat1.groupId !== seat2.groupId) penalty += 1000;
        
        const isAdjacent = ADJACENCY_LIST[seat1.id]?.includes(seat2.id);
        if (rule.type === 'NOT_ADJACENT' && isAdjacent) penalty += 1000;
        if (rule.type === 'ADJACENT' && !isAdjacent) penalty += 1000;
      }
    }
  });
  return penalty;
};

const assignSeats = (students, rules, currentMap, layoutMode) => {
  if (students.length === 0) return [];
  
  const totalSeats = currentMap.seats.length;
  const numStudents = Math.min(students.length, totalSeats);
  
  let currentAssignment = currentMap.seats.map((seat, index) => ({
    seatId: seat.id,
    student: index < numStudents ? students[index] : null,
  }));
  
  let swappableIndices = [];
  if (layoutMode === 'STANDARD' && totalSeats > students.length) {
    // Keep empty seats at the very end of the currentMap.seats array
    for (let i = 0; i < numStudents; i++) swappableIndices.push(i);
  } else {
    for (let i = 0; i < totalSeats; i++) swappableIndices.push(i);
  }
  
  for (let i = swappableIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const idx1 = swappableIndices[i];
    const idx2 = swappableIndices[j];
    [currentAssignment[idx1].student, currentAssignment[idx2].student] = 
    [currentAssignment[idx2].student, currentAssignment[idx1].student];
  }

  let currentScore = evaluateAssignment(currentAssignment, rules, currentMap);
  let bestAssignment = [...currentAssignment];
  let bestScore = currentScore;

  const iterations = 5000;
  for (let i = 0; i < iterations; i++) {
    if (bestScore === 0) break;
    
    const newAssignment = [...currentAssignment];
    const r1 = Math.floor(Math.random() * swappableIndices.length);
    const r2 = Math.floor(Math.random() * swappableIndices.length);
    const idx1 = swappableIndices[r1];
    const idx2 = swappableIndices[r2];
    
    const temp = newAssignment[idx1].student;
    newAssignment[idx1].student = newAssignment[idx2].student;
    newAssignment[idx2].student = temp;

    const newScore = evaluateAssignment(newAssignment, rules, currentMap);

    if (newScore < currentScore) {
      currentAssignment = newAssignment;
      currentScore = newScore;
      if (newScore < bestScore) {
        bestAssignment = [...newAssignment];
        bestScore = newScore;
      }
    } else {
      const p = Math.exp((currentScore - newScore) / (100 / (i + 1)));
      if (Math.random() < p) {
        currentAssignment = newAssignment;
        currentScore = newScore;
      }
    }
  }
  return bestAssignment;
};

const defaultStudents = [
  { id: '25', name: '李欣語' }, { id: '17', name: '羅姵婷' }, { id: '4', name: '陳定宇' }, { id: '12', name: '吳侑宸' }, { id: '20', name: '茅子芳' },
  { id: '3', name: '陳少杰' }, { id: '10', name: '劉彥辰' }, { id: '21', name: '洪筠晴' }, { id: '13', name: '嚴梃榮' }, { id: '22', name: '林睦橙' },
  { id: '6', name: '黃振祐' }, { id: '23', name: '周思妤' }, { id: '16', name: '羅洢洢' }, { id: '9', name: '凌戎邑' },
  { id: '2', name: '陳秉逸' }, { id: '8', name: '林楷倫' }, { id: '11', name: '王星澄' },
  { id: '18', name: '蕭巧羚' }, { id: '15', name: '嚴珮宸' }, { id: '7', name: '李崇碩' },
  { id: '24', name: '吳芝妤' }, { id: '14', name: '余凱豐' }, { id: '19', name: '張倖慈' }, { id: '1', name: '陳睿東' }
];

const initialAssignments = LAYOUT_VERTICAL.seats.map((seat, index) => ({
  seatId: seat.id,
  student: defaultStudents[index] || null 
}));

export default function App() {
  const [students, setStudents] = useState(defaultStudents); // List of {id, name}
  const [rules, setRules] = useState([]);
  const [layoutMode, setLayoutMode] = useState('GROUP');
  const [lastGroupMode, setLastGroupMode] = useState('GROUP');
  const [standardRows, setStandardRows] = useState(6);
  const [standardCols, setStandardCols] = useState(5);
  const [hiddenSeatIds, setHiddenSeatIds] = useState([]);

  const standardMap = useMemo(() => {
    const seats = [];
    let currentId = 1;
    const xStart = 15, xEnd = 85, yStart = 15, yEnd = 85;
    const xStep = standardCols > 1 ? (xEnd - xStart) / (standardCols - 1) : 0;
    const yStep = standardRows > 1 ? (yEnd - yStart) / (standardRows - 1) : 0;
    
    for (let r = 0; r < standardRows; r++) {
      for (let c = 0; c < standardCols; c++) {
        if (!hiddenSeatIds.includes(currentId)) {
          seats.push({
            id: currentId,
            groupId: c + 1,
            x: standardCols === 1 ? 50 : xStart + (c * xStep),
            y: standardRows === 1 ? 50 : yStart + (r * yStep),
            shape: 'horizontal'
          });
        }
        currentId++;
      }
    }
    return { seats, labels: [], staticItems: LAYOUT_VERTICAL.staticItems };
  }, [standardRows, standardCols, hiddenSeatIds]);

  const currentMap = layoutMode === 'GROUP' ? LAYOUT_HORIZONTAL :
                     layoutMode === 'EXAM' ? LAYOUT_VERTICAL :
                     standardMap;
  
  const [assignments, setAssignments] = useState(initialAssignments);
  const [staticItems, setStaticItems] = useState(LAYOUT_HORIZONTAL.staticItems);
  const [staticVisibility, setStaticVisibility] = useState({
    'front-door': true, 'back-corridor': true, 'back-door': true, 'teacher': true, 'restroom': true
  });
  
  const [isAssigning, setIsAssigning] = useState(false);
  const classroomRef = useRef(null);

  // --- Static item drag via mouse events (not HTML5 drag API) ---
  const draggingStatic = useRef(null); // { id, offsetX, offsetY }

  const handleStaticMouseDown = (e, itemId) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    draggingStatic.current = {
      id: itemId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingStatic.current || !classroomRef.current) return;
      // Capture ref fields immediately to avoid race condition with mouseup
      const { id, offsetX, offsetY } = draggingStatic.current;
      const cr = classroomRef.current.getBoundingClientRect();
      let x = ((e.clientX - cr.left - offsetX) / cr.width) * 100;
      let y = ((e.clientY - cr.top - offsetY) / cr.height) * 100;
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
      setStaticItems(prev => prev.map(item =>
        item.id === id ? { ...item, x, y } : item
      ));
    };
    const onMouseUp = () => { draggingStatic.current = null; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  useEffect(() => {
    setStaticItems(layoutMode === 'GROUP' ? LAYOUT_HORIZONTAL.staticItems : 
                   layoutMode === 'EXAM' ? LAYOUT_VERTICAL.staticItems : 
                   LAYOUT_VERTICAL.staticItems);
  }, [layoutMode]);

  const [ruleType, setRuleType] = useState('NOT_SAME_GROUP');
  const [ruleStudentIDs, setRuleStudentIDs] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const studentObjs = await parseFile(file);
      setStudents(studentObjs);
      setAssignments(currentMap.seats.map((seat, index) => ({
        seatId: seat.id,
        student: studentObjs[index] || null
      })));
    } catch (err) {
      alert("讀取檔案失敗：" + err.message);
    }
  };

  const addRule = () => {
    const ids = ruleStudentIDs.split(',').map(s => s.trim()).filter(s => s);
    if (ids.length < 2 || ids.length > 5) {
      alert("請輸入 2 到 5 個座號，以逗號分隔");
      return;
    }
    const validStudents = ids.map(id => {
      const s = students.find(s => s.id === id || s.name === id);
      return s ? s.name : id; 
    });

    setRules([...rules, { id: Date.now(), type: ruleType, students: validStudents }]);
    setRuleStudentIDs('');
  };

  const removeRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleAssign = () => {
    if (students.length === 0) {
      alert("請先上傳名單");
      return;
    }
    if (students.length > currentMap.seats.length) {
      alert(`座位數量不足！\n目前有 ${students.length} 位學生，但只有 ${currentMap.seats.length} 個座位。\n請切換至「一般模式」增加行列數，或移除部分學生。`);
      return;
    }
    const result = assignSeats(students, rules, currentMap, layoutMode);
    setAssignments(result);
  };

  // --- Seat-only Drag and Drop ---
  const handleSeatDragStart = (e, seatId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ itemType: 'seat', id: seatId }));
  };

  const handleSeatDrop = (e, targetSeatId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.itemType === 'seat' && data.id !== targetSeatId) {
        setAssignments(prev => {
          const newAss = [...prev];
          const idx1 = newAss.findIndex(a => a.seatId === data.id);
          const idx2 = newAss.findIndex(a => a.seatId === targetSeatId);
          if (idx1 !== -1 && idx2 !== -1) {
            const temp = newAss[idx1].student;
            newAss[idx1].student = newAss[idx2].student;
            newAss[idx2].student = temp;
          }
          return newAss;
        });
      }
    } catch {}
  };


  // --- PPTX Export ---
  const handleExportPPTX = () => {
    const pres = new pptxgen();
    pres.layout = "LAYOUT_4x3"; // 10 x 7.5 inches, matches web 4:3 aspect ratio
    const slide = pres.addSlide();
    const slideW = 10;
    const slideH = 7.5;
    
    // Classroom boundary
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: slideW, h: slideH,
      fill: { color: "F0F0F0" },
      line: { color: "CCCCCC", width: 1 }
    });

    // Blackboard
    slide.addShape(pres.ShapeType.rect, {
      x: (slideW - 3) / 2, y: 0.1, w: 3, h: 0.4,
      fill: { color: "1A472A" },
      line: { color: "8B5A2B", width: 2 }
    });
    slide.addText("黑板", {
      x: (slideW - 3) / 2, y: 0.1, w: 3, h: 0.4,
      color: "FFFFFF", align: "center", bold: true, fontSize: 16
    });

    // Seats
    assignments.forEach(ass => {
      const seat = currentMap.seats.find(s => s.id === ass.seatId);
      if (!seat) return;

      const cx = (seat.x / 100) * slideW;
      const cy = (seat.y / 100) * slideH;
      
      // Identical size for both horizontal and vertical seats, just rotated
      const w = seat.shape === 'vertical' ? 0.6 : 0.9;
      const h = seat.shape === 'vertical' ? 0.9 : 0.6;
      
      const px = cx - (w / 2);
      const py = cy - (h / 2);
      
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
        x: px, y: py, w: w, h: h,
        fill: { color: fillCol },
        line: { color: "000000", width: 1 }
      });
      
      slide.addText(text, {
        x: px, y: py, w: w, h: h,
        color: "000000", align: "center", fontSize: 12
      });
    });
    
    // Static Items
    staticItems.forEach(item => {
      if (!staticVisibility[item.id]) return;
      const cx = (item.x / 100) * slideW;
      const cy = (item.y / 100) * slideH;
      
      const w = (item.orientation === 'vertical' ? 0.04 : 0.10) * slideW;
      const h = (item.orientation === 'vertical' ? 0.12 : 0.06) * slideH;
      
      const px = cx - (w / 2);
      const py = cy - (h / 2);
      
      slide.addShape(pres.ShapeType.rect, {
        x: px, y: py, w: w, h: h,
        fill: { color: "DDDDDD" },
        line: { color: "999999", width: 1 }
      });
      
      slide.addText(item.name, {
        x: px, y: py, w: w, h: h,
        color: "333333", align: "center", fontSize: 10
      });
    });

    pres.writeFile({ fileName: "座位表.pptx" });
  };

  // --- JPEG Export ---
  const handleExportJPEG = async (isWhiteMode) => {
    if (!classroomRef.current) return;
    
    if (isWhiteMode) {
      classroomRef.current.classList.add('export-white');
    }
    
    // Small delay to allow DOM to apply the class
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(classroomRef.current, {
          scale: 2, // Double resolution for clarity
          backgroundColor: isWhiteMode ? '#ffffff' : '#242424',
          ignoreElements: (element) => {
            // Hide web-only UI elements like the delete button
            return element.classList.contains('delete-seat-btn');
          }
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.download = isWhiteMode ? '座位表-白底.jpg' : '座位表-黑底.jpg';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Export JPEG failed:', error);
        alert('匯出圖片失敗');
      } finally {
        if (isWhiteMode) {
          classroomRef.current.classList.remove('export-white');
        }
      }
    }, 50);
  };

  return (
    <div className="app-container">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>智慧教室座位分配系統</h1>
        <div className="mode-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px', gap: '4px' }}>
          <button 
            onClick={() => setLayoutMode(lastGroupMode)}
            style={{ padding: '6px 16px', borderRadius: '16px', border: 'none', background: layoutMode !== 'STANDARD' ? '#4CAF50' : 'transparent', color: 'white', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            小組模式
          </button>
          <button 
            onClick={() => setLayoutMode('STANDARD')}
            style={{ padding: '6px 16px', borderRadius: '16px', border: 'none', background: layoutMode === 'STANDARD' ? '#4CAF50' : 'transparent', color: 'white', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            一般模式
          </button>
        </div>
      </header>
      
      <main className="app-content">
        <aside className="sidebar">
          {/* 1. 學生名單上傳 */}
          <section className="panel upload-panel">
            <h2>1. 學生名單</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label className="upload-btn" style={{ flex: 1 }}>
                <Upload size={18} /> 上傳名單
                <input id="file-upload" type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} hidden />
              </label>
              <button 
                className="secondary-btn" 
                onClick={() => {
                  setStudents([]);
                  setAssignments(currentMap.seats.map(seat => ({ seatId: seat.id, student: null })));
                  const fileInput = document.getElementById('file-upload');
                  if (fileInput) fileInput.value = '';
                }}
                style={{ padding: '0 1rem' }}
                title="清除所有學生"
              >
                <Trash2 size={18} /> 清除
              </button>
            </div>
            <div className="student-stats" style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#ccc' }}>
              已載入 {students.length} 名學生
            </div>
          </section>

          {/* 1.5 設施顯示設定 */}
          <section className="panel settings-panel">
            <h2>環境設施顯示</h2>
            <div className="visibility-toggles" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.keys(staticVisibility).map(key => {
                const itemDef = LAYOUT_HORIZONTAL.staticItems.find(i => i.id === key);
                return (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={staticVisibility[key]}
                      onChange={(e) => setStaticVisibility(prev => ({...prev, [key]: e.target.checked}))}
                    /> 
                    {itemDef?.name}
                  </label>
                )
              })}
            </div>
          </section>

          {/* 2. 條件設定 */}
          <section className="panel rules-panel">
            <h2>2. 排座條件 (輸入座號)</h2>
            <div className="rule-form">
              <select value={ruleType} onChange={e => setRuleType(e.target.value)} className="rule-select">
                <option value="NOT_SAME_GROUP">不同組</option>
                <option value="NOT_ADJACENT">不相鄰(隔壁)</option>
                <option value="SAME_GROUP">同組</option>
                <option value="ADJACENT">相鄰(隔壁)</option>
              </select>
              
              <input 
                type="text" 
                placeholder="例如: 23, 14, 17" 
                value={ruleStudentIDs}
                onChange={e => setRuleStudentIDs(e.target.value)}
                className="rule-input"
              />
              
              <button className="secondary-btn" onClick={addRule}>新增條件</button>
            </div>
            <ul className="rule-list">
              {rules.map(r => (
                <li key={r.id}>
                  <span>{r.students ? r.students.join(', ') : ''} 
                    {r.type === 'NOT_SAME_GROUP' && " 不能同組"}
                    {r.type === 'NOT_ADJACENT' && " 不能相鄰"}
                    {r.type === 'SAME_GROUP' && " 必須同組"}
                    {r.type === 'ADJACENT' && " 必須相鄰"}
                  </span>
                  <button className="icon-btn danger" onClick={() => removeRule(r.id)}><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel actions">
          {layoutMode !== 'STANDARD' && (
            <button 
              className="action-btn outline"
              onClick={() => {
                const nextMode = layoutMode === 'GROUP' ? 'EXAM' : 'GROUP';
                setLayoutMode(nextMode);
                setLastGroupMode(nextMode);
              }}
            >
              <Settings2 size={18} />
              {layoutMode === 'GROUP' ? '切換為直排' : '切換為橫排'}
            </button>
          )}
          
          {layoutMode === 'STANDARD' && (
            <div className="standard-mode-settings" style={{ marginTop: '10px', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#333' }}>一般模式設定</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', color: '#555' }}>行數: 
                  <input type="number" min="1" max="15" value={standardRows} onChange={e => setStandardRows(Number(e.target.value))} style={{ width: '50px', marginLeft: '5px' }}/>
                </label>
                <label style={{ fontSize: '12px', color: '#555' }}>列數: 
                  <input type="number" min="1" max="15" value={standardCols} onChange={e => setStandardCols(Number(e.target.value))} style={{ width: '50px', marginLeft: '5px' }}/>
                </label>
              </div>
              <button className="secondary-btn" onClick={() => setHiddenSeatIds([])} style={{ fontSize: '12px', padding: '4px 8px' }}>重置所有座位</button>
            </div>
          )}
          
          <button className="action-btn primary" onClick={handleAssign} disabled={isAssigning || students.length === 0}>
             <Shuffle size={16} /> 自動排座位
          </button>
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
             <button className="secondary-btn" onClick={handleExportPPTX} style={{ flex: 1, padding: '10px' }}>
               <Download size={16} /> 匯出 PPTX
             </button>
             <div style={{ display: 'flex', gap: '10px' }}>
               <button className="secondary-btn" onClick={() => handleExportJPEG(false)} style={{ flex: 1, padding: '10px' }}>
                 <ImageIcon size={16} /> 黑底圖檔
               </button>
               <button className="secondary-btn" onClick={() => handleExportJPEG(true)} style={{ flex: 1, padding: '10px', background: '#fff', color: '#333', border: '1px solid #ccc' }}>
                 <ImageIcon size={16} /> 白底圖檔
               </button>
             </div>
          </div>
          </section>
        </aside>

        <section className="classroom-area">
          <div className="watermark watermark-top">網站建立自楊家驊老師</div>
          <div className="watermark watermark-bottom">網站建立自楊家驊老師</div>
          
          <div 
            ref={classroomRef}
            className={`classroom ${layoutMode === 'GROUP' ? 'horizontal-layout' : 'vertical-layout'}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
          >
            <div className="blackboard">黑板</div>
            
            {currentMap.labels.map((label, idx) => (
              <div 
                key={`label-${idx}`} 
                className="group-label"
                style={{ left: `${label.x}%`, top: `${label.y}%` }}
              >
                {label.text}
              </div>
            ))}
            
            {staticItems.map(item => staticVisibility[item.id] && (
              <div 
                key={item.id} 
                className={`static-label ${item.orientation === 'vertical' ? 'static-vertical' : 'static-horizontal'}`}
                style={{ left: `${item.x}%`, top: `${item.y}%`, cursor: 'grab', userSelect: 'none' }}
                onMouseDown={(e) => handleStaticMouseDown(e, item.id)}
              >
                {item.name}
              </div>
            ))}
            
            {currentMap.seats.map(seat => {
              const ass = assignments.find(a => a.seatId === seat.id);
              return (
                <div 
                  key={seat.id} 
                  className={`seat group-${seat.groupId || 1} ${seat.shape || 'vertical'}`}
                  style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
                  draggable
                  onDragStart={(e) => handleSeatDragStart(e, seat.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleSeatDrop(e, seat.id)}
                >
                  <div className="seat-no">{seat.id}</div>
                  {layoutMode === 'STANDARD' && (
                    <button 
                      className="delete-seat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHiddenSeatIds(prev => [...prev, seat.id]);
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                  {ass?.student ? (
                    <div className="student-info">
                      <span className="student-id">{ass.student.id}</span>
                      <span className="student-name">{ass.student.name}</span>
                    </div>
                  ) : (
                    <div className="empty-seat">空</div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="drag-hint" style={{ textAlign: 'center', marginTop: '15px', color: '#666' }}>
            <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
            提示：您可以自由拖曳座位與各項設施地標到教室內的任意位置
          </p>
        </section>
      </main>
    </div>
  );
}
