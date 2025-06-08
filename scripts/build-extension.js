const fs = require('fs-extra');
const path = require('path');

async function buildExtension() {
  try {
    console.log('Building Chrome extension...');
    
    // Ensure extension-dist directory exists
    await fs.ensureDir('extension-dist');
    
    // Copy manifest.json to extension-dist directory
    await fs.copy('manifest.json', 'extension-dist/manifest.json');
    
    // Copy assets directory if it exists (for future images/files)
    if (await fs.pathExists('assets')) {
      await fs.copy('assets', 'extension-dist/assets');
      console.log('Copied assets folder');
    }
    
    // Rename _next to next-assets (Chrome doesn't allow folders starting with _)
    const nextDir = path.join('extension-dist', '_next');
    const nextAssetsDir = path.join('extension-dist', 'next-assets');
    
    if (await fs.pathExists(nextDir)) {
      await fs.move(nextDir, nextAssetsDir);
      console.log('Renamed _next to next-assets for Chrome compatibility');
      
      // Update HTML files to reference next-assets instead of _next
      const htmlFiles = ['index.html', '404.html'];
      
      for (const htmlFile of htmlFiles) {
        const htmlPath = path.join('extension-dist', htmlFile);
        if (await fs.pathExists(htmlPath)) {
          let content = await fs.readFile(htmlPath, 'utf8');
          content = content.replace(/_next\//g, 'next-assets/');
          await fs.writeFile(htmlPath, content);
          console.log(`Updated ${htmlFile} to reference next-assets`);
        }
      }
    }
    
    // Check if index.html exists
    const indexPath = path.join('extension-dist', 'index.html');
    if (await fs.pathExists(indexPath)) {
      console.log('Extension build completed successfully!');
      console.log('You can now load the extension-dist/ folder in Chrome extensions');
    } else {
      console.error('Build failed: index.html not found');
    }
    
  } catch (error) {
    console.error('Error building extension:', error);
    process.exit(1);
  }
}

buildExtension(); 