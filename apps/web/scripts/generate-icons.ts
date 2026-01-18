import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

interface IconConfig {
  size: number;
  filename: string;
  maskable?: boolean;
}

const ICON_SIZES: IconConfig[] = [
  { size: 48, filename: 'icon-48x48.png' },
  { size: 96, filename: 'icon-96x96.png' },
  { size: 128, filename: 'icon-128x128.png' },
  { size: 144, filename: 'icon-144x144.png' },
  { size: 152, filename: 'icon-152x152.png' },
  { size: 192, filename: 'icon-192x192.png' },
  { size: 256, filename: 'icon-256x256.png' },
  { size: 512, filename: 'icon-512x512.png' },
  { size: 512, filename: 'icon-512x512-maskable.png', maskable: true },
  { size: 1024, filename: 'icon-1024x1024.png' }
];

function createSVG(size: number, maskable: boolean = false): Buffer {
  const primaryColor = '#343a40';
  const padding = maskable ? Math.floor(size * 0.4) : Math.floor(size * 0.1);
  const contentSize = size - (padding * 2);
  const fontSize = Math.floor(contentSize * 0.5);
  const circleSize = Math.floor(contentSize * 0.8);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${primaryColor}" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${circleSize / 2}" fill="white" />
      <text x="50%" y="50%" 
            font-family="Arial, sans-serif" 
            font-size="${fontSize}" 
            font-weight="bold" 
            fill="${primaryColor}" 
            text-anchor="middle" 
            dominant-baseline="central">TT</text>
    </svg>
  `;

  return Buffer.from(svg);
}

async function generateIcons() {
  const outputDir = join(process.cwd(), 'public', 'icons');

  try {
    await mkdir(outputDir, { recursive: true });

    console.log('Generating app icons...');

    for (const config of ICON_SIZES) {
      const svgBuffer = createSVG(config.size, config.maskable);
      const outputPath = join(outputDir, config.filename);

      await sharp(svgBuffer)
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);

      console.log(`Generated: ${config.filename}`);
    }

    console.log('\nAll icons generated successfully!');
    console.log(`Output directory: ${outputDir}`);
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
