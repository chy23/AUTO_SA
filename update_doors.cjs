const fs = require('fs');
let content = fs.readFileSync('src/constants.js', 'utf8');

content = content.replace(/{ id: 'front-door'[^}]*}/g, (m) => m.replace('}', ", orientation: 'vertical' }"));
content = content.replace(/{ id: 'back-corridor'[^}]*}/g, (m) => m.replace('}', ", orientation: 'vertical' }"));
content = content.replace(/{ id: 'back-door'[^}]*}/g, (m) => m.replace('}', ", orientation: 'vertical' }"));
content = content.replace(/{ id: 'teacher'[^}]*}/g, (m) => m.replace('}', ", orientation: 'horizontal' }"));
content = content.replace(/{ id: 'restroom'[^}]*}/g, (m) => m.replace('}', ", orientation: 'horizontal' }"));

fs.writeFileSync('src/constants.js', content);
console.log('Updated constants.js!');
