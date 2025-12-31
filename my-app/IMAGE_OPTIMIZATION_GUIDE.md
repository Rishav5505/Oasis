# Image Optimization Guide for Oasis Application

## Current Status
- **Total Images**: 36+ files (JPG, PNG, WebP, SVG)
- **Largest Files**: Hero images in `src/assets/` (500KB+ each)
- **Format**: Mostly uncompressed JPG

## Optimization Steps

### 1. Convert to WebP Format
WebP provides 25-35% better compression than JPEG.

**Tools to Use:**
```bash
# Install sharp (Node.js image processing)
npm install sharp --save-dev

# Or use online tools:
# - https://squoosh.app/ (Google's image optimizer)
# - https://tinypng.com/ (PNG/JPG compression)
```

### 2. Recommended Sizes

| Image Type | Max Width | Max Height | Format | Quality |
|------------|-----------|------------|--------|---------|
| Hero Images | 1920px | 1080px | WebP | 80% |
| Logos | 512px | 512px | PNG/SVG | 100% |
| Thumbnails | 400px | 300px | WebP | 75% |
| Event Images | 800px | 600px | WebP | 80% |

### 3. Files to Optimize (Priority Order)

#### High Priority (>500KB):
- `550553801_1326566848853849_*.jpg`
- `550492546_1326566672187200_*.jpg`
- `552586383_1326566728853861_*.jpg`
- `552813229_1326566475520553_*.jpg`
- `476640718_1290058428715783_*.jpg`
- `Bnner.jpg`
- `best.jpg`, `best 2.jpg`, `best 3.jpg`

#### Medium Priority (100-500KB):
- All `474*` and `475*` series images
- `classroom_hero.png`

#### Low Priority (<100KB):
- Logos (already optimized)
- SVG files (vector, no compression needed)

### 4. Implementation Code

Create `scripts/optimize-images.js`:

\`\`\`javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './src/assets';
const outputDir = './src/assets/optimized';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all JPG files
const files = fs.readdirSync(inputDir).filter(f => 
  f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
);

files.forEach(async (file) => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
  
  await sharp(inputPath)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
    
  console.log(`✅ Optimized: ${file} → ${path.basename(outputPath)}`);
});
\`\`\`

### 5. Lazy Loading Implementation

Update `Home.jsx` to use lazy loading:

\`\`\`javascript
// Add loading="lazy" to images
<img 
  src={heroImage} 
  alt="Hero" 
  loading="lazy"
  className="..."
/>
\`\`\`

### 6. Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Size | ~15MB | ~4MB | 73% reduction |
| Load Time | 8-12s | 2-4s | 66% faster |
| Page Speed Score | 60-70 | 85-95 | +25 points |

### 7. Quick Win Actions (Manual)

1. **Use Squoosh.app** (Recommended for quick results):
   - Visit https://squoosh.app/
   - Drag and drop each large JPG
   - Select WebP format, 80% quality
   - Resize to max 1920x1080
   - Download and replace

2. **Batch Processing**:
   - Select all hero images
   - Use Windows Photos → Resize → Large (1920px)
   - Use TinyPNG.com for compression

### 8. Automated Solution

Add to `package.json`:

\`\`\`json
{
  "scripts": {
    "optimize-images": "node scripts/optimize-images.js"
  }
}
\`\`\`

Run: `npm run optimize-images`

## Maintenance

- **New Images**: Always optimize before adding to `src/assets`
- **Check Size**: Keep images under 200KB each
- **Use WebP**: Prefer WebP over JPG/PNG for photos
- **Use SVG**: For logos and icons

## Notes

- Keep original images in a separate `originals/` folder (not in `src`)
- Test on slow 3G connection after optimization
- Monitor bundle size with `npm run build -- --report`
