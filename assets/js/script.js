document.addEventListener('DOMContentLoaded', () => {
  // Your code here runs only after the DOM has fully loaded

  // Example: select the right elements
  const buttons = document.querySelectorAll('button');
  const links = document.querySelectorAll('a');

  // Example behavior — simple console message
  console.log('DOM fully loaded and parsed.');

  // Example event listener

  // Example utility function
  function initializePage() {
    alert('Initializing page logic…');
    // put your initialization code here
  }

  // Initialize your page logic
  initializePage();
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (event) => {
      alert('Link Clicked');
    });
  });
});
