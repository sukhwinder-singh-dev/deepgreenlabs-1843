import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function extractCSSColors() {
  const themePath = join(__dirname, '../app/styles/theme.css');
  
  if (!existsSync(themePath)) {
    console.warn('⚠️  app/styles/theme.css not found, using defaults');
    return { backgroundColor: '#000000', themeColor: '#000000' };
  }

  try {
    const cssContent = readFileSync(themePath, 'utf-8');
    
    const base10Match = cssContent.match(/--oui-color-base-7:\s*(\d+)\s+(\d+)\s+(\d+)/);
    
    const primaryMatch = cssContent.match(/--oui-color-primary:\s*(\d+)\s+(\d+)\s+(\d+)/);
    
    const backgroundColor = base10Match 
      ? rgbToHex(base10Match[1], base10Match[2], base10Match[3])
      : '#000000';
    
    const themeColor = primaryMatch
      ? rgbToHex(primaryMatch[1], primaryMatch[2], primaryMatch[3])
      : '#000000';

    console.log(`✓ Extracted colors from theme.css: bg=${backgroundColor}, theme=${themeColor}`);
    
    return { backgroundColor, themeColor };
  } catch (error) {
    console.error('❌ Failed to parse theme.css:', error.message);
    return { backgroundColor: '#000000', themeColor: '#000000' };
  }
}

function loadConfig() {
  const configPath = join(__dirname, '../public/config.js');
  
  if (!existsSync(configPath)) {
    console.warn('⚠️  public/config.js not found, using defaults');
    return {};
  }

  try {
    const configText = readFileSync(configPath, 'utf-8');
    const jsonText = configText
      .replace(/window\.__RUNTIME_CONFIG__\s*=\s*/, '')
      .replace(/;$/, '')
      .trim();
    
    const config = JSON.parse(jsonText);
    console.log('✓ Loaded config from public/config.js');
    return config;
  } catch (error) {
    console.error('❌ Failed to parse config.js:', error.message);
    console.log('✓ Using default values');
    return {};
  }
}

function generateManifest() {
  const config = loadConfig();
  const colors = extractCSSColors();

  const manifest = {
    name: config.VITE_APP_NAME || "Orderly DEX",
    short_name: config.VITE_APP_NAME || "Orderly DEX",
    description: config.VITE_APP_DESCRIPTION || "A powerful perpetual trading DEX powered by Orderly Network",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: colors.backgroundColor,
    theme_color: colors.themeColor,
    orientation: "any",
    icons: [
      {
        src: "/favicon.webp",
        sizes: "200x200",
        type: "image/webp",
        purpose: "any maskable"
      }
    ],
    categories: ["finance", "business"],
    shortcuts: [
      {
        name: "Trading",
        short_name: "Trade",
        description: "Start trading perpetuals",
        url: "/perp",
        icons: [
          {
            src: "/favicon.webp",
            sizes: "200x200",
            type: "image/webp"
          }
        ]
      },
      {
        name: "Portfolio",
        short_name: "Portfolio",
        description: "View your portfolio",
        url: "/portfolio",
        icons: [
          {
            src: "/favicon.webp",
            sizes: "200x200",
            type: "image/webp"
          }
        ]
      }
    ],
    screenshots: [],
    related_applications: [],
    prefer_related_applications: false
  };

  return manifest;
}

function writeManifestFiles(manifest) {
  const publicPath = join(__dirname, '../public/manifest.json');
  writeFileSync(publicPath, JSON.stringify(manifest, null, 2));
  console.log('✓ Generated: public/manifest.json');

  const buildPath = join(__dirname, '../build/client/manifest.json');
  const buildDir = dirname(buildPath);
  
  if (existsSync(buildDir)) {
    writeFileSync(buildPath, JSON.stringify(manifest, null, 2));
    console.log('✓ Generated: build/client/manifest.json');
  }
}

try {
  console.log('\n🔨 Generating PWA manifest...\n');
  const manifest = generateManifest();
  writeManifestFiles(manifest);
  console.log('\n✅ Manifest generation complete!\n');
} catch (error) {
  console.error('❌ Error generating manifest:', error.message);
  // eslint-disable-next-line no-undef
  process.exit(1);
}

