import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';

export const exportToPPTX = (assignments, currentMap, staticItems, staticVisibility) => {
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

export const exportToJPEG = async (classroomElement, isWhiteMode) => {
  if (!classroomElement) return;
  
  if (isWhiteMode) {
    classroomElement.classList.add('export-white');
  }
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(classroomElement, {
          scale: 2, 
          backgroundColor: isWhiteMode ? '#ffffff' : '#242424',
          ignoreElements: (element) => {
            return element.classList.contains('delete-seat-btn') || element.classList.contains('lock-seat-btn');
          }
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.download = isWhiteMode ? '座位表-白底.jpg' : '座位表-黑底.jpg';
        link.href = dataUrl;
        link.click();
        resolve();
      } catch (error) {
        console.error('Export JPEG failed:', error);
        alert('匯出圖片失敗');
        resolve();
      } finally {
        if (isWhiteMode) {
          classroomElement.classList.remove('export-white');
        }
      }
    }, 50);
  });
};
