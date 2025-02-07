document.addEventListener('DOMContentLoaded', async function() {
    // Load Components
    await loadComponents();
    
    // Setup menu button functionality
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    menuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
});

async function loadComponents() {
    // Get the current directory depth
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length;
    
    // Calculate path to Components
    const componentPath = '../'.repeat(depth) + 'Components/';
    
    try {
        // Load header
        const headerResponse = await fetch(componentPath + 'header.html');
        const headerHtml = await headerResponse.text();
        document.body.insertAdjacentHTML('afterbegin', headerHtml);
        
        // Load footer
        const footerResponse = await fetch(componentPath + 'footer.html');
        const footerHtml = await footerResponse.text();
        document.body.insertAdjacentHTML('beforeend', footerHtml);
    } catch (error) {
        console.error('Error loading Components:', error);
    }
}