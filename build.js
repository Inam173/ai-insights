// ====== 构建脚本：组装模块 → 生成 index.html ======
const fs = require('fs');

// 1. 读取各模块
const css = fs.readFileSync('src/style.css', 'utf8');
const body = fs.readFileSync('src/template.html', 'utf8');
const appJs = fs.readFileSync('src/app.js', 'utf8');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const dataStr = JSON.stringify(data);

// 2. 验证 app.js
try {
  new Function('window', appJs);
  console.log('✅ app.js syntax valid');
} catch(e) {
  console.error('❌ app.js syntax error:', e.message);
  process.exit(1);
}

// 3. 组装 index.html
const html = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n' +
  '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
  '<title>AI技术洞察平台</title>\n' +
  '<style>\n' + css + '\n</style>\n' +
  '</head>\n' +
  body + '\n' +
  '<script>window.__EMBEDDED_DATA__ = ' + dataStr + ';</script>\n' +
  '<script>\n' + appJs + '\n</script>\n' +
  '</body>\n</html>';

// 4. 写入
fs.writeFileSync('index.html', html);
console.log('✅ index.html generated:', html.length, 'bytes');

// 5. 验证最终 HTML 中的 JS
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let ok = true;
scripts.forEach((s, i) => {
  const code = s.replace(/<\/?script>/g, '').trim();
  if (!code || code.startsWith('tailwind.config')) return;
  try {
    new Function(code);
  } catch(e) {
    console.error('❌ Final JS block ' + i + ' error:', e.message);
    ok = false;
  }
});
if (ok) console.log('✅ Final JS all valid');
