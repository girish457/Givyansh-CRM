import fs from 'fs';
import path from 'path';

const source = 'C:\\Users\\goswa\\.gemini\\antigravity\\brain\\b2ac0184-7996-47b1-b342-390cec8e12bc\\extension_icon_1779272875258.png';
const destination = 'c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\chrome-extension\\icon.png';

try {
  // Ensure target folder exists
  const destDir = path.dirname(destination);
  if (!fs.existsSync(destDir)){
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log('Icon copied successfully to ' + destination);
  } else {
    console.warn('Source icon file not found at ' + source);
    
    // Fallback: Create a tiny 1x1 transparent PNG if the generated image isn't accessible
    const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    fs.writeFileSync(destination, Buffer.from(base64Png, 'base64'));
    console.log('Created a transparent placeholder icon instead.');
  }
} catch (err) {
  console.error('Error during copy:', err.message);
}
