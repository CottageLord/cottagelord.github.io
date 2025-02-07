document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadComponents();
        setupMenuButton();
        highlightCurrentPage();
    } catch (error) {
        console.error('Error in initialization:', error);
    }
});

function getComponentPath() {
    // Get the current path segments
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // If we're in a subdirectory (like /Projects/), we need to go back up
    const depth = segments.length;
    const componentPath = depth > 0 ? '../'.repeat(depth) + 'Components/' : './Components/';
    
    console.log('Current path:', path);
    console.log('Path segments:', segments);
    console.log('Directory depth:', depth);
    console.log('Component path:', componentPath);
    
    return componentPath;
}

function fixNavLinks() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
            // Remove the leading slash and adjust path based on current depth
            const newHref = getComponentPath() + '..' + href;
            link.href = newHref;
        }
    });
}

async function loadComponents() {
    try {
        const componentPath = getComponentPath();
        
        // Load header
        const headerResponse = await fetch(componentPath + 'header.html');
        if (!headerResponse.ok) {
            throw new Error(`Header fetch failed: ${headerResponse.status}`);
        }
        const headerHtml = await headerResponse.text();
        
        // Load footer
        const footerResponse = await fetch(componentPath + 'footer.html');
        if (!footerResponse.ok) {
            throw new Error(`Footer fetch failed: ${footerResponse.status}`);
        }
        const footerHtml = await footerResponse.text();
        
        // Insert components
        document.body.insertAdjacentHTML('afterbegin', headerHtml);
        document.body.insertAdjacentHTML('beforeend', footerHtml);
        
        // Set logo path
        const logoImg = document.getElementById('header-logo');
        if (logoImg) {
            logoImg.src = componentPath + 'logo.jpg';
        }
        
        // Fix navigation links
        fixNavLinks();
        
    } catch (error) {
        console.error('Error loading components:', error);
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = 'background: #ffebee; color: #c62828; padding: 10px; margin: 10px; border-radius: 4px;';
        errorMessage.innerHTML = `
            <p><strong>Error loading page components</strong></p>
            <p>Current path: ${window.location.pathname}</p>
            <p>Component path: ${getComponentPath()}</p>
            <p>Error details: ${error.message}</p>
        `;
        document.body.insertAdjacentElement('afterbegin', errorMessage);
    }
}

function highlightCurrentPage() {
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const section = link.getAttribute('data-section');
        link.style.fontWeight = 'normal';
        
        if ((currentPath.includes(section) && section !== 'home') || 
            (section === 'home' && (currentPath.endsWith('index.html') || 
             currentPath.endsWith('/')))) {
            link.style.fontWeight = 'bold';
        }
    });
}

function setupMenuButton() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
}