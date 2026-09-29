const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && !f.startsWith('.')) {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        callback(path.join(dir, f));
      }
    }
  });
}

walkDir('.', function(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/[ \t]*\/\/[ \t]*@ts-expect-error.*\r?\n/g, '')
                          .replace(/[ \t]*\{\/\*[ \t]*@ts-expect-error.*?\*\/\}\r?\n?/g, '');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated ' + filePath);
  }
});
