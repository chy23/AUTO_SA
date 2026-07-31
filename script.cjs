const fs = require('fs');

const content = fs.readFileSync('src/constants.js', 'utf8');

const mapX = (x) => 15 + (x - 10) * 0.875;
const mapY = (y) => 22 + (y - 15) * 0.84; // map 15-90 to 22-85

let newContent = content.replace(/x: ([\d.]+), y: ([\d.]+)/g, (match, xStr, yStr) => {
  let x = parseFloat(xStr);
  let y = parseFloat(yStr);
  
  if (x >= 10 && x <= 90) x = mapX(x);
  if (y >= 15 && y <= 90) y = mapY(y);
  
  return `x: ${x.toFixed(1)}, y: ${y.toFixed(1)}`;
});

// Update static items to be at the absolute edges
newContent = newContent.replace(/x: 2, y: 15/g, 'x: 3, y: 15'); // front door
newContent = newContent.replace(/x: 95, y: 15/g, 'x: 97, y: 15'); // back corridor
newContent = newContent.replace(/x: 2, y: 90/g, 'x: 3, y: 95'); // back door
newContent = newContent.replace(/x: 60, y: 95/g, 'x: 50, y: 96'); // teacher (centered)
newContent = newContent.replace(/x: 90, y: 95/g, 'x: 95, y: 96'); // restroom

fs.writeFileSync('src/constants.js', newContent);
console.log('Updated coordinates!');
