document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');

  // Function to render content based on JSON structure
  function renderPageContent(data, pageName) {
    dynamicContentArea.innerHTML = ''; // Clear previous content

    if (pageName === 'home' && data.cardGrid) {
      const cardGridSection = document.createElement('section');
      cardGridSection.classList.add('card-grid');

      data.cardGrid.forEach((cardData) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');

        const menuItemDiv = document.createElement('div');
        menuItemDiv.classList.add('landing-menu-item');
        if (cardData.content.class) {
          menuItemDiv.classList.add(cardData.content.class);
        }

        if (cardData.content.link) {
          const a = document.createElement('a');
          a.href = cardData.content.link.href;
          a.classList.add(cardData.content.link.class);
          if (cardData.content.link.dataGallery) {
            a.setAttribute('data-gallery', cardData.content.link.dataGallery);
          }
          if (cardData.content.link.ariaLabel) {
            a.setAttribute('aria-label', cardData.content.link.ariaLabel);
          }
          a.textContent = cardData.content.link.text;
          menuItemDiv.appendChild(a);
        }

        if (cardData.content.paragraph) {
          if (cardData.content.paragraph.type === 'image') {
            const p = document.createElement('p');
            const img = document.createElement('img');
            img.src = cardData.content.paragraph.src;
            img.classList.add(cardData.content.paragraph.class);
            p.appendChild(img);
            menuItemDiv.appendChild(p);
          } else {
            const p = document.createElement('p');
            p.textContent = cardData.content.paragraph;
            menuItemDiv.appendChild(p);
          }
        }
        cardDiv.appendChild(menuItemDiv);
        cardGridSection.appendChild(cardDiv);
      });
      dynamicContentArea.appendChild(cardGridSection);
    } else if (pageName === 'artworks' && data.artworkCategories) {
      const categoryList = document.createElement('div');
      categoryList.classList.add('artwork-categories'); // You might want to style this

      const artworksTitle = document.createElement('h2');
      artworksTitle.textContent = 'Artwork Categories';
      dynamicContentArea.appendChild(artworksTitle);

      data.artworkCategories.forEach((category) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('artwork-category-item');
        categoryDiv.setAttribute('id', category.id);

        const categoryLink = document.createElement('a');
        categoryLink.href = `#${category.id}`; // Or to a dedicated category page
        categoryLink.setAttribute('aria-label', category.ariaLabel);
        categoryLink.textContent = category.title;

        const categoryDescription = document.createElement('p');
        categoryDescription.textContent = category.description;

        categoryDiv.appendChild(categoryLink);
        categoryDiv.appendChild(categoryDescription);
        categoryList.appendChild(categoryDiv);
      });
      dynamicContentArea.appendChild(categoryList);
    } else {
      // Fallback for unhandled or malformed JSON
      dynamicContentArea.innerHTML = `<h2>Content for "${pageName}"</h2><pre>${JSON.stringify(
        data,
        null,
        2
      )}</pre>`;
    }
  }

  // Function to load and display JSON content
  async function loadJsonContent(pageName) {
    const jsonFileName = `${pageName}.json`;

    try {
      const response = await fetch(`/json-files/${jsonFileName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      renderPageContent(data, pageName); // Call the new rendering function

      // Update active state of navigation links
      navLinks.forEach((link) => link.classList.remove('is-active'));
      const activeLink = document.querySelector(`.main-nav-menu a[data-page="${pageName}"]`);
      if (activeLink) {
        activeLink.classList.add('is-active');
      }
    } catch (error) {
      console.error(`Error loading JSON file for ${pageName}:`, error);
      dynamicContentArea.innerHTML = `<p>Error loading content for "${pageName}". Please try again.</p>`;
    }
  }

  // Add event listeners to navigation links
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const pageName = event.target.dataset.page;
      if (pageName) {
        loadJsonContent(pageName);
      }
    });
  });

  // Handle initial page load based on current URL path or a default
  // This assumes your navigation links have data-page attributes matching your JSON filenames (e.g., data-page="home", data-page="artworks")
  // You might need to adjust this based on your actual URL structure.
  const initialPage = window.location.pathname.split('/').pop() || 'home';
  loadJsonContent(initialPage);
});
