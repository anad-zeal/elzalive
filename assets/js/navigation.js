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
    const artworkIndex = await loadJson('/path/to/artworks.json'); // *** IMPORTANT: Update this path ***

    if (!artworkIndex || !artworkIndex.artworkCategories) {
      console.error('Artwork categories index not found or invalid.');
      return;
    }

    const artworksSection = document.createElement('div');
    artworksSection.className = 'gallery-menu'; // Matches your original HTML structure
    artworksSection.setAttribute('aria-labelledby', 'artworks-page-heading'); // Add ARIA if needed

    artworkIndex.artworkCategories.forEach((category) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = `${category.id} gallery`; // e.g., "black-and-white gallery"

      const link = document.createElement('a');
      link.href = '#'; // Use a hash or prevent default to handle client-side navigation
      link.className = 'gallery-link';
      link.setAttribute('data-category-id', category.id); // Custom attribute to identify category
      link.setAttribute('data-content-file', category.contentFile); // Store the JSON file to load
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
    event.preventDefault(); // Prevent default link behavior (page reload)

    const link = event.currentTarget;
    const categoryId = link.getAttribute('data-category-id');
    const contentFile = link.getAttribute('data-content-file');
    const filePath = `/path/to/your/artwork-content-files/${contentFile}`; // *** IMPORTANT: Update this base path ***

    // Show a loading indicator
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
    let html = `
            <h2 id="current-category-title">${categoryData.categoryTitle}</h2>
            <p>${categoryData.categoryDescription}</p>
            <div class="artwork-grid">
        `;

    if (categoryData.artworks && categoryData.artworks.length > 0) {
      categoryData.artworks.forEach((artwork) => {
        // *** IMPORTANT: Update your image path here as well ***
        const imagePath = `/assets/images/artwork-files/${categoryId}/${artwork.filename}`;
        const thumbPath = artwork.thumbFilename
          ? `/assets/images/artwork-files/${categoryId}/${artwork.thumbFilename}`
          : imagePath;

        html += `
                    <div class="artwork-item" id="artwork-${artwork.id}">
                        <img src="${thumbPath}" alt="${artwork.title}" loading="lazy">
                        <h3>${artwork.title}</h3>
                        <p>${artwork.description}</p>
                        ${artwork.year ? `<p>Year: ${artwork.year}</p>` : ''}
                        ${artwork.medium ? `<p>Medium: ${artwork.medium}</p>` : ''}
                        ${artwork.dimensions ? `<p>Dimensions: ${artwork.dimensions}</p>` : ''}
                        <button class="view-artwork-detail" data-artwork-id="${
                          artwork.id
                        }" data-full-image="${imagePath}">View Details</button>
                    </div>
                `;
      });
    } else {
      html += `<p>No artworks found for this category yet.</p>`;
    }

    html += `</div>`; // Close artwork-grid
    mainContentArea.innerHTML = html;

    // Example: Add event listeners for "View Details" buttons
    mainContentArea.querySelectorAll('.view-artwork-detail').forEach((button) => {
      button.addEventListener('click', (e) => {
        const artworkId = e.target.getAttribute('data-artwork-id');
        const fullImage = e.target.getAttribute('data-full-image');
        alert(`Showing details for artwork ${artworkId}. Full image: ${fullImage}`);
        // In a real app, you'd open a modal or navigate to a detail page
      });
    });

    // Add a back button to return to the category list
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Categories';
    backButton.className = 'back-to-categories';
    backButton.addEventListener('click', renderArtworkCategories); // Go back to the main categories
    mainContentArea.prepend(backButton); // Add at the top
  }

  // --- Main navigation handler (similar to your homepage logic) ---
  async function handleMainNavigationClick(event) {
    const targetCategory = event.currentTarget.getAttribute('data-category');

    // Reset the content area if navigating away from an artwork category detail
    mainContentArea.innerHTML = '';

    if (targetCategory === 'artworks') {
      // Load and display the list of artwork categories
      renderArtworkCategories();
    } else {
      // Handle other main menu items (decorative, preservation)
      // This would likely fetch specific content for those main categories
      // For now, a placeholder:
      mainContentArea.innerHTML = `<p>Loading content for ${targetCategory}...</p>`;
      // Here you'd implement loading specific JSON for 'decorative' or 'preservation'
      // Example: const content = await loadJson(`/path/to/${targetCategory}-content.json`);
      // renderContent(content);
    }
  }

  // --- Attach event listeners to your *main* navigation menu items ---
  // Assuming your main navigation has links with 'data-category' attributes
  // e.g., <a href="#" data-category="artworks">Artwork Pages</a>
  navLinksContainer.querySelectorAll('a[data-category]').forEach((link) => {
    link.addEventListener('click', handleMainNavigationClick);
  });

  // Initial load: If you want to show the artwork categories immediately when
  // navigation.js loads and the mainContentArea is for artworks, uncomment this:
  renderArtworkCategories();
});
