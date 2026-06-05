import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const svgPath = path.join(__dirname, '..', 'public', 'app-icon.svg')
const svgContent = fs.readFileSync(svgPath, 'utf-8')

const sizes = [192, 512]

for (const size of sizes) {
  // For PNG icons, we render the SVG at the desired size
  const png = await sharp(Buffer.from(svgContent))
    .resize(size, size)
    .png()
    .toBuffer()

  const outPath = path.join(__dirname, '..', 'public', `icon-${size}.png`)
  fs.writeFileSync(outPath, png)
  console.log(`✅ Generated ${outPath} (${size}x${size})`)
}

// Also copy SVG as icon.svg
fs.copyFileSync(svgPath, path.join(__dirname, '..', 'public', 'icon.svg'))
console.log('✅ Done!')
