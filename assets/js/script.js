document.addEventListener("DOMContentLoaded", () => {
  alert("Hello World!");
  // DOM Elements
  const links = document.querySelectorAll(".link-3");
  const wrapper = document.getElementById("slideshow-wrapper");
  const galleryTitle = document.getElementById("gallery-title");

  const imgElement = document.getElementById("current-image");
  const titleElement = document.getElementById("slide-title");
  const descElement = document.getElementById("slide-desc");
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");

  // Slideshow State
  let currentImages = [];
  let currentIndex = 0;

  // --- 1. Handle Menu Clicks ---
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Styling: Active State
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Get Data
      const folderName = link.getAttribute("data_page");
      const friendlyName = link.textContent;

      loadImages(folderName, friendlyName);
    });
  });

  // --- 2. Fetch Images from PHP ---
  function loadImages(folder, name) {
    // Reset UI
    galleryTitle.textContent = `Loading ${name}...`;
    wrapper.style.display = "none"; // Hide until loaded

    fetch(`get_images.php?folder=${folder}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          galleryTitle.textContent = "Error: " + data.error;
          return;
        }

        if (data.length === 0) {
          galleryTitle.textContent = `No images found in ${name}.`;
          return;
        }

        // Success: Initialize Slideshow
        currentImages = data;
        currentIndex = 0;

        galleryTitle.textContent = name;
        wrapper.style.display = "flex"; // Show grid

        displaySlide(currentIndex);
      })
      .catch((err) => {
        console.error(err);
        galleryTitle.textContent = "Error loading gallery.";
      });
  }

  // --- 3. Display Logic ---
  function displaySlide(index) {
    const slide = currentImages[index];

    // Simple fade out
    imgElement.style.opacity = 0.5;

    setTimeout(() => {
      imgElement.src = slide.path;
      titleElement.textContent = slide.title;
      descElement.textContent = slide.description;

      // Fade in
      imgElement.style.opacity = 1;
    }, 150);
  }

  // --- 4. Button Listeners ---
  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
      currentIndex++;
      if (currentIndex >= currentImages.length) {
        currentIndex = 0;
      }
      displaySlide(currentIndex);
    });

    prevBtn.addEventListener("click", () => {
      currentIndex--;
      if (currentIndex < 0) {
        currentIndex = currentImages.length - 1;
      }
      displaySlide(currentIndex);
    });
  }
});
