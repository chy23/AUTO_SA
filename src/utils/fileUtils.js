import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const parseFile = (file) => {
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
