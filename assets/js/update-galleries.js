/**
 * update-galleries.js
 * Watches image directories, updates JSON metadata, and pushes changes to Git.
 * Usage: node update-galleries.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // Required for running Git commands

// --- CONFIGURATION ---
const galleries = [
  {
    path: 'encaustic-paintings',
    json: 'encaustic-slideshow.json',
    prefix: 'encaustic',
    title: 'Encaustic',
  },
  {
    path: 'drip-series-paintings',
    json: 'drip-series-slideshow.json',
    prefix: 'drip',
    title: 'Drip Series',
  },
  {
    path: 'black-and-white-paintings',
    json: 'black-and-white-slideshow.json',
    prefix: 'bw',
    title: 'Black & White',
  },
  {
    path: 'project-series-paintings',
    json: 'projects-slideshow.json',
    prefix: 'proj',
    title: 'Project Series',
  },
  {
    path: 'decorative-paintings',
    json: 'decorative-slideshow.json',
    prefix: 'deco',
    title: 'Decorative',
  },
  {
    path: 'historic-preservation',
    json: 'preservation-slideshow.json',
    prefix: 'pres',
    title: 'Preservation',
  },
];

const BASE_URL = 'assets/images/';
const IMG_ROOT = path.join(__dirname, 'assets', 'images');
const JSON_ROOT = path.join(__dirname, 'json-files');

// --- HELPER FUNCTIONS ---

// 1. Convert filename to Title Case
function filenameToTitle(filename) {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/-/g, ' ')
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

// 2. Git Automation Function
function commitAndPush(galleryName) {
  console.log(`☁️  Git: Staging and committing changes for ${galleryName}...`);

  // The command chain: Add all changes -> Commit with message -> Push
  const command = `git add . && git commit -m "Auto-update ${galleryName} gallery images" && git push`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Git Error: ${error.message}`);
      return;
    }
    if (stderr && !stderr.includes('To https')) {
      // Git often outputs progress to stderr, so we only log if it looks like a real error
      // or just log it for info if needed.
      console.log(`Git Status: ${stderr}`);
    }
    console.log(`✅ Git Push Successful: ${stdout}`);
  });
}

// 3. Core logic to sync a single gallery
// Returns TRUE if changes were made, FALSE if not
function syncGallery(galleryConf) {
  const imgDir = path.join(IMG_ROOT, galleryConf.path);
  const jsonPath = path.join(JSON_ROOT, galleryConf.json);

  if (!fs.existsSync(imgDir)) {
    console.log(`[Warning] Directory not found: ${imgDir}`);
    return false;
  }

  let currentData = [];
  if (fs.existsSync(jsonPath)) {
    try {
      currentData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {
      currentData = [];
    }
  }

  const files = fs.readdirSync(imgDir).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  let hasChanges = false;
  const newJsonData = [];

  // Rebuild list
  files.forEach((file, index) => {
    const webPath = `${BASE_URL}${galleryConf.path}/${file}`;
    const existingEntry = currentData.find((item) => item.src === webPath);

    if (existingEntry) {
      newJsonData.push(existingEntry);
    } else {
      hasChanges = true; // NEW FILE DETECTED
      console.log(`[Added] ${file} to ${galleryConf.json}`);

      const idNum = index + 1;
      newJsonData.push({
        id: `${galleryConf.prefix}-${idNum}`,
        title: filenameToTitle(file),
        src: webPath,
        caption: filenameToTitle(file),
        description: `Description for ${filenameToTitle(file)}`,
        medium: 'Medium TBD',
        dimensions: '00" x 00"',
      });
    }
  });

  // Check if files were DELETED (length mismatch)
  if (currentData.length !== newJsonData.length) {
    hasChanges = true;
    console.log(`[Cleaned] Removed missing files from ${galleryConf.json}`);
  }

  // Save and Return Status
  if (hasChanges) {
    fs.writeFileSync(jsonPath, JSON.stringify(newJsonData, null, 2));
    console.log(`[Updated] ${galleryConf.json} saved locally.`);
    return true;
  }

  return false;
}

// --- EXECUTION ---

console.log('--- Synchronizing Galleries ---');

// Initial Run
let initialChanges = false;
galleries.forEach((g) => {
  const changed = syncGallery(g);
  if (changed) initialChanges = true;
});

// If changes found on startup, push them
if (initialChanges) {
  commitAndPush('Multiple Galleries (Startup)');
} else {
  console.log('No changes detected on startup.');
}

console.log('\n--- Watching for changes (Ctrl+C to stop) ---');

// Watcher
galleries.forEach((g) => {
  const dir = path.join(IMG_ROOT, g.path);
  if (fs.existsSync(dir)) {
    let debounceTimer;

    fs.watch(dir, (eventType, filename) => {
      if (filename && !filename.startsWith('.')) {
        // Debounce to prevent multiple git commits for a single file copy
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(`\nDetected change in ${g.title}...`);
          const changed = syncGallery(g);
          if (changed) {
            commitAndPush(g.title);
          }
        }, 1000); // Wait 1 second after file activity stops before processing
      }
    });
  }
});
