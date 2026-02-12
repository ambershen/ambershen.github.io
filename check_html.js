const fs = require('fs');

try {
  const html = fs.readFileSync('index.html', 'utf8');
  
  // Simple parser
  const tags = [];
  const selfClosing = ['img', 'br', 'meta', 'link', 'input', 'hr', '!doctype'];
  
  let pos = 0;
  while (pos < html.length) {
    const lt = html.indexOf('<', pos);
    if (lt === -1) break;
    
    if (html.substring(lt, lt + 4) === '<!--') {
      const gt = html.indexOf('-->', lt);
      if (gt === -1) break;
      pos = gt + 3;
      continue;
    }
    
    const gt = html.indexOf('>', lt);
    if (gt === -1) break;
    
    const tagContent = html.substring(lt + 1, gt);
    const tagNameMatch = tagContent.match(/^(\/?)([\w-]+)/);
    
    if (tagNameMatch) {
      const isClosing = tagNameMatch[1] === '/';
      const tagName = tagNameMatch[2].toLowerCase();
      
      if (!selfClosing.includes(tagName)) {
        tags.push({ name: tagName, isClosing, line: html.substring(0, lt).split('\n').length });
      }
    }
    
    pos = gt + 1;
  }
  
  const stack = [];
  for (const tag of tags) {
    if (!tag.isClosing) {
      stack.push(tag);
    } else {
      if (stack.length === 0) {
        console.log(`Unexpected closing tag </${tag.name}> at line ${tag.line}`);
      } else {
        const last = stack[stack.length - 1];
        if (last.name === tag.name) {
          stack.pop();
        } else {
          console.log(`Mismatch: Expected </${last.name}> but found </${tag.name}> at line ${tag.line}`);
          // Don't pop if mismatch, might be missing closing tag
        }
      }
    }
  }
  
  if (stack.length > 0) {
    console.log('Unclosed tags:');
    stack.forEach(t => console.log(`<${t.name}> at line ${t.line}`));
  } else {
    console.log('HTML structure seems balanced.');
  }
  
} catch (err) {
  console.error(err);
}
