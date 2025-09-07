#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing bundle size...\n');

try {
  // Run Next.js bundle analyzer
  console.log('📊 Running bundle analysis...');
  execSync('bun run build', { stdio: 'inherit' });
  
  // Check if .next/analyze directory exists
  const analyzeDir = path.join(process.cwd(), '.next', 'analyze');
  if (fs.existsSync(analyzeDir)) {
    console.log('✅ Bundle analysis completed!');
    console.log('📁 Analysis files saved to .next/analyze/');
    
    // Read and display summary
    const clientManifest = path.join(analyzeDir, 'client-manifest.json');
    if (fs.existsSync(clientManifest)) {
      const manifest = JSON.parse(fs.readFileSync(clientManifest, 'utf8'));
      console.log('\n📈 Bundle Summary:');
      console.log(`Total chunks: ${Object.keys(manifest).length}`);
      
      // Calculate total size
      let totalSize = 0;
      Object.values(manifest).forEach(chunk => {
        if (chunk.size) totalSize += chunk.size;
      });
      
      console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    }
  } else {
    console.log('⚠️  Bundle analysis files not found. Make sure to run with ANALYZE=true');
  }
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}

console.log('\n💡 Tips for optimization:');
console.log('- Use dynamic imports for large components');
console.log('- Implement code splitting for routes');
console.log('- Optimize images with next/image');
console.log('- Remove unused dependencies');
console.log('- Use tree shaking for better bundle size');
