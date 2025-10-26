document.addEventListener('DOMContentLoaded', () => {
  const mainContentArea = document.querySelector('.main-content-area'); // Assuming an element to load content into
  const navLinksContainer = document.querySelector('.main-navigation-menu'); // Or wherever your main nav links are

  // --- Core function to load JSON data ---
  async function loadJson(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading JSON:', error);
      mainContentArea.innerHTML = `<p class="error-message">Failed to load content. Please try again later. (Error: ${error.message})</p>`;
      return null;
    }
  }

  // --- Function to render artwork category menu (from artworks.json) ---
  async function renderArtworkCategories() {
    // *** IMPORTANT: Update this path to where your artworks.json (the index file) is located ***
    const artworkIndex = await loadJson('/data/artworks.json');

    if (!artworkIndex || !artworkIndex.artworkCategories) {
      console.error('Artwork categories index not found or invalid.');
      return;
    }

    const artworksSection = document.createElement('div');
    artworksSection.className = 'gallery-menu';
    artworksSection.setAttribute('aria-labelledby', 'artworks-page-heading');

    artworkIndex.artworkCategories.forEach((category) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = `${category.id} gallery`;

      const link = document.createElement('a');
      link.href = '#';
      link.className = 'gallery-link';
      link.setAttribute('data-category-id', category.id);
      link.setAttribute('data-content-file', category.contentFile);
      link.setAttribute('aria-label', category.ariaLabel);
      link.textContent = category.title;

      const descriptionP = document.createElement('p');
      descriptionP.textContent = category.description;

      categoryDiv.appendChild(link);
      categoryDiv.appendChild(descriptionP);
      artworksSection.appendChild(categoryDiv);
    });

    // Clear existing content and append new categories
    mainContentArea.innerHTML = '';
    mainContentArea.appendChild(artworksSection);

    // Add event listeners to the newly created links
    artworksSection.querySelectorAll('.gallery-link').forEach((link) => {
      link.addEventListener('click', handleArtworkCategoryClick);
    });
  }

  // --- Function to handle clicks on artwork category links ---
  async function handleArtworkCategoryClick(event) {
    event.preventDefault();

    const link = event.currentTarget;
    const categoryId = link.getAttribute('data-category-id');
    const contentFile = link.getAttribute('data-content-file');
    // *** IMPORTANT: Update this base path to the directory containing your individual category JSON files ***
    const filePath = `/data/artwork-content-files/${contentFile}`;

    mainContentArea.innerHTML = '<p class="loading-message">Loading artworks...</p>';
    console.log(`Loading content for category: ${categoryId} from ${filePath}`);

    const categoryData = await loadJson(filePath);

    if (categoryData) {
      renderArtworksForCategory(categoryId, categoryData);
    } else {
      // Error message already handled by loadJson
    }
  }

  // --- Function to render the actual artworks for a selected category ---
  function renderArtworksForCategory(categoryId, categoryData) {
    // Ensure the categoryData has a metadata.basePath for images
    const imageBasePath =
      categoryData.metadata && categoryData.metadata.basePath
        ? categoryData.metadata.basePath
        : `/default/path/if/not/specified/${categoryId}/`; // *** Fallback: Define a sensible default or throw an error ***

    let html = `
      <h2 id="current-category-title">${categoryData.categoryTitle}</h2>
      <p>${categoryData.categoryDescription}</p>
      <div class="artwork-grid">
    `;

    if (categoryData.artworks && categoryData.artworks.length > 0) {
      categoryData.artworks.forEach((artwork) => {
        // Construct paths using the dynamic imageBasePath
        const imageSrc = imageBasePath + artwork.filename;
        const thumbSrc = artwork.thumbFilename ? imageBasePath + artwork.thumbFilename : imageSrc;

        html += `
          <div class="artwork-item" id="artwork-${artwork.id}">
            <img src="${thumbSrc}" alt="${artwork.title}" loading="lazy">
            <h3>${artwork.title}</h3>
            <p>${artwork.description}</p>
            ${artwork.year ? `<p>Year: ${artwork.year}</p>` : ''}
            ${artwork.medium ? `<p>Medium: ${artwork.medium}</p>` : ''}
            ${artwork.dimensions ? `<p>Dimensions: ${artwork.dimensions}</p>` : ''}
            <button class="view-artwork-detail" data-artwork-id="${
              artwork.id
            }" data-full-image="${imageSrc}">View Details</button>
          </div>
        `;
      });
    } else {
      html += `<p>No artworks found for this category yet.</p>`;
    }

    html += `</div>`;
    mainContentArea.innerHTML = html;

    mainContentArea.querySelectorAll('.view-artwork-detail').forEach((button) => {
      button.addEventListener('click', (e) => {
        const artworkId = e.target.getAttribute('data-artwork-id');
        const fullImage = e.target.getAttribute('data-full-image');
        alert(`Showing details for artwork ${artworkId}. Full image: ${fullImage}`);
      });
    });

    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Categories';
    backButton.className = 'back-to-categories';
    backButton.addEventListener('click', renderArtworkCategories);
    mainContentArea.prepend(backButton);
  }

  // --- Main navigation handler ---
  async function handleMainNavigationClick(event) {
    event.preventDefault(); // Prevent full page reload

    const targetCategory = event.currentTarget.getAttribute('data-category');

    // Reset the content area when navigating between main categories
    mainContentArea.innerHTML = '';

    if (targetCategory === 'artworks') {
      renderArtworkCategories();
    } else if (targetCategory === 'decorative') {
      // Logic for 'Decorative Painting' page
      mainContentArea.innerHTML = `<p class="loading-message">Loading Decorative Painting content...</p>`;
      // You would load 'decorative.json' here
      const decorativeContent = await loadJson('/data/decorative.json'); // *** Update this path ***
      if (decorativeContent) {
        // Assuming decorative.json has an 'images' array and 'metadata.basePath'
        renderDecorativeSlideshow(decorativeContent);
      }
    } else {
      // Handle other main menu items (e.g., 'preservation')
      mainContentArea.innerHTML = `<p class="loading-message">Loading content for ${targetCategory}...</p>`;
      // Example: const content = await loadJson(`/data/${targetCategory}-content.json`);
      // if (content) { renderGenericContent(content); }
    }
  }

  // --- New function to render the decorative slideshow (based on decorative.json) ---
  function renderDecorativeSlideshow(decorativeData) {
    const imageBasePath =
      decorativeData.metadata && decorativeData.metadata.basePath
        ? decorativeData.metadata.basePath
        : `/default/path/for/decorative/images/`; // Fallback for decorative images

    let slideshowHtml = `
      <div class="slideshow-section">
        <h2>${decorativeData.menuItems[0].title || 'Decorative Painting'}</h2>
        <p>${decorativeData.menuItems[0].description || ''}</p>
        <div class="slideshow" data-category="decorative">
          <div data-role="stage">
    `;

    if (decorativeData.images && decorativeData.images.length > 0) {
      decorativeData.images.forEach((image, index) => {
        const imageSrc = imageBasePath + image.filename;
        slideshowHtml += `
          <img src="${imageSrc}"
               alt="${image.title}"
               style="display: ${index === 0 ? 'block' : 'none'};"
               data-index="${index}">
        `;
      });
    } else {
      slideshowHtml += `<p>No decorative images found.</p>`;
    }

    slideshowHtml += `
          </div>
          <!-- Add navigation buttons here if needed for the slideshow -->
          <button class="slideshow-prev">Previous</button>
          <button class="slideshow-next">Next</button>
        </div>
      </div>
    `;
    mainContentArea.innerHTML = slideshowHtml;

    // --- Slideshow Logic (client-side manipulation of 'display' style) ---
    const slideshowContainer = mainContentArea.querySelector('.slideshow');
    if (slideshowContainer) {
      const images = slideshowContainer.querySelectorAll('img');
      const prevButton = slideshowContainer.querySelector('.slideshow-prev');
      const nextButton = slideshowContainer.querySelector('.slideshow-next');
      let currentIndex = 0;

      function showImage(index) {
        images.forEach((img, i) => {
          img.style.display = i === index ? 'block' : 'none';
        });
      }

      prevButton.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        showImage(currentIndex);
      });

      nextButton.addEventListener('click', () => {
        currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        showImage(currentIndex);
      });

      showImage(currentIndex); // Initialize first image
    }
  }

  // --- Attach event listeners to your *main* navigation menu items ---
  // Ensure your main navigation links have 'data-category' attributes like:
  // <a href="#" data-category="decorative">Decorative Painting</a>
  // <a href="#" data-category="artworks">Artwork Pages</a>
  // <a href="#" data-category="preservation">Historical Preservation</a>
  if (navLinksContainer) {
    navLinksContainer.querySelectorAll('a[data-category]').forEach((link) => {
      link.addEventListener('click', handleMainNavigationClick);
    });
  } else {
    console.warn('No .main-navigation-menu found. Main navigation might not be functional.');
  }

  // --- Initial Page Load Handling ---
  // This part determines what content to show when the page first loads.
  // We can check the URL's hash or a query parameter to decide.
  // For example, if the URL is "index.php#artworks" or "index.php?page=artworks"

  // Simple example: If no specific hash is present, render the Artwork Categories by default
  // Or, based on the actual page (e.g., if this JS loads on an 'artworks.php' page)
  // Let's assume for now, that if the script runs on a page intended for dynamic content,
  // we might want to show artwork categories first, or check a URL parameter.

  // For demonstration, let's assume you want to load the Artwork Categories
  // if the URL contains '#artworks' or if no specific dynamic content is requested
  const initialCategory = new URLSearchParams(window.location.search).get('category');
  const initialHash = window.location.hash.substring(1); // Remove '#'

  if (initialHash === 'artworks' || initialCategory === 'artworks') {
    renderArtworkCategories();
  } else if (initialHash === 'decorative' || initialCategory === 'decorative') {
    // Load decorative content on initial load if URL indicates
    mainContentArea.innerHTML = `<p class="loading-message">Loading Decorative Painting content...</p>`;
    loadJson('/data/decorative.json').then((decorativeContent) => {
      // *** Update this path ***
      if (decorativeContent) {
        renderDecorativeSlideshow(decorativeContent);
      }
    });
  } else {
    // Default initial load: perhaps render the artwork categories if nothing else is specified
    // Or leave mainContentArea empty until a navigation item is clicked
    renderArtworkCategories(); // Default to showing artwork categories
  }
});
