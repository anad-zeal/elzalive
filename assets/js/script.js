/**
 * assets/js/script.js
 * Combined Router, Page Renderer, and Contact Form Logic
 */

const DEBUG = true;
const log = (...args) => DEBUG && console.log('[AEP]', ...args);

// --- Globals ---
const scrollMemory = {};
// We assume your HTML has a <main> tag where content is injected.
// If you use an ID like <div id="app">, change 'main' to '#app'.
const targetContainer = document.querySelector('main') || document.body;
let siteData = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  log('Initializing site application...');

  // 1. Fetch Data
  fetch('/json-files/site-data.json')
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load site data');
      return response.json();
    })
    .then((data) => {
      siteData = data;
      // 2. Handle Initial Load (Current URL)
      handleRoute(window.location.pathname);
    })
    .catch((err) => console.error(err));

  // 3. Intercept Clicks for SPA Navigation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href.startsWith(window.location.origin) && !link.hash) {
      e.preventDefault();
      const path = link.getAttribute('href');
      history.pushState(null, '', path);
      handleRoute(path);
    }
  });

  // 4. Handle Back/Forward Buttons
  window.addEventListener('popstate', () => {
    handleRoute(window.location.pathname);
  });
});

/**
 * Determines which page to load based on URL path
 */
function handleRoute(path) {
  if (!siteData) return;

  // Clean path (remove leading slash)
  let pageKey = path.replace(/^\//, '') || 'home';

  // Normalize mappings if needed (e.g. /contact-us -> contact)
  if (pageKey === 'index.php' || pageKey === 'index.html') pageKey = 'home';

  const pageData = siteData.pages[pageKey];

  if (!pageData) {
    log('Page not found:', pageKey);
    // Optional: Render 404 here
    return;
  }

  log('Rendering page:', pageKey, pageData.type);

  // Dispatcher
  switch (pageData.type) {
    case 'contactForm':
      renderContactForm(pageData);
      break;
    case 'cardGrid':
      renderCardGrid(pageData);
      break;
    case 'slideshow':
      renderSlideshow(pageData);
      break;
    case 'contentSection':
      renderContentSection(pageData);
      break;
    default:
      console.warn('Unknown page type:', pageData.type);
  }
}

/**
 * Helper: Fades out content, runs callback, fades in
 */
function fadeSwap(container, updateCallback) {
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.3s ease';

  setTimeout(() => {
    updateCallback();
    // Force reflow/browser paint
    void container.offsetWidth;
    container.style.opacity = '1';
  }, 300);
}

// --- Render Functions ---

/**
 * Renders the Contact Form
 * FIX: Now correctly extracts nested content and uses wrapperTags (fieldset)
 */
function renderContactForm(pageData) {
  // FIX: Extract the actual content object from the page data
  const formData = pageData.content;

  // Safety check
  if (!formData) {
    console.error('Contact form content is missing in JSON');
    return;
  }

  const sectionWrapper = document.createElement(formData.wrapper.tag || 'div');
  if (formData.wrapper.attributes) {
    Object.entries(formData.wrapper.attributes).forEach(([k, v]) =>
      sectionWrapper.setAttribute(k, v)
    );
  }

  const formEl = document.createElement(formData.form.tag || 'form');
  if (formData.form.attributes) {
    Object.entries(formData.form.attributes).forEach(([k, v]) => formEl.setAttribute(k, v));
  }

  // Render Headers (H3, H4)
  (formData.form.headers || []).forEach((header) => {
    const h = document.createElement(header.tag);
    h.textContent = header.text;
    formEl.appendChild(h);
  });

  // Render Fields
  if (formData.fields) {
    formData.fields.forEach((fieldData) => {
      // Create Wrapper (fieldset)
      const wrapperEl = document.createElement(fieldData.wrapperTag || 'div');

      // Create Input/Textarea/Button
      const inputEl = document.createElement(fieldData.tag);

      if (fieldData.text) inputEl.textContent = fieldData.text; // For buttons

      if (fieldData.attributes) {
        Object.entries(fieldData.attributes).forEach(([k, v]) => inputEl.setAttribute(k, v));
      }

      wrapperEl.appendChild(inputEl);
      formEl.appendChild(wrapperEl);
    });
  }

  sectionWrapper.appendChild(formEl);

  fadeSwap(targetContainer, () => {
    targetContainer.innerHTML = '';
    targetContainer.appendChild(sectionWrapper);
  });
}

/**
 * Placeholder for Card Grid (Home/Artworks)
 */
function renderCardGrid(pageData) {
  const gridDiv = document.createElement('div');
  gridDiv.className = 'card-grid-container'; // Make sure this class exists in CSS or use inline styles

  // Title
  const title = document.createElement('h1');
  title.textContent = pageData.title;
  targetContainer.innerHTML = ''; // Clear immediately for now (or use fadeSwap)
  targetContainer.appendChild(title);

  // Cards
  if (pageData.content) {
    pageData.content.forEach((item) => {
      // Simplified card rendering logic
      const card = document.createElement('div');
      card.className = 'card';

      const linkData = item.content.link;
      const pData = item.content.paragraph;

      const html = `
                <a href="${linkData.href}" class="${linkData.class}" aria-label="${linkData.ariaLabel}">
                    <h3>${linkData.text}</h3>
                </a>
                <p>${pData}</p>
            `;
      card.innerHTML = html;
      gridDiv.appendChild(card);
    });
  }

  fadeSwap(targetContainer, () => {
    targetContainer.appendChild(gridDiv);
  });
}

/**
 * Placeholder for Slideshow
 */
function renderSlideshow(pageData) {
  fadeSwap(targetContainer, () => {
    targetContainer.innerHTML = `<h1>${pageData.title}</h1><p>Slideshow loading from ${pageData.gallerySource}...</p>`;
    // Logic to load specific slideshow script would go here
  });
}

/**
 * Placeholder for Standard Content (Biography)
 */
function renderContentSection(pageData) {
  const content = pageData.content;
  const article = document.createElement(content.tag);
  if (content.attributes) {
    Object.entries(content.attributes).forEach(([k, v]) => article.setAttribute(k, v));
  }

  const title = document.createElement('h1');
  title.textContent = pageData.title;
  article.appendChild(title);

  content.paragraphs.forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    article.appendChild(p);
  });

  fadeSwap(targetContainer, () => {
    targetContainer.innerHTML = '';
    targetContainer.appendChild(article);
  });
}
