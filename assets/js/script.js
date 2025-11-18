<?php
// --- PRODUCTION-READY SCRIPT ---

// Turn OFF error reporting to the browser to ensure valid JSON output.
ini_set('display_errors', 0);
error_reporting(0);

// Set the header at the very beginning.
header('Content-Type: application/json');

// Use the __DIR__ constant for a reliable absolute path.
$baseImageDir = __DIR__ . '/images/';

// --- SECURITY & SETUP ---
$validFolders = array_map('basename', glob($baseImageDir . '*', GLOB_ONLYDIR));

$selectedFolder = null;
if (isset($_GET['folder']) && in_array($_GET['folder'], $validFolders)) {
    $selectedFolder = $_GET['folder'];
}

// --- DATA GATHERING ---
$imageData = [];

if ($selectedFolder) {
    $imageFolderPath = $baseImageDir . $selectedFolder . '/';

    // Check for both lowercase and uppercase file extensions.
    $files = glob($imageFolderPath . '*.{jpg,jpeg,png,gif,JPG,JPEG,PNG,GIF}', GLOB_BRACE);

    foreach ($files as $file) {
        $imageInfo = @getimagesize($file);
        if (!$imageInfo) continue;
        list($width, $height) = $imageInfo;

        $title = '';
        $description = '';
        $exif = @exif_read_data($file);

        if (!empty($exif['ImageDescription'])) $description = $exif['ImageDescription'];

        if (!empty($exif['DocumentName'])) {
            $title = $exif['DocumentName'];
        } else {
            $title = basename($file);
        }

        // Create a browser-friendly relative path.
        $relativePath = 'images/' . $selectedFolder . '/' . basename($file);

        $imageData[] = [
            'path' => $relativePath,
            'title' => $title,
            'description' => $description,
            'width' => $width,
            'height' => $height
        ];
    }
}

// --- FINAL OUTPUT ---
echo json_encode($imageData);
?>```

---

### File 3: `assets/js/script.js` (The Slideshow Engine)

This script handles the dropdown menu, fetches the data, and controls all slideshow behavior.

*   **Location:** `slideshow_project/assets/js/script.js`

```javascript
document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------
  // ELEMENT SELECTORS
  // -------------------------------------------------
  const slideshowContainer = document.getElementById("slideshow-container");
  const folderSelector = document.getElementById("folder-selector");

  // -------------------------------------------------
  // STATE
  // -------------------------------------------------
  let slides = [];
  let currentSlideIndex = 0;
  let slideshowInterval = null;

  // -------------------------------------------------
  // Build slideshow for a specific folder
  // -------------------------------------------------
  async function populateSlideshow(folderName) {
    clearInterval(slideshowInterval);

    // Initial loader UI
    slideshowContainer.innerHTML = `
      <p>Loading ${folderName.replace(/-/g, " ")}...</p>
      <button id="prev-button" class="slide-nav">
        <img src="assets/images/misc-images/prev.png" alt="Previous" />
      </button>
      <button id="next-button" class="slide-nav">
        <img src="assets/images/misc-images/next.png" alt="Next" />
      </button>
    `;

    try {
      const response = await fetch(`get_images.php?folder=${folderName}`);
      if (!response.ok) {
        throw new Error(`Network response error: ${response.statusText}`);
      }

      const images = await response.json();

      // Remove loader
      const loader = slideshowContainer.querySelector("p");
      if (loader) loader.remove();

      if (images.length === 0) {
        slideshowContainer.innerHTML = "<p>No images found in this gallery.</p>";
        return;
      }

      // Build slides
      images.forEach((img) => {
        const slide = document.createElement("div");
        slide.className = "slide";

        slide.innerHTML = `
          <img src="${img.path}" alt="${img.title}">
          <div class="slide-text">
            <h3>${img.title}</h3>
            <p>${img.description || ""}</p>
            <small>Dimensions: ${img.width}px &times; ${img.height}px</small>
          </div>
        `;

        slideshowContainer.prepend(slide);
      });

      startSlideshowRunner();
    } catch (err) {
      console.error("Error building slideshow:", err);
      slideshowContainer.innerHTML = "<p>Error loading images. Check console.</p>";
    }
  }

  // -------------------------------------------------
  // Initialize slideshow logic
  // -------------------------------------------------
  function startSlideshowRunner() {
    slides = [...document.querySelectorAll("#slideshow-container .slide")];
    currentSlideIndex = 0;

    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");

    if (slides.length <= 1) {
      if (slides.length === 1) showSlide(0);
      prevButton.style.display = "none";
      nextButton.style.display = "none";
      return;
    }

    prevButton.style.display = "block";
    nextButton.style.display = "block";

    prevButton.addEventListener("click", () => {
      prevSlide();
      resetInterval();
    });

    nextButton.addEventListener("click", () => {
      nextSlide();
      resetInterval();
    });

    showSlide(0);
    slideshowInterval = setInterval(nextSlide, 4000);
  }

  // -------------------------------------------------
  // SLIDESHOW HELPERS
  // -------------------------------------------------
  function showSlide(index) {
    slides.forEach((s, i) => {
      if (i === index) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });
  }

  function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(currentSlideIndex);
  }

  function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    showSlide(currentSlideIndex);
  }

  function resetInterval() {
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(nextSlide, 4000);
  }

  // -------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------
  if (folderSelector) {
    folderSelector.addEventListener("change", () => {
      populateSlideshow(folderSelector.value);
    });

    populateSlideshow(folderSelector.value);
  } else {
    console.error("Folder selector dropdown not found.");
  }
});
