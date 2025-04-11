document.addEventListener("DOMContentLoaded", () => {
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
  
  // Run on load
  setTimeout(adjustTimelineLine, 100); // Small delay to ensure DOM is fully loaded
  
  // Also run on window resize
  window.addEventListener('resize', adjustTimelineLine);
});
  