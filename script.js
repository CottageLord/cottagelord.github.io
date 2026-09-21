document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadComponents();
        setupMenuButton();
        highlightCurrentPage();
        setupZhTooltips();
    } catch (error) {
        console.error('Error in initialization:', error);
    }
});

const KNOWN_PAGES = ['index.html', 'research.html', 'coding.html', 'notes.html', 'life.html'];

// Top-level pages live under /zh/. Deeper pages (e.g. project detail pages) keep their
// Chinese translation as a "<name>_zh.html" sibling right next to the English original.
function getLanguageInfo() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const isZhSite = segments.length > 0 && segments[0].toLowerCase() === 'zh';
    let fileName = isZhSite ? (segments[1] || 'index.html') : (segments[segments.length - 1] || 'index.html');
    if (!fileName.toLowerCase().endsWith('.html')) {
        fileName = 'index.html';
    }
    const isZhDeepPage = !isZhSite && fileName.toLowerCase().endsWith('_zh.html');
    const isZh = isZhSite || isZhDeepPage;
    return { isZh, isZhSite, isZhDeepPage, fileName };
}

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
    const { isZh } = getLanguageInfo();
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        let href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
            // Keep in-language navigation inside /zh/ once we're on a Chinese page
            if (isZh && link.hasAttribute('data-section') && !href.startsWith('/zh/')) {
                href = '/zh' + href;
            }
            // Remove the leading slash and adjust path based on current depth
            const newHref = getComponentPath() + '..' + href;
            link.href = newHref;
        }
    });
}

function translateChrome() {
    const { isZh } = getLanguageInfo();
    if (!isZh) return;

    const navLabels = {
        home: '首页',
        research: '科研',
        coding: '编程',
        notes: '笔记与绘画',
        life: '生活与烹饪'
    };
    document.querySelectorAll('.nav-links a[data-section]').forEach(link => {
        const label = navLabels[link.getAttribute('data-section')];
        if (label) {
            link.textContent = label;
        }
    });
    const cvLink = document.querySelector('.nav-links a:not([data-section])');
    if (cvLink) {
        cvLink.textContent = '下载简历';
    }

    document.querySelectorAll('.single-footer-widget h6').forEach(h6 => {
        const text = h6.textContent.trim();
        if (text === 'About Me') h6.textContent = '关于我';
        if (text === 'Follow Me') h6.textContent = '关注我';
    });
    const footerText = document.querySelector('.footer-text');
    if (footerText) {
        footerText.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = node.textContent
                    .replace('Copyright ©', '版权所有 ©')
                    .replace('All rights reserved', '保留所有权利');
            }
        });
    }
}

function setupLanguageSwitch() {
    const logoImg = document.getElementById('header-logo');
    if (!logoImg) return;
    const switchTarget = logoImg.closest('.logo') || logoImg;

    switchTarget.style.cursor = 'pointer';
    switchTarget.title = 'Click to switch language / 点击切换语言';

    switchTarget.addEventListener('click', function() {
        const { isZh, isZhSite, fileName } = getLanguageInfo();
        let destination;

        if (KNOWN_PAGES.includes(fileName)) {
            // Top-level site page: toggle between root and /zh/
            destination = isZhSite ? '/' + fileName : '/zh/' + fileName;
        } else if (isZh) {
            // Deep Chinese page (e.g. Projects/.../Foo_zh.html) -> same-folder English original
            destination = fileName.replace(/_zh\.html$/i, '.html');
        } else if (fileName.toLowerCase().endsWith('.html')) {
            // Deep English page -> same-folder "_zh" sibling
            destination = fileName.replace(/\.html$/i, '_zh.html');
        } else {
            return;
        }

        const message = isZh
            ? 'Switch to the English version of this page?\n切换到英文版页面？'
            : 'Switch to the Chinese version of this page?\n切换到中文版页面？';

        if (window.confirm(message)) {
            window.location.href = destination;
        }
    });
}

// Lets .zh-tip elements show a translation tooltip on hover (PC) and on tap (touch),
// since touch devices have no hover state.
function setupZhTooltips() {
    if (document.body.dataset.zhTipInit) return;
    document.body.dataset.zhTipInit = 'true';

    document.addEventListener('click', function(e) {
        const tip = e.target.closest('.zh-tip');
        document.querySelectorAll('.zh-tip.zh-tip-active').forEach(el => {
            if (el !== tip) el.classList.remove('zh-tip-active');
        });
        if (tip) {
            tip.classList.toggle('zh-tip-active');
            e.stopPropagation();
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

        // Translate chrome (nav/footer) and wire up the logo language switch
        translateChrome();
        setupLanguageSwitch();

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