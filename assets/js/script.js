document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');

  // JSON → HTML converter
  function jsonToHtml(data) {
    let html = '';

    data.forEach((block) => {
      switch (block.type) {
        case 'heading':
          html += `<h2>${block.text}</h2>`;
          break;

        case 'subheading':
          html += `<h3>${block.text}</h3>`;
          break;

        case 'paragraph':
          html += `<p>${block.text}</p>`;
          break;

        case 'image':
          html += `<figure>
                    <img src="${block.src}" alt="${block.alt || ''}">
                    ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}
                  </figure>`;
          break;

        case 'list':
          html += '<ul>';
          block.items.forEach((item) => {
            html += `<li>${item}</li>`;
          });
          html += '</ul>';
          break;

        case 'button':
          html += `<button>${block.text}</button>`;
          break;

        default:
          console.warn('Unknown block type:', block);
      }
    });

    return html;
  }

  // Load JSON and render as HTML
  async function loadJsonContent(pageName) {
    const jsonFileName = `${pageName}.json`;

    try {
      const response = await fetch(`/json-files/${jsonFileName}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // Convert JSON to HTML
      dynamicContentArea.innerHTML = jsonToHtml(data);

      // Update active nav link
      navLinks.forEach((link) => link.classList.remove('is-active'));
      const activeLink = document.querySelector(`.main-nav-menu a[data-page="${pageName}"]`);
      if (activeLink) activeLink.classList.add('is-active');
    } catch (error) {
      console.error(`Error loading JSON for ${pageName}:`, error);
      dynamicContentArea.innerHTML = `<p>Error loading content for "${pageName}".</p>`;
    }
  }

  // Navigation link clicks
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const pageName = event.target.dataset.page;
      if (pageName) loadJsonContent(pageName);
    });
  });

  // Load initial page (e.g., home)
  const initialPage = window.location.pathname.substring(1) || 'home';
  loadJsonContent(initialPage);
});
