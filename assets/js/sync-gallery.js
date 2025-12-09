/**
 * file: sync-gallery.js
 * Usage: node sync-gallery.js
 *
 * Features:
 * - Auto-generates JSON from images.
 * - Extracts Title, Medium, Dimensions, Description from IPTC Metadata.
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const ExifReader = require('exifreader'); // Requires: npm install exifreader

// --- CONFIGURATION ---

// 1. Project Root (Update if needed, or keep using __dirname if script is in root)
// If the script is INSIDE the project folder, __dirname is perfect.
const PROJECT_ROOT = __dirname;

const GALLERY_MAP = [
  { folder: 'decorative-painting', json: 'decorative-slideshow.json' },
  { folder: 'encaustic-paintings', json: 'encaustic-slideshow.json' },
  { folder: 'black-and-white-paintings', json: 'black-and-white-slideshow.json' },
  { folder: 'drip-series-paintings', json: 'drip-series-slideshow.json' },
  { folder: 'project-series-paintings', json: 'projects-slideshow.json' },
  { folder: 'historic-preservation', json: 'preservation-slideshow.json' },
];

const PATHS = {
  images: path.join(PROJECT_ROOT, 'assets', 'images'),
  json: path.join(PROJECT_ROOT, 'json-files'),
  webRoot: 'assets/images/',
};

// --- METADATA EXTRACTION ---
async function getMetadata(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const tags = ExifReader.load(fileBuffer);

    // Helper to safely get text from tags
    const getText = (tagName) => {
      if (tags[tagName] && tags[tagName].description) {
        // ExifReader returns arrays for some IPTC fields, ensure we get a string
        let val = tags[tagName].description;
        return Array.isArray(val) ? val[0] : val;
      }
      return '';
    };

    // --- MAPPING STRATEGY (Affinity Photo -> JSON) ---
    // Headline      -> Title
    // Credit        -> Medium
    // Source        -> Dimensions
    // Instructions  -> Description (fallback to Caption/Description)

    let title = getText('Headline') || getText('ObjectName') || '';
    let medium = getText('Credit') || '';
    let dimensions = getText('Source') || '';

    // Description check: Try "Instructions", then standard "Caption/Description"
    let description =
      getText('Instructions') || getText('Caption/Abstract') || getText('ImageDescription') || '';

    return { title, medium, dimensions, description };
  } catch (error) {
    console.error(`Warning: Could not read metadata for ${path.basename(filePath)}`);
    return { title: '', medium: '', dimensions: '', description: '' };
  }
}

function formatFallbackTitle(filename) {
  return filename
    .replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
    .replace(/-|_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// --- THE SYNC FUNCTION ---
async function syncGallery(config) {
  const folderPath = path.join(PATHS.images, config.folder);
  const jsonPath = path.join(PATHS.json, config.json);

  if (!fs.existsSync(folderPath)) return;

  // 1. Read files
  const filesOnDisk = fs.readdirSync(folderPath).filter((file) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
  });

  // 2. Read existing JSON (to preserve IDs)
  let existingData = [];
  if (fs.existsSync(jsonPath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {}
  }

  const newJsonData = [];
  let hasChanges = false;

  // 3. Process Files
  for (let index = 0; index < filesOnDisk.length; index++) {
    const filename = filesOnDisk[index];
    const filePath = path.join(folderPath, filename);
    const webSrc = `${PATHS.webRoot}${config.folder}/${filename}`;

    // Get Metadata from Image
    const meta = await getMetadata(filePath);

    // Check if we have an old entry (to keep the ID stable)
    const oldEntry = existingData.find((item) => item.src.endsWith(filename));
    const id = oldEntry ? oldEntry.id : `${config.folder}-${Date.now()}-${index}`;

    // Logic: If Metadata exists in image, use it.
    // If image metadata is empty, fallback to existing JSON data.
    // If both empty, use defaults.

    const finalEntry = {
      id: id,
      title: meta.title || (oldEntry ? oldEntry.title : formatFallbackTitle(filename)),
      src: webSrc,
      description: meta.description || (oldEntry ? oldEntry.description : ''),
      medium: meta.medium || (oldEntry ? oldEntry.medium : ''),
      dimensions: meta.dimensions || (oldEntry ? oldEntry.dimensions : ''),
    };

    // Compare to see if we need to save
    if (!oldEntry || JSON.stringify(oldEntry) !== JSON.stringify(finalEntry)) {
      hasChanges = true;
    }

    newJsonData.push(finalEntry);
  }

  // 4. Check for Deletions
  if (existingData.length !== newJsonData.length) hasChanges = true;

  // 5. Save
  if (hasChanges) {
    fs.writeFileSync(jsonPath, JSON.stringify(newJsonData, null, 2));
    console.log(`[Updated] ${config.json} (Synced with IPTC Metadata)`);
  }
}

// --- EXECUTION ---
console.log('--- Starting Gallery Sync with IPTC Support ---');

// Run once
GALLERY_MAP.forEach((c) => syncGallery(c));

// Watcher
const watcher = chokidar.watch(PATHS.images, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: true, // Important: waits for Affinity to finish saving the file
  depth: 2,
});

watcher
  .on('add', (path) => {
    console.log(`File added: ${path}`);
    GALLERY_MAP.forEach((c) => syncGallery(c));
  })
  .on('change', (path) => {
    console.log(`File edited (Metadata change): ${path}`);
    GALLERY_MAP.forEach((c) => syncGallery(c));
  })
  .on('unlink', (path) => {
    console.log(`File removed: ${path}`);
    GALLERY_MAP.forEach((c) => syncGallery(c));
  });

console.log('--- Watching for changes... ---');
