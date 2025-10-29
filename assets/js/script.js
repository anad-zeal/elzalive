document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');
  const pageTitleElement = document.querySelector('.hero .page-title');

  /**
   * Renders a grid of cards from a JSON object into the dynamic content area.
   * This is the new function that replaces the direct HTML injection.
   * @param {Array} cardGrid - An array of card objects from the JSON file.
   */
  function renderCardGrid(cardGrid) {
    // Use a DocumentFragment for better performance. It's a "lightweight" document
    // to hold all the new elements before appending them to the real DOM once.
    const fragment = document.createDocumentFragment();

    cardGrid.forEach((item) => {
      // Create the main container for the card
      const card = document.createElement('div');
      card.className = item.type; // e.g., "card"

      const content = item.content;
      const cardContent = document.createElement('div');
      cardContent.className = content.type; // e.g., "landingMenuItem"
      if (content.class) {
        cardContent.classList.add(...content.class.split(' ')); // Add classes like "page" or "last-item"
      }

      // If there's a link object, create the link element
      if (content.link) {
        const link = content.link;
        const linkElement = document.createElement('a');
        linkElement.href = link.href;
        linkElement.textContent = link.text; // Use textContent for security (prevents XSS)
        linkElement.className = link.class;
        linkElement.setAttribute('data-gallery', link.dataGallery);
        linkElement.setAttribute('aria-label', link.ariaLabel);
        cardContent.appendChild(linkElement);
      }

      // If there's a paragraph, handle it. It can be a string or an image object.
      if (content.paragraph) {
        if (typeof content.paragraph === 'object' && content.paragraph.type === 'image') {
          // Handle the special case for the image
          const img = document.createElement('img');
          img.src = content.paragraph.src;
          img.className = content.paragraph.class;
          img.alt = ''; // Decorative images should have empty alt text
          cardContent.appendChild(img);
        } else {
          // Handle a standard text paragraph
          const p = document.createElement('p');
          p.textContent = content.paragraph; // Use textContent for security
          cardContent.appendChild(p);
        }
      }

      card.appendChild(cardContent);
      fragment.appendChild(card);
    });

    // Clear any previous content and append the new, safely-built fragment
    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(fragment);
  }

  function renderPageContent(data, pageName) {
    // Set document and page titles
    const title = data.title || pageName.charAt(0).toUpperCase() + pageName.slice(1);
    document.title = `${title} | AEPaints`;
    if (pageTitleElement) {
      pageTitleElement.textContent = title;
    }

    // *** MODIFIED PART ***
    // Check for the new 'cardGrid' property in the JSON data
    if (data.cardGrid) {
      renderCardGrid(data.cardGrid);
    }
    // Fallback for the old method, if you still use it for other pages
    else if (data.contentHtml) {
      dynamicContentArea.innerHTML = data.contentHtml;
    }
    // Fallback for when no content is found
    else {
      dynamicContentArea.innerHTML = `<p>No content available for "${title}".</p>`;
    }

    dynamicContentArea.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadJsonContent(pageName, addToHistory = true) {
    const jsonFileName = `${pageName}.json`;
    const url = `/json-files/${jsonFileName}`;

    dynamicContentArea.innerHTML = '<p>Loading content...</p>';
    if (pageTitleElement) {
      pageTitleElement.textContent = '';
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${url}`);
      }
      const data = await response.json();

      renderPageContent(data, pageName);

      // Update navigation state
      navLinks.forEach((link) => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });
      const activeLink = document.querySelector(`.main-nav-menu a[data-page="${pageName}"]`);
      if (activeLink) {
        activeLink.classList.add('is-active');
        activeLink.setAttribute('aria-current', 'page');
      }

      if (dynamicPageWrapper) {
        dynamicPageWrapper.dataset.page = pageName;
      }

      // Update browser history
      if (addToHistory) {
        const title = data.title || pageName;
        history.pushState({ page: pageName, title: title }, title, `/${pageName}`);
      }
    } catch (error) {
      console.error(`Error loading JSON file for ${pageName}:`, error);
      dynamicContentArea.innerHTML = `<p>Error loading content for "${pageName}". Please try again.</p>`;
      document.title = `Error | AEPaints`;
      if (pageTitleElement) {
        pageTitleElement.textContent = `Error Loading Page`;
      }
    }
  }

  // Event listener for navigation clicks
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const pageName = event.target.dataset.page;
      if (pageName) {
        loadJsonContent(pageName);
      }
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    const statePage = event.state
      ? event.state.page
      : window.location.pathname.substring(1) || 'home';
    if (statePage) {
      loadJsonContent(statePage, false);
    }
  });

  // Initial page load logic
  const initialPath = window.location.pathname.substring(1);
  const initialPage = initialPath || 'home';

  loadJsonContent(initialPage, false).then(() => {
    const currentTitle = document.title;
    history.replaceState(
      { page: initialPage, title: currentTitle },
      currentTitle,
      `/${initialPage}`
    );

    const activeLink = document.querySelector(`.main-nav-menu a[data-page="${initialPage}"]`);
    if (activeLink) {
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');
    }

    if (dynamicPageWrapper) {
      dynamicPageWrapper.dataset.page = initialPage;
    }
  });
});
