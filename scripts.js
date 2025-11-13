document.addEventListener("DOMContentLoaded", () => {
    // Load and render projects if on projects page
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
        console.log('Timeline container found, loading projects...');
        loadProjects();
    } else {
        console.log('No timeline container found, skipping project loading');
    }

    // Accordion functionality
    const accordionTriggers = document.querySelectorAll(".accordion-trigger")
  
    accordionTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const content = trigger.nextElementSibling
        const isExpanded = trigger.getAttribute("aria-expanded") === "true"
  
        // Toggle the current accordion
        trigger.setAttribute("aria-expanded", !isExpanded)
        content.classList.toggle("active")
  
        // Optional: Close other accordions when opening one
        if (!isExpanded) {
          accordionTriggers.forEach((otherTrigger) => {
            if (otherTrigger !== trigger && otherTrigger.getAttribute("aria-expanded") === "true") {
              otherTrigger.setAttribute("aria-expanded", "false")
              otherTrigger.nextElementSibling.classList.remove("active")
            }
          })
        }
      })
    })

    // Initialize accordions to be closed
    accordionTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
      // Make sure no accordion starts with the active class
      trigger.nextElementSibling.classList.remove("active");
    });

    // Function to adjust the timeline line height
  function adjustTimelineLine() {
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineLine = document.querySelector('.timeline-line');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineContainer && timelineLine && timelineItems.length > 0) {
      // Get the last timeline item
      const lastItem = timelineItems[timelineItems.length - 1];
      
      // Calculate the total height needed
      const lastItemBottom = lastItem.offsetTop + lastItem.offsetHeight;
      const containerTop = timelineContainer.offsetTop;
      
      // Set the height to cover all items plus some padding
      const totalHeight = (lastItemBottom - containerTop) + 50;
      timelineLine.style.height = totalHeight + 'px';
    }
  }
  
  // Run on load after projects are rendered
  setTimeout(adjustTimelineLine, 500);
  
  // Also run on window resize
  window.addEventListener('resize', adjustTimelineLine);
});

// Load projects from JSON and render them
async function loadProjects() {
    try {
        // Get the directory of the current page
        const currentPath = window.location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '';
        const jsonPath = basePath + '/projects.json';
        
        console.log('Loading projects...', {
            currentPath,
            basePath,
            jsonPath
        });
        
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.status} ${response.statusText}`);
        }
        const projects = await response.json();
        
        const timelineContainer = document.querySelector('.timeline-container');
        if (!timelineContainer) return;
        
        // Clear existing projects (keep timeline-line)
        const existingItems = timelineContainer.querySelectorAll('.timeline-item');
        existingItems.forEach(item => item.remove());
        
        // Render each project
        projects.forEach((project, index) => {
            const projectElement = createProjectElement(project, index);
            timelineContainer.appendChild(projectElement);
        });
        
        // Adjust timeline line after rendering
        setTimeout(() => {
            adjustTimelineLine();
        }, 100);
    } catch (error) {
        console.error('Error loading projects:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            url: window.location.href
        });
        // Fallback: show error message
        const timelineContainer = document.querySelector('.timeline-container');
        if (timelineContainer) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.cssText = 'padding: 2rem; text-align: center; color: #ff6b6b;';
            errorMsg.innerHTML = `
                <p><strong>Failed to load projects</strong></p>
                <p>Error: ${error.message}</p>
                <p>Please check the browser console for details.</p>
            `;
            timelineContainer.appendChild(errorMsg);
        }
    }
}

// Create a project card element
function createProjectElement(project, index) {
    const article = document.createElement('article');
    article.className = 'timeline-item';
    
    // Alternate position if not specified
    const position = project.position || (index % 2 === 0 ? 'right' : 'left');
    
    article.innerHTML = `
        <div class="timeline-marker" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-primary">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
            </svg>
        </div>
        <time class="timeline-date mobile" datetime="${project.date}">${project.dateDisplay}</time>
        <div class="timeline-content ${position}">
            <div class="project-card">
                ${project.image ? `
                <div class="project-image">
                    <img src="${project.image}" alt="${project.imageAlt || project.title}" loading="lazy">
                </div>
                ` : ''}
                <div class="card-header">
                    <time class="timeline-date desktop" datetime="${project.date}">${project.dateDisplay}</time>
                    <h3>${escapeHtml(project.title)}</h3>
                    <p class="project-description">${escapeHtml(project.description)}</p>
                </div>
                <div class="card-content">
                    <p class="project-long-description">
                        ${escapeHtml(project.longDescription)}
                    </p>
                    <div class="badge-container" role="list">
                        ${project.technologies.map(tech => 
                            `<span class="badge ${tech.color}" role="listitem">${escapeHtml(tech.name)}</span>`
                        ).join('')}
                    </div>
                </div>
                <footer class="card-footer">
                    ${project.links.code ? `
                    <a href="${project.links.code}" target="_blank" rel="noopener noreferrer" class="button outline small">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                            <path d="M9 18c-4.51 2-5-2-7-2"></path>
                        </svg>
                        <span>Code</span>
                    </a>
                    ` : ''}
                    ${project.links.document ? `
                    <a href="${project.links.document}" target="_blank" rel="noopener noreferrer" class="button primary small">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        <span>View Document</span>
                    </a>
                    ` : ''}
                    ${project.links.demo ? `
                    <a href="${project.links.demo}" target="_blank" rel="noopener noreferrer" class="button primary small">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span>Watch Demo</span>
                    </a>
                    ` : ''}
                </footer>
            </div>
        </div>
    `;
    
    return article;
}

// Helper function to escape HTML (prevent XSS)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Function to adjust the timeline line height
function adjustTimelineLine() {
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineLine = document.querySelector('.timeline-line');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineContainer && timelineLine && timelineItems.length > 0) {
        const lastItem = timelineItems[timelineItems.length - 1];
        const lastItemBottom = lastItem.offsetTop + lastItem.offsetHeight;
        const containerTop = timelineContainer.offsetTop;
        const totalHeight = (lastItemBottom - containerTop) + 50;
        timelineLine.style.height = totalHeight + 'px';
    }
}
