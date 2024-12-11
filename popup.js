document.addEventListener('DOMContentLoaded', function() {
    // Wrap in async function to use await
    async function init() {
      try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        const results = await chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: getSEOMarkup
        });
        displayResults(results);
      } catch (err) {
        console.error('Failed to execute script:', err);
        document.getElementById('markup-container').innerHTML = 
          '<p>Error: Could not analyze page. Make sure you\'re on a web page.</p>';
      }
    }
    
    init();
  });
  
  function getSEOMarkup() {
    const seoElements = {
      headings: [],
      meta: [],
      links: []
    };
  
    // Get all headings
    ['h1', 'h2', 'h3'].forEach(tag => {
      document.querySelectorAll(tag).forEach(element => {
        seoElements.headings.push({
          tag: tag,
          content: element.textContent.trim()
        });
      });
    });
  
    // Get meta description and title
    const metaDescription = document.querySelector('meta[name="description"]');
    const title = document.querySelector('title');
    
    if (metaDescription) {
      seoElements.meta.push({
        tag: 'meta[description]',
        content: metaDescription.getAttribute('content')
      });
    }
    
    if (title) {
      seoElements.meta.push({
        tag: 'title',
        content: title.textContent
      });
    }
  
    // Get canonical link
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      seoElements.links.push({
        tag: 'canonical',
        content: canonical.getAttribute('href')
      });
    }
  
    return seoElements;
  }
  
  function displayResults(results) {
    const container = document.getElementById('markup-container');
    if (!results?.[0]?.result) {
      container.innerHTML = '<p>Unable to analyze page</p>';
      return;
    }
  
    const markup = results[0].result;
    let html = '';
  
    // Display headings
    if (markup.headings.length > 0) {
      html += '<h3>Headings</h3>';
      markup.headings.forEach(item => {
        html += `
          <div class="markup-item">
            <span class="tag-name">${item.tag}:</span>
            <span>${item.content}</span>
          </div>
        `;
      });
    }
  
    // Display meta information
    if (markup.meta.length > 0) {
      html += '<h3>Meta Information</h3>';
      markup.meta.forEach(item => {
        html += `
          <div class="markup-item">
            <span class="tag-name">${item.tag}:</span>
            <span>${item.content}</span>
          </div>
        `;
      });
    }
  
    // Display links
    if (markup.links.length > 0) {
      html += '<h3>Links</h3>';
      markup.links.forEach(item => {
        html += `
          <div class="markup-item">
            <span class="tag-name">${item.tag}:</span>
            <span>${item.content}</span>
          </div>
        `;
      });
    }
  
    container.innerHTML = html || '<p>No SEO markup found</p>';
  }