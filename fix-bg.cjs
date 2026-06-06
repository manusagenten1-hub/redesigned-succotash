const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Also we want to change `bg-[rgba(0,0,0,0.2)]` inside the className of select tags to `bg-[#210606]`
  // We'll just replace 'bg-[rgba(0,0,0,0.2)]' with 'bg-[#210606] text-white' in any <select> tag.
  
  let newContent = content;
  
  // This regex matches <select ... > and mutates the class. Let's do it safer.
  newContent = newContent.replace(/(<select[^>]+className="[^"]*)bg-\[rgba\(0,0,0,0\.2\)\]([^"]*")/g, '$1bg-[#210606] text-white$2');
  newContent = newContent.replace(/(<select[^>]+className="[^"]*)bg-\[#151f28\]([^"]*")/g, '$1bg-[#210606] text-white$2');
  newContent = newContent.replace(/(<select[^>]+className="[^"]*)bg-black\/20([^"]*")/g, '$1bg-[#210606] text-white$2');
  newContent = newContent.replace(/(<input[^>]+className="[^"]*)bg-black\/20([^"]*")/g, '$1bg-[#210606] text-white$2');
  newContent = newContent.replace(/(<textarea[^>]+className="[^"]*)bg-black\/20([^"]*")/g, '$1bg-[#210606] text-white$2');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed inputs/selects background in', file);
  }
});
